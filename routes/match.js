var personal = require('data/match/personal.js');
var metagame = require('data/match/metagame.js');
var db = require('db/db');

module.exports = [{
    route: '/data/match/personal/sync',
    method: 'get',
    fn: function(req, res, next) {
        personal.sync(function(err, results) {
            res.send({
                error: err,
                data: results
            });
        });
    }
},{
    route: '/data/metagame/find',
    method: 'get',
    fn: function(req, res, next) {
        if(req.params && req.params.query) {
            db.metagame.find(req.params.query, function(err, stats) {
                res.send({
                    error: err,
                    data: stats
                });
            });
        } else {
            res.status(400);
            res.send('Please include a mongodb query in the request');
        }
    }
},{
    route: '/data/personal/find',
    method: 'get',
    fn: function(req, res, next) {
        if(req.params && req.params.query) {
            db.personal.find(req.params.query, function(err, stats) {
                res.send({
                    error: err,
                    data: stats
                });
            });
        } else {
            res.status(400);
            res.send('Please include a mongodb query in the request');
        }
    }
}];
