require.config({
    baseUrl: 'app',

    paths: {
        'jquery': '/vendor/jquery/dist/jquery',
        'handlebars': '/vendor/handlebars/handlebars',
        'ember': '/vendor/ember/ember',

        'ehbs': '/vendor/requirejs-ember-handlebars/ehbs',
        'text': '/vendor/requirejs-text/text',

        'highcharts': '/vendor/highcharts/highcharts',

        'bootstrap': '/vendor/bootstrap/dist/js/bootstrap.min',
        'underscore': '/vendor/underscore/underscore'
    },

    shim: {
        'bootstrap': {
            deps: [ 'jquery' ]
        },
        'ember': {
            deps:[ 'jquery', 'handlebars' ],
            exports: 'Ember'
        },
        'highcharts': {
            deps: [ 'jquery' ],
            exports: 'Highcharts'
        },
        'underscore': {
            exports: '_'
        }
    },

    ehbs: {
        extension: 'hbs',
        templatePath: 'templates/',
        ember: 'ember'
    }
});
