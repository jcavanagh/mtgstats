/* global _, Ember*/
require([
    'require',
    'ember',
    'highcharts',
    'bootstrap',
    'lodash'
], function(require) {
    //Create app
    window.MTGS = Ember.Application.create({
        LOG_ACTIVE_GENERATION: true,
        LOG_VIEW_LOOKUPS: true,
        LOG_TRANSITIONS: true
    });

    MTGS.deferReadiness();

    require([
        'controllers',
        'templates',
        'views'
    ], function() {
        MTGS.Router.map(function() {
            this.resource('charts', { path: '/charts' });
            this.resource('mana', { path: '/mana' });
        });

        MTGS.advanceReadiness();
    });
});