var events = require('analytics/event/event.js');

module.exports = [{
    route: '/data/event/all',
    method: 'get',
    fn: function(req, res, next) {
        events.getEvents(function(err, results) {
            res.send({
                error: err,
                data: results
            });
        });
    }
}];