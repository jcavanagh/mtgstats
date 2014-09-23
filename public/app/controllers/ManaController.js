/* global Ember */
if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Charts controller
 * 
 * @class
 * @author Joe Cavanagh
 */
define([], function() {
    MTGS.LandColors = ['W', 'U', 'B', 'R', 'G'];
    MTGS.Turns = _.range(1, 10);

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

            if (isPresent) {
                selectedLands.pushObject(land);
            } else {
                selectedLands.removeObject(land);
            }
        }
    });

    MTGS.RulesView = Ember.CollectionView.extend({
        itemViewClass: Ember.View.extend({
            templateName: '_rules'
        }),

        emptyView: Ember.View.extend({
            template: Ember.Handlebars.compile("The collection is empty")
        })
    });

    MTGS.ManaCheckboxView = Ember.CollectionView.extend({
        contentBinding: 'MTGS.ManaController.lands',
        selectedLandsBinding: 'MTGS.ManaController.selectedLands',
        tagName: 'div',
        itemViewClass: Ember.View.extend({
            selectedLandsBinding: 'parentView.selectedLands',
            templateName: '_lands'
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
        model: {
            rules: [],
            white: null,
            blue: null,
            black: null,
            red: null,
            green: null,
            landCount: 24
        },

        actions: {
            submit: function() {
                //Assemble model
                var model = this.get('model');
                model.lands = this.selectedLands;

                //Post!
                Ember.$.post('/analytics/mana/stats', model);
            },

            addRule: function() {
                this.get('model.rules').pushObject({
                    count: 0,
                    color: null,
                    turn: null
                });
            },

            deleteRule: function() {
                debugger;
            }
        }
    });
});
