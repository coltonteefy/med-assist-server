var mongoose = require("mongoose");

var Calendar = mongoose.Schema({
    username: {
        type: String
    },
    doctor: {
        type: String
    },
    date: {
        type: String
    },
    time: {
        type: String
    },
    event: {
        type: String
    }
});

module.exports = mongoose.model("Calendar", Calendar);