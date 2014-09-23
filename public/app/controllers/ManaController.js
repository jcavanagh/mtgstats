/* global Ember */
if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Charts controller
 * 
 * @class
 * @author Joe Cavanagh
 */
define([], function() {
    MTGS.LandCheckbox = Ember.Checkbox.extend({
        selectedLandsBinding: 'parentView.selectedLands',

        checked: function () {
            var selectedLands = this.get('selectedLands');
            return selectedLands.contains(this.get('content'));
        }.property('content', 'lands.@each'),

        click: function (evt) {
            var isPresent = this.get('checked'),
                selectedLands = this.get('selectedLands'),
                land = this.get('content');

            console.log("land = ", land);
            console.log("will be: ", isPresent ? "removed" : "added");

            if (!isPresent) {
                selectedLands.pushObject(land);
            } else {
                selectedLands.removeObject(land);
            }
        }
    });

    MTGS.ManaCheckboxView = Ember.CollectionView.extend({
        contentBinding: 'MTGS.ManaController.lands',
        selectedLandsBinding: 'MTGS.ManaController.selectedLands',
        tagName: 'ul',
        itemViewClass: Ember.View.extend({
            selectedLandsBinding: 'parentView.selectedLands',
            templateName: 'lands'
        })
    });

    MTGS.ManaController = Ember.Controller.extend({
        lands: function() {
            var me = this;
            Ember.$.get('/data/mana/lands', function(lands) {
                me.set('lands', lands.data);
            });
        }.property('lands.@each'),

        selectedLands: [],

        submitAction: function() {
            console.log('Submit!');
        }
    });
});
