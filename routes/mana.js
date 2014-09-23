var lands = require('data/mana/lands'),
    landMath = require('analytics/mana/lib');

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
    route: '/analytics/mana/stats',
    method: 'post',
    fn: function(req, res, next) {
        res.send({
            error: null,
            data: landMath.optimize(req.body)
        });
    }
}];
