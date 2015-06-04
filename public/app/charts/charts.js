/* global $,_ */
import can from 'can/can';
import template from './charts.stache!';

/**
 * Charts View
 * 
 * @author Joe Cavanagh
 */
export default can.Control.extend({
    init: function() {
        this.element.html(template());

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
        $.get('/analytics/match/all', function(stats) {
            var winData = stats.data;

            $('#matchStatsContainer').append('<div class="col-md-12"></div>');
            $('#matchStatsContainer > div:nth-of-type(1)').highcharts(_.extend(chartTemplate, {
                title: {
                    text: ''
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
        });

        //Format match stats
        $.get('/analytics/match/format', function(stats) {
            var formatData = stats.data;

            //Sort by most-played formats
            formatData = _.pairs(formatData).sort(function(a, b) {
                var aSum = _.reduce(a[1], function(sum, item) {
                        return sum + item;
                    }),
                    bSum = _.reduce(b[1], function(sum, item) {
                        return sum + item;
                    });

                return bSum - aSum;
            });

            _.each(formatData, function(item, index) {
                var formatName = item[0],
                    formatStats = item[1];

                $('#formatStatsContainer').append('<div class="col-md-4"></div>');
                $('#formatStatsContainer > div:nth-of-type(' + (index + 1) + ')').highcharts(_.extend(chartTemplate, {
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

        //Opponent match stats
        $.get('/analytics/match/opponent', function(stats) {
            var opponentData = stats.data;

            //Sort by top X most-played opponents, filter single-match opponents
            opponentData = _.chain(opponentData)
                .omit(function(val) {
                    return val.length <= 1;
                })
                .omit('BYE')
                .pairs()
                .sort(function(a, b) {
                    var aSum = _.reduce(a[1], function(sum, item) {
                            return sum + item;
                        }),
                        bSum = _.reduce(b[1], function(sum, item) {
                            return sum + item;
                        });

                    return bSum - aSum;
                })
                .take(10)
                .value();

            _.each(opponentData, function(item, index) {
                var oppName = item[0],
                    opponentStats = item[1];

                $('#opponentStatsContainer').append('<div class="col-md-4"></div>');
                $('#opponentStatsContainer > div:nth-of-type(' + (index + 1) + ')').highcharts(_.extend(chartTemplate, {
                    title: {
                        text: oppName
                    },
                    series: [{
                        type: 'pie',
                        data: [
                            [ 'Wins', opponentStats[0] ],
                            [ 'Losses', opponentStats[1] ],
                            [ 'Draws', opponentStats[2] ],
                            [ 'Byes', + opponentStats[3] ]
                        ]
                    }]
                }));
            });
        });
    }
});
