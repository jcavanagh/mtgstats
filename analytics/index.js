/* global exports */
var async = require('async'),
    lib = require('./lib');

exports.getMatchStats = function(callback) {
    lib.getAllMatchStats(callback);
};

exports.getMatchStatsByFormat = function(callback) {
    lib.getMatchStatsByFormat(callback);
};

exports.getMatchStatsByOpponent = function(callback) {
    lib.getMatchStatsByOpponent(callback);
};