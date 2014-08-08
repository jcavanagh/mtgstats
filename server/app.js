var fs = require('fs'),
    nconf = require('nconf'),
    req = require('request').defaults({jar: true}),
    vm = require('vm');

//Nconf setup
nconf.file('config.json');

//Wizards "security" garbage
var WizSec = {};
vm.runInNewContext(fs.readFileSync('wizards-security.js'), WizSec);

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

function parseEvents() {
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
        for(var evt in events) {
            var evt = events[0];
            req.post(eventDetailUrl + evt.id, function(error, resp, body) {
                var myEvt = evt,
                    eventDetailData = JSON.parse(body).Data.Value;

                //Parse event details
                arr = eventDetailExp.exec(eventDetailData);

                if(arr) {
                    myEvt.geolocation = arr[5].trim();
                    myEvt.results = {
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
                        console.log(arr);
                        myEvt.results.matches.push({
                            result: arr[1].trim(),
                            points: arr[2].trim(),
                            opponent: arr[3].trim(),
                        });
                    }
                }

                console.log(myEvt);
            });
        }
    });
}

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
        //Authenticated, parse events
        parseEvents();
    });
});