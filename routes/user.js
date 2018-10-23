var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.getAllUsers = function (req, res) {
    User.find({}, function (err, user) {
        if (err) {
            res.send(err);
        } else
            res.send(JSON.stringify(user));
    })
};

exports.register = function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    User.findOne({username: {"$regex": "^" + username + "\\b", "$options": "i"}}, function (err, user) {
        User.findOne({email: {"$regex": "^" + email + "\\b", "$options": "i"}}, function (err, mail) {
            if (user || mail) {
                res.json({message: "Username or email already exists", data: user});
            } else {
                var newUser = new User({
                    username: username,
                    password: password,
                    email: email,
                    name: name
                });

                User.createUser(newUser, function (err, user) {
                    if (err) {
                        res.send(err)
                    } else {
                        res.json({message: "User info was saved.", data: user});
                        console.log(user);
                    }
                });
            }
        });
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

exports.addUserEvent = function (req, res) {
    User.updateOne({username: req.params.username}, {
        event: [
            {
                doctor: req.body.doctor,
                time: req.body.time,
                date: req.body.date,
                task: req.body.task
            }
        ]
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

passport.use(new LocalStrategy(function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {message: 'Unknown User'});
            }
            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        });
    })
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

exports.logout = function (req, res) {
    req.logOut();
    res.send("Logout success")
};

exports.login = function (req, res, done) {
    User.findOne({username: req.body.username}, function (err, user) {
        if (err) {
            res.json({message: err});
            res.send("error", err)
        }
        if (!user) {
            res.json({message:"Authentication failed. User not found", data: user});
        } else {
            User.comparePassword(req.body.password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    res.json({message: "Success", data: user});
                    return done(null, {message: 'success'});
                } else {
                    res.json({message: "Invalid password", data: user});
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        }
    })
};

exports.logout = function (req, res) {
    req.logout();
    res.send("Logout success")
};