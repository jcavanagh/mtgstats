/* global Ember */
if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Charts controller
 * 
 * @class
 * @author Joe Cavanagh
 */
define([], function() {
    return Ember.Controller.extend({
        lands: function() {
            var me = this;
            Ember.$.get('/data/mana/lands', function(lands) {
                me.set('lands', lands.data);
            });
        }.property('lands.@each')
    });
});
