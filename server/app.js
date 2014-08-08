var req = require('request');

//Wizards requests
var urlbase = 'http://www.wizards.com/Magic/PlaneswalkerPoints/JavaScript/GetPointsHistory/',
    dci = '1202386509',
    //Matches - 1: event ID, 2: Event description, 3: Event location
    events = /data-summarykey="(\d+)"[\s\S]+?HistoryPanelHeaderLabel Description">(.+?)<[\s\S]+?HistoryPanelHeaderLabel Location">(?:<a.+?>)?(.+?)</g;

req.post(urlbase + dci, function(error, resp, body) {
    var data = JSON.parse(body).Data[1].Value,
        arr;

    while((arr = events.exec(data)) !== null) {
        console.log(arr[1], arr[2], arr[3]);
    }
});
