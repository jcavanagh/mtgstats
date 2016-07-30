var webpack = require('webpack');
var path = require('path');

var PUBLIC_PATH = path.resolve(__dirname, 'public')
var BUILD_DIR = path.join(PUBLIC_PATH, 'build');
var APP_DIR = path.join(PUBLIC_PATH, 'app');

var config = {
	entry: [
		'webpack-dev-server/client?http://0.0.0.0:3000',
		'webpack/hot/only-dev-server',
		APP_DIR + '/app.jsx'
	],
	output: {
		path: BUILD_DIR,
		publicPath: PUBLIC_PATH,
		filename: 'bundle.js'
	},
	module: {
		loaders: [{
			test: /\.jsx?/,
			include: APP_DIR,
			loaders: [ 'react-hot', 'babel' ]
		},{
			test: require.resolve('react'),
			loader: 'expose?React'
		}]
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery"
		})
	],
	devServer: {
		proxy: {
			'/data/*': {
				target: 'http://localhost:8081'
			}
		}
	}
};

module.exports = config;