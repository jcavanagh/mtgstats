/* global _, exports */
var db = require('db'),
    nconf = require('nconf');

var dciNumber = nconf.get('dciNumber');

//Generic things
exports.getEvents = function(query, callback) {
    //Optional query
    if(_.isFunction(query)) {
        callback = query;
        query = {};
    }

    query.dciNumber = dciNumber;

    db.find(query).toArray(callback);
};

exports.extractMatches = function(events) {
    var matches = _.reduce(events, function(memo, evt) {
        if(!evt.results) {
            console.log(evt);
            return memo;
        }

        return memo.concat(evt.results.matches);
    }, []);

    return matches;
};

exports.extractMatchStats = function(matches) {
    var wins, losses, draws, byes;
    wins = losses = draws = byes = 0;

    _.each(matches, function(match) {
        switch(match.result) {
            case 'Win':
                wins++;
                break;
            case 'Loss':
                losses++;
                break;
            case 'Draw':
                draws++;
                break;
            case 'Bye':
                byes++;
                break;
        }
    });

    return [ wins, losses, draws, byes ];
};

//Event helpers
exports.getEventsByFormat = function(callback) {
    this.getEvents(function(err, events) {
        var formatEvents = _.groupBy(events, function(evt) {
            return evt.results.format;
        });

        callback(err, formatEvents);
    });
};

exports.getEventsByOpponent = function(callback) {
    this.getEvents(function(err, events) {
        var oppEvents = {};
        _.each(events, function(evt) {
            if(evt.results) {
                _.each(evt.results.matches, function(match) {
                    var opp = match.opponent;
                    oppEvents[opp] = oppEvents[opp] || [];
                    oppEvents[opp].push(evt);
                });
            }
        });

        //Strip duplicates
        var uniqEvents = _.object(
            _.keys(oppEvents),
            _.map(_.values(oppEvents), function(matches) {
                return _.uniq(matches);
            })
        );

        callback(err, uniqEvents);
    });
};

//Match helpers
exports.getAllMatchStats = function(callback) {
    var me = this;
    me.getEvents(function(err, events) {
        var stats = me.extractMatchStats(me.extractMatches(events));

        callback(err, stats);
    });
};

exports.getMatchesByFormat = function(callback) {
    var me = this;
    me.getEventsByFormat(function(err, events) {
        //Get matches for each event type
        var formatMatches = _.object(
            _.keys(events),
            _.map(_.keys(events), function(evtType) {
                return me.extractMatches(events[evtType]);
            })
        );

        callback(err, formatMatches);
    });
};

//Win/loss stats
exports.getMatchStatsByFormat = function(callback) {
    var me = this;
    me.getMatchesByFormat(function(err, matches) {
        //Get stats for each set of matches
        var formatMatchStats = _.object(
            _.keys(matches),
            _.map(_.keys(matches), function(evtType) {
                return me.extractMatchStats(matches[evtType]);
            })
        );

        callback(err, formatMatchStats);
    });
};

exports.getMatchStatsByOpponent = function(callback) {
    var me = this;
    me.getEventsByOpponent(function(err, events) {
        var oppMatchStats = _.object(
            _.keys(events),
            _.map(_.keys(events), function(opp) {
                //For all events, extract the matches played vs this person
                var matches = [];
                _.each(events[opp], function(evt) {
                    if(evt.results) {
                        matches = matches.concat(
                            _.filter(evt.results.matches, function(match) {
                                return match.opponent == opp;
                            })
                        );
                    }
                });

                return me.extractMatchStats(matches);
            })
        );

        callback(err, oppMatchStats);
    });
};