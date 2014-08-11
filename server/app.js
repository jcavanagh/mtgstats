//Hack the NODE_PATH
//https://gist.github.com/branneman/8048520
process.env.NODE_PATH = '.';
require('module').Module._initPaths();

var _ = require('underscore');

//Nconf setup
var nconf = require('nconf');
nconf.file('config.json');

//Express
var express = require('express'),
    bodyParser = require('body-parser');

var app = express();
app.use(bodyParser());

//App pieces
var wiz = require('./data/wizards/index.js');

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

app.listen(process.env.PORT || 8080);
