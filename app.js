//Hack the NODE_PATH
//https://gist.github.com/branneman/8048520
process.env.NODE_PATH = '.';
require('module').Module._initPaths();

//Global underscore
GLOBAL._ = require('underscore');

//Nconf setup
var nconf = require('nconf');
nconf.file('config.json');

//Express
var express = require('express'),
    bodyParser = require('body-parser');

var app = express();
app.use(bodyParser());

app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use('/vendor', express.static(__dirname + '/bower_components'));

//App
app.get('/', function(req, res, next) {
    res.render('index');
});

//Data
var wiz = require('data/match/wizards.js'),
    analytics = require('analytics/match/lib.js');

app.get('/data/match/wizards', function(req, res, next) {
    wiz.get(function(err, results) {
        res.send({
            error: err,
            data: results
        });
    });
});

app.get('/data/match/wizards/sync', function(req, res, next) {
    wiz.sync(function(err, results) {
        res.send({
            error: err,
            data: results
        });
    });
});

//Analytics
app.get('/analytics/match/all', function(req, res, next) {
    analytics.getAllMatchStats(function(err, stats) {
        res.send({
            error: err,
            data: stats
        });
    });
});

app.get('/analytics/match/format', function(req, res, next) {
    analytics.getMatchStatsByFormat(function(err, stats) {
        res.send({
            error: err,
            data: stats
        });
    });
});

app.get('/analytics/match/opponent', function(req, res, next) {
    analytics.getMatchStatsByOpponent(function(err, stats) {
        res.send({
            error: err,
            data: stats
        });
    });
});

app.listen(process.env.PORT || 8080);
