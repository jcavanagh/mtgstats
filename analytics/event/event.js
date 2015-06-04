/* global _, exports */
var db = require('db');
var nconf = require('nconf');

var dciNumber = nconf.get('dciNumber');

exports.getEvents = function(query, callback) {
    //Optional query
    if(_.isFunction(query)) {
        callback = query;
        query = {};
    }

    query.dciNumber = dciNumber;

    db.find(query).toArray(callback);
};