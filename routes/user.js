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

exports.getUserImage = function (req, res) {
    User.find({username: req.params.username}, function (err, user) {
        var image = user[0].image;
        if (err) {
            res.send(err);
        } else if (image === "") {
            res.send({message: "no image"});
        } else {
            res.json({message: image});
        }
    })
};

exports.register = function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var permissions = req.body.permissions;
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
                    name: name,
                    permissions: permissions,
                    image: ''
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
    var event = {
        doctor: req.body.doctor,
        time: req.body.time,
        date: req.body.date,
        task: req.body.task
    };

    User.updateOne({username: req.params.username}, {
        $push: {
            events: event
        }
    }, function (err, task, raw) {
        if (err) {
            res.send(err);
        }
        res.json({task: task, message: "event added to calendar"});
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
            res.json({message: "Authentication failed. User not found", data: user});
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


const upload = require('../services/file-upload');
const singleUpload = upload.single('image');

exports.addUserImage = function (req, res) {
    singleUpload(req, res, function (err) {
        if (err) {
            res.json({message: err})
        } else {
            User.updateOne({username: req.params.username}, {
                image: req.file.location
            }, function (err) {
                if (err) {
                    res.send(err);
                    res.json({message: "fail"})
                } else {
                    res.json({message: "image saved" , imageURL: req.file.location})
                }
            })
        }
    });
};

const pdfUpload = require('../services/pdf-upload');
const singlePdfUpload = pdfUpload.single('image');

exports.uploadPdf = function (req, res) {
    singlePdfUpload(req, res, function (err) {
        if (err) {
            res.json({message: err})
        } else {
            var pdf = {
                id: '0',
                pdfUrl: req.file.location,
            }
            User.updateOne({username: req.params.username}, {
                $push: {
                    pdfReport: pdf
                }
            }, function (err) {
                if (err) {
                    res.send(err);
                    res.json({message: "fail"})
                } else {
                    res.json({message: "image saved" , imageURL: req.file.location})
                }
            })
        }
    });
};

exports.getUserPdfs = function (req, res) {
    User.find({username: req.params.username}, function (err, user) {
        if (err) {
            res.send(err);
        } else
            res.send(JSON.stringify(user[0].pdfReport));
    })
};

exports.getUserPermissions = function (req, res) {
    User.find({username: req.params.username}, function (err, user) {
        var permissions = user[0].permissions;
        if (err) {
            res.send(err);
        } else if (!permissions) {
            res.send({message: "no permission set"});
        } else {
            res.json({message: permissions});
        }
    })
};
