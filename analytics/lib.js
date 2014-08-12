var db = require('db'),
    nconf = require('nconf');

var dciNumber = nconf.get('dciNumber');

/**
 * Gets all played events for a DCI number
 */
exports.getEvents = function(query, callback) {
    //Optional query
    if(_.isFunction(query)) {
        callback = query;
        query = {};
    }

    query.dciNumber = dciNumber;

    db.find(query).toArray(callback);
};

/**
 * Gets the set of all matches for a DCI number
 */
exports.getMatches = function(callback) {
    this.getEvents(function(err, events) {
        var matches = _.compact(
            _.map(events, function(evt) {
                if(!evt.results) {
                    console.log(evt);
                    return null;
                }

                return evt.results.matches;
            })
        );

        callback(err, matches);
    });
};

/**
 * Computes the win/loss/draw/byes for a set of matches
 */
exports.getMatchRecord = function(matches, callback) {
    var wins, losses, draws, byes;
    wins = losses = draws = byes = 0;

    _.each(matches, function(match) {
        _.each(match, function(game) {
            switch(game.result) {
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
    });

    callback(null, [ wins, losses, draws, byes ]);
};
