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

exports.getSingleUser = function (req, res) {
    User.find({username: req.params.username}, function (err, user) {
        if (err) {
            res.send(err);
        } else
            res.json({message: user});
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
                    image: '',
                    prescriptions: {
                        drugName: '',
                        numberRefills: 0,
                        expireDate: ''
                    }
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

exports.getUserEvents = function (req, res) {
    User.findOne({username: req.params.username}, function (err, user) {
        if(err) {
            res.send(err);
        } else {
            res.send(user.events);
        }
    })
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
                    res.json({message: "image saved", imageURL: req.file.location})
                }
            })
        }
    });
};
/*******************PDF Upload - Forms and Documents**************/

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
            };
            User.updateOne({username: req.params.username}, {
                $push: {
                    pdfReport: pdf
                }
            }, function (err) {
                if (err) {
                    res.send(err);
                    res.json({message: "fail"})
                } else {
                    res.json({message: "image saved", imageURL: req.file.location})
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

/************************"My Profile" information************************/

// Post
//const profileUpload = require('../services/profile-upload');
//const singleProfileUpload = profileUpload.single('text');

exports.uploadProfile = function (req, res) {
    var patientProfile = {
        id: '0',
        patientFirstName: req.body.patientFirstName,
        patientLastName: req.body.patientLastName
        //                address: req.body.address
        //                DOB: req.body.DOB
        //                sex: req.body.sex
        //                maritalStatus: req.body.maritalStatus
        //                language: req.body.language
        //                race: req.body.race
        //                ethnicity: req.body.ethnicity
        //                homePhone: req.body.homePhone
        //                mobilePhone: req.body.mobilePhone
        //                workPhone: req.body.workPhone
        //                email: req.body.email
        //                emergencyFirstName: req.body.emergencyFirstName
        //                emergencyLastName: req.body.emergencyLastName
        //                emergencyRelationship: req.body.emergencyRelationship
        //                emergencyHomePhone: req.body.emergencyHomePhone
        //                emergencyMobilePhone: req.body.emergencyMobilePhone
        //                emergencyWorkPhone: req.body.emergencyWorkPhone
    }
    User.updateOne({username: req.params.username}, {

        $push: {
            patientProfile: patientProfile
        }
    }, function (err, num, raw) {
        if (err) {
            res.send(err);
        }
        res.json(num);
    });
};

// Get
exports.getUserProfile = function (req, res) {
    User.find({username: req.params.username}, function (err, user) {
        var profile = user[0].patientProfile;
        if (err) {
            res.send(err);
        } else {
            res.json({message: "First Name: " + profile.patientFirstName + " Last Name: " + profile.patientLastName});
        }
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

exports.getUserFullName = function (req, res) {
    User.find({username: req.params.username}, function (err, user) {
        var name = user[0].name;
        if (err) {
            res.send(err);
        } else {
            res.json({message: name});
        }
    })
};

exports.getUserEmail = function (req, res) {
    User.find({username: req.params.username}, function (err, user) {
        var email = user[0].email;
        if (err) {
            res.send(err);
        } else {
            res.json({message: email});
        }
    })
};

exports.addRefillAmount = function (req, res) {
    User.updateOne({username: req.params.username}, {
        prescriptions: {
            drugName: req.body.drugName,
            numberRefills: req.body.numberRefills,
            expireDate: req.body.expireDate
        }
    }, function (err) {
        if (err) {
            res.send(err);
            res.json({message: "fail"})
        } else {
            res.json({message: "Refill Update"})
        }
    })
};

exports.updateRefillAmount = function (req, res) {
    User.updateOne({'prescriptions._id': req.body.id}, {
        $set: { 'prescriptions.$.numberRefills' : req.body.numberRefills }
    }, function (err) {
        if (err) {
            res.send(err);
            res.json({message: "fail"})
        } else {
            res.json({message: "Refill Update"})
        }
    })
};

exports.addNewPrescription = function (req, res) {
    const newPrescription = {
        drugName: req.body.drugName,
        numberRefills: req.body.numberRefills,
        expireDate: req.body.expireDate
    };
    User.updateOne({username: req.params.username}, {
        $push: {
            prescriptions: newPrescription
        }
    }, function (err) {
        if (err) {
            res.send(err);
            res.json({message: "fail"})
        } else {
            res.json({message: "Added a new prescription"})
        }
    })
};