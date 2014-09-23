if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Describes the available lands
 * 
 * @author Joe Cavanagh
 */
define([], function() {
    return [{
        name: 'Plains',
        color: 'W',
        tapped: 'false',
        scry: 'false',
        pain: 'false',
        shock: 'false'
    },{
        name: 'Island',
        color: 'U',
        tapped: 'false',
        scry: 'false',
        pain: 'false',
        shock: 'false'
    },{
        name: 'Swamp',
        color: 'B',
        tapped: 'false',
        scry: 'false',
        pain: 'false',
        shock: 'false'
    },{
        name: 'Mountain',
        color: 'R',
        tapped: 'false',
        scry: 'false',
        pain: 'false',
        shock: 'false'
    },{
        name: 'Forest',
        color: 'G',
        tapped: 'false',
        scry: 'false',
        pain: 'false',
        shock: 'false'
    }]
});
