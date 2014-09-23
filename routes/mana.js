var lands = require('data/mana/lands'),
    landMath = require('analytics/mana/');

module.exports = [{
    route: '/data/mana/lands',
    method: 'get',
    fn: function(req, res, next) {
        res.send({
            error: null,
            data: lands
        });
    }
},{
    route: '/data/mana/stats',
    method: 'post',
    fn: function(req, res, next) {
        console.log(req);
        res.send({
            error: null,
            data: {}
        });
    }
}];
