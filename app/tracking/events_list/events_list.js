import template from './events_list.stache!';

export default can.Control.extend({
	init: function() {
		var self = this;
		var events = new can.List();

		this.fetch().then(function(events) {
			var events = _.sortBy(events.data, 'eventDate').reverse();
			self.element.html(template({
				events: events
			}));
		});
	},

	fetch: function() {
		return can.ajax('/data/event/all');
	}
});