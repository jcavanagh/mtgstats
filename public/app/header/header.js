import can from 'can/can';
import template from './header.stache!';

export default can.Control.extend({
	init: function() {
		this.element.html(template());
	}
});