require.config({
    baseUrl: 'app',

    paths: {
        'jquery': '/vendor/jquery/dist/jquery',
        'handlebars': '/vendor/handlebars/handlebars',
        'ember': '/vendor/ember/ember',

        'ehbs': '/vendor/requirejs-ember-handlebars/ehbs',
        'text': '/vendor/requirejs-text/text',

        'highcharts': '/vendor/highcharts/highcharts'
    },

    shim: {
        'highcharts': {
            deps: [ 'jquery' ],
            exports: 'Highcharts'
        },

        'ember': {
            deps:[ 'jquery', 'handlebars' ],
            exports: 'Ember'
        }
    },

    ehbs: {
        extension: 'hbs',
        templatePath: 'templates/',
        ember: 'ember'
    }
});
