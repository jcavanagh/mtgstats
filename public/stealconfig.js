System.config({
    transpiler: 'babel',

    paths: {
        can: 'bower_components/can/can.js',
        'can/*': 'bower_components/can/*.js',
        lodash: 'bower_components/lodash/lodash.min.js',
        jquery: 'bower_components/jquery/dist/jquery.min.js',
        highcharts: 'bower_components/highcharts/highcharts.js',
        bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.min.js'
    },

    map: {
        'jquery/jquery': 'jquery'
    },

    meta: {
        jquery: {
            format: 'global',
            exports: '$'
        },
        highcharts: {
            deps: [
                'jquery'
            ]
        },
        lodash: {
            format: 'global',
            exports: '_'
        }
    },

    ext: {
        stache: 'bower_components/can/view/stache/system'
    }
});
