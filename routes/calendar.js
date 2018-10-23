var Calendar = require('../models/calendar');

exports.getAllEvents = function (req, res) {
    Calendar.find({}, function (err, event) {
        if(err) {
            res.send(err + "ERROR");
        } else {
            res.send(JSON.stringify(event))
        }
    })
};

exports.createNewEvent = function (req, res) {
    var username = req.body.username;
    var doctor = req.body.doctor;
    var date = req.body.date;
    var time = req.body.time;
    var event = req.body.event;

    var newEvent = new Calendar({
        username: username,
        doctor: doctor,
        date: date,
        time: time,
        event: event
    });

    newEvent.save()
        .then(item => {
            res.send("task saved to database");
        })
        .catch(err => {
            res.send("unable to save to database");
        });

};