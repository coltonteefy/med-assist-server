var mongoose = require("mongoose");
var bcrypt = require('bcryptjs');

var User = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    permissions: {
        type: Boolean,
        required: true,
    },
    pdfReport: [
        {
            id: String,
            pdfUrl: String,
        }
    ],
    events: [
        {
            doctor: String,
            date: String,
            time: String,
            task: String
        }
    ]
});

module.exports = mongoose.model("User", User);

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

module.exports.getUserByUsername = function (username, callback) {
    var query = {username: username};
    User.findOne(query, callback);
};

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
};