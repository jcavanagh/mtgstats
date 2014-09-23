var lands = require('data/mana/lands');

module.exports = [{
    route: '/data/mana/lands',
    method: 'get',
    fn: function(req, res, next) {
        res.send({
            error: null,
            data: lands
        });
    }
}];
