var async = require('async'),
    lib = require('./lib');

exports.getAllMatchStats = function(callback) {
    lib.getMatches(function(err, matches) {
        async.series([
            async.apply(lib.getMatchRecord.bind(lib), matches),
            async.apply(lib.getMatchWinRate.bind(lib), matches)
        ], function(err, results) {
            callback(err, results);
        });
    });
};