var wiz = require('data/match/wizards.js'),
analytics = require('analytics/match/lib.js');

module.exports = [{
    route: '/data/match/wizards',
    method: 'get',
    fn: function(req, res, next) {
        wiz.get(function(err, results) {
            res.send({
                error: err,
                data: results
            });
        });
    }
},{
    route: '/data/match/wizards/sync',
    method: 'get',
    fn: function(req, res, next) {
        wiz.sync(function(err, results) {
            res.send({
                error: err,
                data: results
            });
        });
    }
},{
    route: '/analytics/match/all',
    method: 'get',
    fn: function(req, res, next) {
        analytics.getAllMatchStats(function(err, stats) {
            res.send({
                error: err,
                data: stats
            });
        });
    }
},{
    route: '/analytics/match/format',
    method: 'get',
    fn: function(req, res, next) {
        analytics.getMatchStatsByFormat(function(err, stats) {
            res.send({
                error: err,
                data: stats
            });
        });
    }
},{
    route: '/analytics/match/opponent',
    method: 'get',
    fn: function(req, res, next) {
        analytics.getMatchStatsByOpponent(function(err, stats) {
            res.send({
                error: err,
                data: stats
            });
        });
    }
}];
