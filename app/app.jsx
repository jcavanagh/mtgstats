import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import $ from 'jquery';
import _ from 'lodash';
import highcharts from 'highcharts';
// import bootstrap from 'bootstrap';

//Classes
import Header from './views/header.jsx';
import Charts from './views/personal_charts.jsx';
// import Tracking from './tracking/tracking';

let store = createStore((state, action) => {
	//TODO: Actions
	return state;
});

//Init app
class App extends React.Component {
	render() {
		return (
			<Provider store={store}>
				<Header />
			</Provider>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));
