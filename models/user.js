var mongoose = require("mongoose");
var User = mongoose.Schema({
    userEmail: {
        type:String,
        default:"",
        required:true
    },
    userName: {
        type:String,
        default:"",
        required:true
    },
    userPassword: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model("User", User);