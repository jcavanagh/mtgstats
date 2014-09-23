var stats = require('analytics/lib');

function getCombos(items) {
    var combos = [];
    var temp = null;
    var letLen = Math.pow(2, items.length);

    for (var i = 0; i < letLen; i++) {
        temp = [];
        for (var j = 0; j < items.length; j++) {
            if ((i & Math.pow(2, j))) {
                temp.push(items[j]);
            }
        }
        if (temp.length) {
            combos.push(temp);
        }
    }

    return combos;
}

exports.optimize = function(dataz) {
    var lands = dataz.lands || [],
        landCount = dataz.landCount || 0,
        rules = dataz.rules || [],
        w = dataz.white || 0,
        u = dataz.blue || 0,
        b = dataz.black || 0,
        r = dataz.red || 0,
        g = dataz.green || 0;

    //Generate all combinations of selected lands
    var landCombos = getCombos(lands);

    _.each(landCombos, function(combo) {
        //Generate distributions of selected lands
    });
};