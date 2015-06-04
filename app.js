//Hack the NODE_PATH
//https://gist.github.com/branneman/8048520
process.env.NODE_PATH = '.';
require('module').Module._initPaths();

//Global underscore
GLOBAL._ = require('lodash');

//Nconf setup
var nconf = require('nconf');
nconf.file('config.json');

//Express
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser());

//Serve the public dir and bower_components
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

//Routes
var loadRoutes = function(routes) {
    _.each(routes, function(rte) {
        app[rte.method](rte.route, rte.fn);
    });
}

var matchRoutes = require('routes/match');
var manaRoutes = require('routes/mana');
var eventRoutes = require('routes/event');

loadRoutes(matchRoutes);
loadRoutes(manaRoutes);
loadRoutes(eventRoutes);

//Fire it up
app.listen(process.env.PORT || 8081);
