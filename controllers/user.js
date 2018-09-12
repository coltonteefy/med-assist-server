var User = require('../models/user');

exports.getAllUsers = function (req, res) {
    User.find({}, function (err, user) {
        if (err) {
            res.send(err);
        } else
            res.send(JSON.stringify(user));
    })
};

exports.getUserById = function (req, res) {
    User.find({_id: req.params._id}, function (err, user) {
        if (err) {
            res.send(err);
        } else
            res.send(JSON.stringify(user));
    })
};

exports.getUser = function (req, res) {
    User.find({_id: req.params._id}, function (err, user) {
        if (err) {
            res.send(err)
        } else
            res.send(user);
    });
};

exports.addUser = function (req, res) {
    var user = new User();
    user.userEmail = req.body.userEmail;
    user.userName = req.body.userName;
    user.userPassword = req.body.userPassword;

    user.save(function (err) {
        if (err) {
            res.send(err);
        } else
            res.send({message: "User info was saved.", data: user})
    });
};

exports.updateUser = function (req, res) {
    console.log(req.params._id);
    User.updateOne({_id: req.params._id}, {
        userEmail: req.body.userName,
        userName: req.body.userName,
        userPassword: req.body.userPassword
    }, function (err, num, raw) {
        if (err) {
            res.send(err);
        }
        res.json(num);
    });
};

exports.deleteUser = function (req, res) {
    User.deleteOne({_id: req.params._id}, function (err) {
        if (err) {
            res.send(err);
        }
        res.json({message: "User was deleted"});
    });
};