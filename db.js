var mongo = require('mongoskin'),
    nconf = require('nconf');

var host = nconf.get('DB_HOST') || 'localhost',
    port = nconf.get('DB_PORT') || '27017',
    db = mongo.db('mongodb://' + host + ':' + port + '/mtgstats'),

//Let's try one collection for now
mtgstats = db.collection('mtgstats');

module.exports = mtgstats;