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
        var winData = stats.data[0];

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

        //All data
        Ember.$("#overallRecord").highcharts(_.extend(chartTemplate, {
            title: {
                text: 'Raw Match Stats'
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

        Ember.$("#winsDraws").highcharts(_.extend(chartTemplate, {
            title: {
                text: 'Wins (including draws)'
            },
            series: [{
                type: 'pie',
                data: [
                    [ 'Wins', winData[0] + winData[2] ],
                    [ 'Losses', winData[1] ],
                    [ 'Byes', + winData[3] ]
                ]
            }]
        }));

        Ember.$("#winsDrawsByes").highcharts(_.extend(chartTemplate, {
            title: {
                text: 'Record (including draws and byes)'
            },
            series: [{
                type: 'pie',
                data: [
                    [ 'Wins', winData[0] + winData[2] + winData[3] ],
                    [ 'Losses', winData[1] ]
                ]
            }]
        }));
    });
});