require([
    'ember',
    'ehbs!index'
], function(e, indexTpl) {
    //Create app
    window.MTGS = Ember.Application.create({
        LOG_ACTIVE_GENERATION: true,
        LOG_VIEW_LOOKUPS: true,
        LOG_TRANSITIONS: true
    });
});