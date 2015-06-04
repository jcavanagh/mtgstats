import _ from 'lodash';
import highcharts from 'highcharts';
import bootstrap from 'bootstrap';

//Controls
import Header from './header/header';
import Charts from './charts/charts';
import Tracking from './tracking/tracking';

//Init controls
new Header('#header');
new Charts('#charts');
new Tracking('#tracking');