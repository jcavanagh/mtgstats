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
app.use(express.static(__dirname + '/bower_components'));

//App
app.get('/', function(req, res, next) {
    res.render('index');
});

//Data
var wiz = require('data/wizards/index.js'),
    analytics = require('analytics/index.js');

app.get('/data/wizards', function(req, res, next) {
    wiz.get(function(err, results) {
        res.send({
            error: err,
            data: results
        });
    });
});

app.get('/data/wizards/sync', function(req, res, next) {
    wiz.sync(function(err, results) {
        res.send({
            error: err,
            data: results
        });
    });
});

//Analytics
app.get('/analytics/matchstats', function(req, res, next) {
    analytics.getAllMatchStats(function(err, stats) {
        res.send({
            error: err,
            data: stats
        });
    });
});

app.listen(process.env.PORT || 8080);
