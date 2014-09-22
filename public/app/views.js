if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Views
 * 
 * @author Joe Cavanagh
 */
define([
    'views/ChartsView'
], function(ChartsView) {
    MTGS['ChartsView'] = ChartsView;
});
