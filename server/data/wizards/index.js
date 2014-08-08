var async = require('async'),
    fs = require('fs'),
    nconf = require('nconf'),
    req = require('request').defaults({jar: true}),
    vm = require('vm');

//Wizards "security" garbage
var WizSec = {};
vm.runInNewContext(fs.readFileSync('lib/wizards-security.js'), WizSec);

//Wizards requests
var authEncryptUrl = 'http://www.wizards.com/Magic/PlaneswalkerPoints/Login/GetEncryptValues',
    authUrl = 'http://www.wizards.com/Magic/PlaneswalkerPoints/Login/Login',
    eventsUrl = 'http://www.wizards.com/Magic/PlaneswalkerPoints/JavaScript/GetPointsHistory/',
    eventDetailUrl = 'http://www.wizards.com/Magic/PlaneswalkerPoints/JavaScript/GetEventSummary/',
    dciNumber = nconf.get('dciNumber'),
    dciPassword = nconf.get('dciPassword'),
    eventsExp = new RegExp(
        //Event ID
        'data-summarykey="(\\d+)"[\\s\\S]+?' +
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
        'Seasonal:<\\/b>([\\s\\S]+?)<[\\s\\S]+?' +
        'Lifetime:<\\/b>([\\s\\S]+?)<'
    ),
    eventMatchDetailExp = new RegExp(
        'MatchResult">([\\s\\S]+?)<[\\s\\S]+?' +
        'MatchPoints">([\\s\\S]+?)<[\\s\\S]+?' +
        'MatchOpponent">([\\s\\S]+?)<',
        'g'
    );

function parseEvents(callback) {
    //Get events
    req.post(eventsUrl + dciNumber, function(error, resp, body) {
        var eventData = JSON.parse(body).Data[1].Value,
            events = [],
            arr;

        while((arr = eventsExp.exec(eventData)) !== null) {
            events.push({
                id: arr[1],
                description: arr[2],
                location: arr[3]
            });
        }

        //Get event details
        async.map(events, function(evt, mapCb) {
            req.post(eventDetailUrl + evt.id, function(error, resp, body) {
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
                        seasonalPoints: arr[7].trim(),
                        lifetimePoints: arr[8].trim(),
                        matches: []
                    };

                    //Parse matches
                    while((arr = eventMatchDetailExp.exec(eventDetailData)) !== null) {
                        evt.results.matches.push({
                            result: arr[1].trim(),
                            points: arr[2].trim(),
                            opponent: arr[3].trim(),
                        });
                    }
                }

                //Done!
                mapCb(null, evt);
            });
        }, function(err, results) {
            callback(err, results);
        });
    });
}

function authenticate(callback) {
    //Authenticate and parse events
    req.post(authEncryptUrl, function(error, resp, body) {
        var cryptoData = JSON.parse(body).ModalData.ResponseData;

        //Encrypt auth like their servers want it
        WizSec.setMaxDigits(131);

        var keyPair = new WizSec.RSAKeyPair(cryptoData[0], '', cryptoData[1]),
            username = new Buffer(dciNumber).toString('base64'),
            password = new Buffer(dciPassword).toString('base64'),
            encStr = WizSec.encryptedString(keyPair, cryptoData[2] + '\\' + username + '\\' + password),
            authForm = {
                IsModalResult: true,
                Result: 'custom',
                ModalContent: null,
                RedirectUrl: null,
                ReloadPageAfterModal: false,
                ModalData: {
                    Parameters: {},
                    HelperFuncParameters: null,
                    ResponseData: cryptoData
                },
                CloseFunction: null,
                HelperFunction: null,
                Parameters: {
                    encrypted: encStr,
                    rememberMe: false
                }
            };

        //This thing wants form headers but a JSON body
        req.post({
            url: authUrl,
            headers: {
                'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: JSON.stringify(authForm)
        }, function(error, resp, body) {
            if(resp.statusCode == 200) {
                callback(null, null);
            } else {
                //Non-2xx response code
                callback('Failed to authenticate with WOTC', null);
            }
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
            callback(results);
        });
    }
};