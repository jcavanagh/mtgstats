var async = require('async'),
    db = require('db'),
    fs = require('fs'),
    req = require('request').defaults({ jar: true }),
    q = require('q'),
    vm = require('vm'),
    _ = require('lodash'),
    moment = require('moment'),
    cheerio = require('cheerio'),
    cloudscraper = require('cloudscraper');

var ID_PREFIX = 'scg_';

//Params should include:
// - id
function getUrl(params) {
    return _.template('http://sales.starcitygames.com/deckdatabase/displaydeck.php?DeckID=${id}')(params);
}

function getState(callback) {
    db.mtgstats.findOneAndUpdate({
        _id: '_scg_state'
    },{
        $setOnInsert: {
            failed: [],
            //Failed due to premium paywall - can recheck these later with auth
            failed_premium: [],
            //This is where SCG IDs seem to begin - 2608
            last_complete: 2607,
            //We know there's data up until this point - keep trying past any holes
            dont_stop_before: 105251,
            max_consec_fail: 5
        }
    },{
        upsert: true
    }, function(err, state) {
        if(err) {
            console.log('Error getting state', err);
        }

        //If upsert, we won't get a value back right away
        if(state && state.value) {
            callback(err, state.value);
        } else {
            db.mtgstats.findOne({
                _id: '_scg_state'
            }, function(err, state) {
                callback(err, state);
            });
        }
    });
}

function setState(update, callback) {
    db.mtgstats.findOneAndUpdate({
        _id: '_scg_state'
    },
    update,
    function(err, state) {
        if(err) {
            console.log('Error setting state', err);
        }

        if(_.isFunction(callback)) {
            callback(err, state);
        }
    });
}

function scg_id(id) {
    return ID_PREFIX + id;
}

function get(id, callback) {
    //See if we already have this ID
    db.metagame.findOne({ _id: scg_id(id) }, function(err, item) {
        if(err) {
            console.error('Failed to retrieve record for ID:', id);
        } else if(item) {
            callback(null, item);
        } else {
            fetchDeck(id, callback);
        }
    });
}

function fetchDeck(id, callback) {
    var url = getUrl({ id: id });

    cloudscraper.get(url, function(err, response, body) {
        if(err || response.statusCode !== 200 || !body) {
            setState({
                $push: {
                    failed: {
                        id: id,
                        err: JSON.stringify(err)
                    }
                }
            }, function(err, newState) {
                callback('Failed to retrieve SCG deck ID:', id);
            });
        } else {
            var $ = cheerio.load(body);

            var isValid = $('.cards_col1').get().length > 0;
            var isPremium = $('.premiumtitletext').get().length > 0;

            //Parse decklist and deck metadata
            if(isValid) {
                var mainDeck = $('.cards_col1 > ul > li, .cards_col2 > ul > li').map(parseDecklistItem).toArray();
                var sideboard = $('.deck_sideboard > ul > li').map(parseDecklistItem).toArray();
                var deckName = $('.deck_title a').text();
                var format = $('.deck_format').text();
                var playerName = $('.player_name a').text();
                var place = (_.get($('.deck_played_placed').contents(), '[0].data') || '').replace(/[a-zA-Z\s]/g, '');
                var eventName = $('.deck_played_placed a').text();
                var eventLink = $('.deck_played_placed a').attr('href');
                var eventDate = (_.get($('.deck_played_placed').contents(), '[2].data') || '').replace(/[on\s]/g, '');

                //Insert new record
                db.metagame.insert({
                    _id: scg_id(id),
                    source: {
                        name: 'scg',
                        id: id,
                        url: url
                    },
                    mainDeck: mainDeck,
                    sideboard: sideboard,
                    format: format,
                    deckName: deckName,
                    playerName: playerName,
                    event: {
                        place: place,
                        name: eventName,
                        link: eventLink,
                        date: eventDate
                    }
                }, function(err, result) {
                    if(err) {
                        console.log('Insert error:', err, result);

                        setState({
                            $push: {
                                failed: {
                                    id: id,
                                    err: JSON.stringify(err)
                                }
                            }
                        }, function() {
                            //Update state and return what we inserted
                            setState({ 
                                $set: {
                                    last_complete: id
                                }
                            }, function(err, newState) {
                                callback(err, result.ops[0]);
                            });
                        });
                    } else {
                        //Update state and return what we inserted
                        setState({ 
                            $set: {
                                last_complete: id
                            }
                        }, function(err, newState) {
                            callback(err, result.ops[0]);
                        });
                    }
                });
            } else if(isPremium) {
                setState({
                    $set: {
                        last_complete: id
                    },
                    $push: {
                        failed_premium: {
                            id: id,
                            err: 'Need premium auth'
                        }
                    }
                }, function(err, newState) {
                    callback('missing_premium', null);
                });
            } else {
                setState({
                    $set: {
                        last_complete: id
                    },
                    $push: {
                        failed: {
                            id: id,
                            err: 'No decklist present in page'
                        }
                    }
                }, function(err, newState) {
                    callback('missing', null);
                });
            }
        }
    });
}

function parseDecklistItem(idx, el) {
    return {
        name: (_.get(this, 'children[1].children[0].data') || 'Unknown Name').trim(),
        img: (_.get(this, 'children[1].attribs.rel') || '').trim(),
        link: (_.get(this, 'children[1].attribs.href') || '').trim(),
        qty: parseInt((_.get(this, 'children[0].data') || '').trim(), 10)
    }
}
module.exports = {
    get: function(id, callback) {
        //Execute all the things, ensuring we create our state first
        getState(function() {
            get(id, callback);
        });
    },

    sync: function(callback) {
        var me = this;
        var consecFail = 0;
        var syncStart;
        var syncEnd;
        var state;

        getState(function(err, initialState) {
            state = initialState;

            async.whilst(function() {
                return (consecFail < state.max_consec_fail) || (!syncEnd || syncEnd < parseInt(state.dont_stop_before, 10));
            }, function(cb) {
                getState(function(err, newState) {
                    state = newState;
                    syncStart = syncStart || state.last_complete;

                    var next = parseInt(state.last_complete, 10) + 1;
                    console.log('Fetching', next);
                    me.get(next, function(err, results) {
                        syncEnd = next;

                        //Error is stored in db, don't need to pass through here
                        if(err) {
                            consecFail++;
                            console.log('Failed:', err);
                            cb(null, results);
                        } else {
                            consecFail = 0;
                            console.log('Success!');
                            cb(null, results);
                        }
                    });
                });
            }, function(err, results) {
                callback(err, 'Records synced: ' + syncStart + ' to ' + syncEnd);
            });
        });
    }
};
