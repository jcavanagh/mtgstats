var mongo = require('mongoskin'),
    nconf = require('nconf');

var host = nconf.get('DB_HOST') || 'localhost',
    port = nconf.get('DB_PORT') || '27017',
    db = mongo.db('mongodb://' + host + ':' + port + '/mtgstats');

module.exports = {
	personal: db.collection('mtgstats-personal'),
	metagame: db.collection('mtgstats-metagame')
};