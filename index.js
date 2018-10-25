var express = require("express");
var PORT = process.env.PORT || 5000;
var path = require("path");
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressValidator = require('express-validator');
var multer = require('multer');
var router = express.Router();

var userRoutes = require('./routes/user');
var User = require('./models/user');

var app = express();
app.set('port', (PORT));

var http = require('http').Server(app);
var io = require('socket.io')(http);


mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://admin2018:admin2018@ds053459.mlab.com:53459/med-assist-users', {useNewUrlParser: true});

app.set('view engine', 'ejs');

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '/api')), router);
// app.use('/upload/',express.static('upload/'));
app.use(express.static('upload/'));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//----------------------------------ROUTES----------------------------------

//GET
router.route('/logout').get(userRoutes.logout);
router.route('/getAllUsers').get(userRoutes.getAllUsers);
router.route('/getUserImage/:username').get(userRoutes.getUserImage);
router.route('/deleteUser/:_id').get(userRoutes.deleteUser);
router.route('/addUserImage/:username').post(userRoutes.addUserImage);

//POST
router.route('/register').post(userRoutes.register);
router.route('/login').post(userRoutes.login);
router.route('/updateUser/:_id').post(userRoutes.updateUser);
router.route('/addUserEvent/:username').post(userRoutes.addUserEvent);

http.listen(app.get('port'), function () {
    console.log('Server listening on port', app.get('port'));
});

//----------------------------------IO CONNECTION-------------------------------------

io.on('connection', function (socket) {

    console.log('New Conncetion made');

    socket.on('join', function (data) {
        //joining
        socket.join(data.room);
        console.log(data.user + 'joined the room : ' + data.room);
        socket.to(data.room).emit('new user joined', {user: data.user, message: 'has joined this room.'});
    });

    socket.on('leave', function (data) {
        console.log(data.user + 'left the room : ' + data.room);
        socket.broadcast.to(data.room).emit('left room', {user: data.user, message: 'has left this room.'});
        socket.leave(data.room);
    });

    socket.on('typing', function (data) {
        console.log(data.user + " is typing.... ");
        socket.to(data.room).emit('typing...', {user: data.user, message: 'is typing...'});
    });

    socket.on('message', function (data) {
        io.in(data.room).emit('new message', {user: data.user, message: data.message});
    })
});