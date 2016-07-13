var wiz = require('data/match/wizards.js');
var scg = require('data/match/scg.js');
var match = require('analytics/match/match.js');

module.exports = [{
    route: '/data/match/personal',
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
    route: '/data/match/personal/sync',
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
    route: '/data/match/metagame',
    method: 'get',
    fn: function(req, res, next) {
        scg.get(function(err, results) {
            res.send({
                error: err,
                data: results
            });
        });
    }
},{
    route: '/data/match/metagame/sync',
    method: 'get',
    fn: function(req, res, next) {
        scg.sync(function(err, results) {
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
        match.getAllMatchStats(function(err, stats) {
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
        match.getMatchStatsByFormat(function(err, stats) {
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
        match.getMatchStatsByOpponent(function(err, stats) {
            res.send({
                error: err,
                data: stats
            });
        });
    }
}];
