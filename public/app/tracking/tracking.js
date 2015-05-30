import can from 'can';
import template from './template';

export default can.Control.extend({
	init: function() {
		var viewModel = new can.Map({

		});

		this.element.html(template(viewModel));
	}
});