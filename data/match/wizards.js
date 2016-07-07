var async = require('async'),
    db = require('db'),
    fs = require('fs'),
    nconf = require('nconf'),
    req = require('request').defaults({ jar: true }),
    qs = require('qs'),
    vm = require('vm'),
    libxml = require('libxmljs');

//FIXME: Node rejects WotC's certificate for some reason, overriding the check
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

//Wizards SAML garbage
var WizSec = {
    jQuery: req,
    qs: qs,
    libxml: libxml
};

vm.runInNewContext(fs.readFileSync('lib/wizards-security.js'), WizSec);

//Wizards requests
var authUrl = 'http://www.wizards.com/Magic/PlaneswalkerPoints/Login/Login',
    eventsUrl = 'http://www.wizards.com/Magic/PlaneswalkerPoints/JavaScript/GetPointsHistory/',
    eventDetailUrl = 'http://www.wizards.com/Magic/PlaneswalkerPoints/JavaScript/GetEventSummary/',
    dciNumber = nconf.get('dciNumber'),
    dciUsername = nconf.get('dciUsername'),
    dciPassword = nconf.get('dciPassword'),
    eventsExp = new RegExp(
        //Event ID
        'data-summarykey="(\\d+)"[\\s\\S]+?' +
        //Event Date
        'HistoryPanelHeaderLabel Date">(.+?)<[\\s\\S]+?' +
        //Event Description
        'HistoryPanelHeaderLabel Description">(.+?)<[\\s\\S]+?' +
        //Event Location
        'HistoryPanelHeaderLabel Location">(?:<a.+?>)?(.+?)<',
        'g'
    ),
    eventDetailExp = new RegExp(
        'EventType">[\\s\\S]+?\\/b>(.+?)<[\\s\\S]+?' +
        'EventMultiplier">[\\s\\S]+?\\/b>(.+?)<[\\s\\S]+?' +
        'EventPlayers">[\\s\\S]+?\\/b>(.+?)<[\\s\\S]+?' +
        'EventFormat">[\\s\\S]+?\\/b>(.+?)<[\\s\\S]+?' +
        'EventLocation">[\\s\\S]+?\\/b>(.+?)<[\\s\\S]+?' +
        'EventPlace">[\\s\\S]+?\\/b>(.+?)<[\\s\\S]+?' +
        'Lifetime:<\\/b>([\\s\\S]+?)<'
    ),
    eventMatchDetailExp = new RegExp(
        'MatchResult">([\\s\\S]+?)<[\\s\\S]+?' +
        'MatchPoints">([\\s\\S]+?)<[\\s\\S]+?' +
        'MatchOpponent">([\\s\\S]+?)<',
        'g'
    );

function parseEvents(callback) {
    console.log('Parsing WOTC events...');

    //Get events
    req.post(eventsUrl + dciNumber, function(error, resp, body) {
        var eventData = JSON.parse(body).Data[1].Value,
            events = [],
            arr;

        while((arr = eventsExp.exec(eventData)) !== null) {
            events.push({
                dciNumber: dciNumber,
                eventId: arr[1],
                eventDate: arr[2],
                description: arr[3],
                location: arr[4]
            });
        }

        //Get event details
        async.map(events, function(evt, mapCb) {
            req.post(eventDetailUrl + evt.eventId, function(error, resp, body) {
                var eventDetailData = JSON.parse(body).Data.Value;

                //Parse event details
                arr = eventDetailExp.exec(eventDetailData);

                if(arr) {
                    evt.geolocation = arr[5].trim();
                    evt.results = {
                        type: arr[1].trim(),
                        pointsMultiplier: arr[2].trim(),
                        players: arr[3].trim(),
                        format: arr[4].trim(),
                        place: arr[6].trim(),
                        pwPoints: arr[7].trim(),
                        matches: []
                    };

                    //Parse matches
                    var matchArr;
                    var round = 1;
                    while((matchArr = eventMatchDetailExp.exec(eventDetailData)) !== null) {
                        evt.results.matches.push({
                            round: round,
                            result: matchArr[1].trim(),
                            points: matchArr[2].trim().replace(/[\(\)]/g,''),
                            opponent: matchArr[3].trim() || 'BYE',
                            format: evt.results.format
                        });

                        round++;
                    }
                }

                //Done!
                mapCb(null, evt);
            });
        }, function(err, results) {
            console.log('Events parsed! Results:', results.length)
            callback(err, results);
        });
    });
}

function authenticate(callback) {
    console.log('Authenticating with WOTC...');

    var username = dciUsername;
    var password = dciPassword;
    
    //FIXME: Do I want this?
    //WizSec.dropSession();

    //Third arg is whether to fetch remember me token or not
    //Fourth arg is whether to set results in ESSO cookies or not
    WizSec.authenticate(username, password, true, true, function(resp) {
        req.post(authUrl, {
            body: JSON.stringify({
                Parameters: {
                    token: WizSec.authenticateEntity.getSAMLToken().SAMLTokenValue
                }
            }),
        }, function(error, resp, body) {
            callback(null, null);
        });
    });
}

module.exports = {
    get: function(callback) {
        //Execute all the things
        async.series([
            authenticate,
            parseEvents
        ], function(err, results) {
            callback(err, results[1]);
        });
    },

    sync: function(callback) {
        var me = this;

        db.personal.remove({ dciNumber: dciNumber }, function(err, results) {
            if(err) {
                console.log('Error removing records for ID:', dciNumber);
                callback(err, []);
            } else {
                me.get(function(err, results) {
                    db.personal.insert(results, function(err, results) {
                        if(err) {
                            callback(err, 'Sync failed!');
                        } else {
                            callback(err, 'Sync success!');
                        }
                    });
                });
            }
        });
    }
};