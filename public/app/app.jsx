import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import _ from 'lodash';
import highcharts from 'highcharts';
import bootstrap from 'bootstrap';

//Classes
import Header from './header/header';
import Charts from './charts/charts';
// import Tracking from './tracking/tracking';

//Init app
class App extends ReactComponent {
	render() {
		return (
			<Provider>
				<Header />
				<Charts />
			</Provider>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('#app'));
