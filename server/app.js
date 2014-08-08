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

app.listen(process.env.PORT || 8080);
