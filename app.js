const express = require('express')
const app = express();
const firebase = require('firebase');
const config = require('./config')
const service = require('./service')
app.get('/', function (req, res) {
    res.sendFile('./index.html');

});
app.get('/receiver', (request, response) => {
    var can = false;
    if (request.query.binid && request.query.bin) {
        service.checkLastStatus(request.query.binid, request.query.bin).then(function (data) {
            var binId = request.query.binid;
            var status = request.query.bin;
            var message = ''

            // console.log(((data.val()) ? ((data.val()[binId]) ? (data.val()[binId].status != status) : true) : true))
            function call() {
                if (request.query.bin == 'haft')
                    request.query.bin = 'half'
                service.addBin(request.query.binid, request.query.bin)
                service.saveLog(request.query.binid, request.query.bin)
            }
            // if (data.val()) {
            //     if (data.val().status) {
            //         if (data.val().status != status) {
            //             console.log('update bin ' + binId + ' ' + data.val().status + ' to ' + status)
            //             call()
            //         }
            //     }
            //     else {
            //         console.log('new record')
            //         call()
            //     }
            // }
            // else {
            //     console.log('init')
            //     call()
            // }

            data.val() ?
                (data.val().status) ?
                    (data.val().status == status) ? null
                        : call()
                    : call()
                : call()

            // if (data.val()) {
            //     if (data.val().status) {
            //         if (data.val().status != status) {
            //             console.log('update bin ' + binId + ' ' + data.val().status + ' to ' + status)
            //             call()
            //         }
            //     }
            //     else {
            //         console.log('new record')
            //         call()
            //     }
            // }
            // else {
            //     console.log('init')
            //     call()
            // }
        });
    }
    response.send(can)
});

app.get('/query', (request, response) => {
    service.query().then(function (snapshot) {
        response.send(snapshot.val())
    });
});

app.get('/logs', (request, response) => {
    // service.query().then(function (snapshot) {
    //     var keys= Object.keys(snapshot.val().logs)
    //     var obj = snapshot.val().logs['-LB6Ko3WFEuT2yxEy4rB']
    //     response.send(obj)
    //     // response.send(snapshot.val().logs)
    // });


    service.logs().then(function (snapshot) {
        var keys = Object.keys(snapshot.val())
        var p = snapshot.val()
        var list = []
        //Object.keys(x).length
        for (var key in p) {
            if (p.hasOwnProperty(key)) {
                if (p[key].id == request.query.id)
                    list.push(p[key]);
            }
        }

        response.send(list)
        // response.send(snapshot.val())
    })

});

app.get('/addGeographicCoordinates', (request, response) => {
    if (request.query.binId && request.query.lat && request.query.lng) {
        service.addGeographicCoordinates(request.query.binId, request.query.lat, request.query.lng);
    }
});

app.listen(80, () => console.log('this app listening on port 80!'))