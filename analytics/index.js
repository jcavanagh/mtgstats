var async = require('async'),
    lib = require('./lib');

exports.getAllMatchStats = function(callback) {
    lib.getMatches(function(err, matches) {
        lib.getMatchRecord(matches, callback);
    });
};