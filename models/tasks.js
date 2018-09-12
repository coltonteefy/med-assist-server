var mongoose = require("mongoose");
var Task = mongoose.Schema({
    taskTitle: {
        type:String,
        default:"",
        required:true
    },
    taskDescription: {
        type:String,
        default:"",
        required:true
    },
    taskStartDate: {
        type: Date,
        require: true
    },
    taskEndDate: {
        type: Date,
        require: true
    },
    userId: {
        type: Number,
        require: true
    }
});

module.exports = mongoose.model("Task", Task);