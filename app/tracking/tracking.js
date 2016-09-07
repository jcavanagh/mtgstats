import can from 'can';
import template from './tracking.stache!';

import EventsList from './events_list/events_list';

export default can.Control.extend({
	init: function() {
		var viewModel = new can.Map({

		});

		this.element.html(template(viewModel));

		new EventsList(this.element.find('.eventsList'));
	}
});