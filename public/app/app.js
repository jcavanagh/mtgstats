require([
    'ember',
    'highcharts',
    'bootstrap',
    'underscore',
    'ehbs!index'
], function() {
    //Create app
    window.MTGS = Ember.Application.create({
        LOG_ACTIVE_GENERATION: true,
        LOG_VIEW_LOOKUPS: true,
        LOG_TRANSITIONS: true
    });

    //Ram some data in a chart
    Ember.$.get('/analytics/matchstats', function(stats) {
        var winData = stats.data;

        var chartTemplate = {
            tooltip: {
                pointFormat: '{point.percentage:.1f}%'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}:</b> {point.percentage:.1f}%'
                    }
                }
            }
        };

        Ember.$("#matchStats1").highcharts(_.extend(chartTemplate, {
            title: {
                text: 'All'
            },
            series: [{
                type: 'pie',
                data: [
                    [ 'Wins', winData[0] ],
                    [ 'Losses', winData[1] ],
                    [ 'Draws', winData[2] ],
                    [ 'Byes', + winData[3] ]
                ]
            }]
        }));

        Ember.$("#matchStats2").highcharts(_.extend(chartTemplate, {
            title: {
                text: 'Excluding draws'
            },
            series: [{
                type: 'pie',
                data: [
                    [ 'Wins', winData[0] ],
                    [ 'Losses', winData[1] ],
                    [ 'Byes', + winData[3] ]
                ]
            }]
        }));

        Ember.$("#matchStats3").highcharts(_.extend(chartTemplate, {
            title: {
                text: 'Excluding draws, counting byes'
            },
            series: [{
                type: 'pie',
                data: [
                    [ 'Wins', winData[0] + winData[3] ],
                    [ 'Losses', winData[1] ]
                ]
            }]
        }));
    });
});