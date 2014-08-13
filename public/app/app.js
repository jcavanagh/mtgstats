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

    //General match stats
    Ember.$.get('/analytics/matchstats', function(stats) {
        var winData = stats.data;

        Ember.$('#matchStatsContainer').append('<div class="col-md-4"></div>');
        Ember.$('#matchStatsContainer > div:nth-of-type(1)').highcharts(_.extend(chartTemplate, {
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

        Ember.$('#matchStatsContainer').append('<div class="col-md-4"></div>');
        Ember.$('#matchStatsContainer > div:nth-of-type(2)').highcharts(_.extend(chartTemplate, {
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

        Ember.$('#matchStatsContainer').append('<div class="col-md-4"></div>');
        Ember.$('#matchStatsContainer > div:nth-of-type(3)').highcharts(_.extend(chartTemplate, {
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

    //Format match stats
    Ember.$.get('/analytics/matchstats/format', function(stats) {
        var formatData = stats.data;

        //Sort by most-played formats
        formatData = _.pairs(formatData).sort(function(a, b) {
            return b[1].count - a[1].count;
        });

        _.each(formatData, function(item, index) {
            var formatName = item[0],
                formatStats = item[1];

            Ember.$('#formatStatsContainer').append('<div class="col-md-4"></div>');
            Ember.$('#formatStatsContainer > div:nth-of-type(' + (index + 1) + ')').highcharts(_.extend(chartTemplate, {
                title: {
                    text: formatName
                },
                series: [{
                    type: 'pie',
                    data: [
                        [ 'Wins', formatStats[0] ],
                        [ 'Losses', formatStats[1] ],
                        [ 'Draws', formatStats[2] ],
                        [ 'Byes', + formatStats[3] ]
                    ]
                }]
            }));
        });
    });
});