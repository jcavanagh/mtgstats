/* global _, exports */
var async = require('async'),
    db = require('db'),
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

exports.getMatches = function(events, callback) {
    var matches = _.reduce(events, function(memo, evt) {
        if(!evt.results) {
            console.log(evt);
            return memo;
        }

        return memo.concat(evt.results.matches);
    }, []);

    callback(null, matches);
};

exports.getMatchStats = function(matches, callback) {
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

    callback(null, [ wins, losses, draws, byes ]);
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
        var formatEvents = _.groupBy(events, function(evt) {
            return evt.results.format;
        });

        callback(err, formatEvents);
    });
};

//Match helpers
exports.getAllMatchStats = function(callback) {
    var me = this;
    me.getEvents(function(err, events) {
        me.getMatches(events, function(err, matches) {
            me.getMatchStats(matches, callback);
        });
    });
};

exports.getMatchesByFormat = function(callback) {
    var me = this;
    me.getEventsByFormat(function(err, events) {
        //Get matches for each event type
        async.map(_.keys(events), function(evtType, mapCb) {
            me.getMatches(events[evtType], function(err, matches) {
                mapCb(err, matches);
            });
        }, function(err, mapResult) {
            //Reassociate matches to event type
            var formatMatches = _.object(
                _.keys(events),
                mapResult
            );

            callback(err, formatMatches);
        });
    });
};

//Win/loss stats
exports.getMatchStatsByFormat = function(callback) {
    var me = this;
    me.getMatchesByFormat(function(err, matches) {
        //Get stats for each set of matches
        async.map(_.keys(matches), function(evtType, mapCb) {
            me.getMatchStats(matches[evtType], mapCb);
        }, function(err, mapResult) {
            //Reassociate match stats with formats
            var formatMatchStats = _.object(
                _.keys(matches),
                mapResult
            );

            callback(err, formatMatchStats);
        });
    });
};

exports.getMatchStatsByOpponent = function(callback) {
    this.getEvents(function(err, events) {
        var formatEvents = _.groupBy(events, function(evt) {
            return evt.results.format;
        });

        callback(err, formatEvents);
    });
};