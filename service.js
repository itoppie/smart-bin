

const firebase = require('firebase');
const config = require('./config')
firebase.initializeApp(config.firebaseConfig);




exports.addBin = function (binId, status) {
    firebase.database().ref().child('/bins/' + binId).update({
        status: status,
        // history: {
        //     value: status,
        //     time: new Date()
        // }
    });
    // firebase.database().ref().child('/bins/' + binId).set({
    //     history: {
    //         value: status,
    //         timestamp: firebase.database.ServerValue.TIMESTAMP,
    //     }
    // });
}

exports.query = function () {

    return firebase.database().ref().once('value')
}
exports.logs = function () {
    var ref = firebase.database().ref('logs')
    var bin = ref//.orderByChild("id").equalTo(2)

    // ref.on('value', function (data) {
    //     console.log(data.val())
    // });
    return bin.once('value')

}
function addLog(binId, status) {
    var logRef = firebase.database().ref().child('/logs/').push();
    logRef.set({
        id: binId,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        status: status
    });
}
exports.checkLastStatus = function (binId, status) {
    // return firebase.database().ref().child('/bins').limitToLast(1).once('value')
      return firebase.database().ref().child('/bins').child(binId).once('value')

    // .then(function (data) {
    //     if (data.val()[binId]) {             
    //         return !(data.val()[binId].status == status)
    //     }
    //     return true;
    // });
}
exports.saveLog = function (binId, status) {
    // firebase.database().ref().child('/bins').limitToLast(1).once('value').then(function (data) {
    //     if (data.val()[binId]) {
    //         console.log(data.val()[binId].status, status)
    //         if (data.val()[binId].status == status) {
    //             //addLog(binId, status)
    //             console.log('สถาณะซ้ำ')
    //         }
    //         else {
    //             console.log('have id , status change')
    //             //addLog(binId,status)
    //             this.addBin()
    //         }
    //     }
    //     else {
    //         console.log('new bin')
    //         addLog(binId, status)
    //     }
    // })

    firebase.database().ref().child('/logs/').push({
        id: binId,
        time: firebase.database.ServerValue.TIMESTAMP,
        status: status
    });
}
exports.addGeographicCoordinates = function () {

}