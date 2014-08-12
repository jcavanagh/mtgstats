require([
    'ember',
    'highcharts',
    'ehbs!index',
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

        Ember.$("#overallRecord").highcharts({
            chart: {},
            title: {
                text: 'Raw Match Stats'
            },
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
        });
    });
});