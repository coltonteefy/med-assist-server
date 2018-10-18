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
var router = express.Router();

var userRoutes = require('./routes/user');
var app = express();

app.set('port', (process.env.PORT || 5000));

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

router.route('/register').post(userRoutes.register);
router.route('/login').post(userRoutes.login);
router.route('/logout').get(userRoutes.logout);
router.route('/getAllUsers').get(userRoutes.getAllUsers);
router.route('/updateUser/:_id').post(userRoutes.updateUser);
router.route('/deleteUser/:_id').get(userRoutes.deleteUser);


// app.listen(PORT, function () {
//     console.log("Server listening on port 5000");
// });

http.listen(app.get('port'), function() {
    console.log('Server listening on port', app.get('port'));
});


//IO CONNECTION
io.on('connection', function(socket){

    console.log('New Conncetion made');

    socket.on('connect user', function(user){
        console.log("Connected user ");
        io.emit('connect user', user);
    });

    socket.on('on typing', function(typing){
        console.log("Typing.... ");
        io.emit('on typing', typing);
    });

    socket.on('chat message', function(msg){
        console.log("Message " + msg['message']);
        io.emit('chat message', msg);
    });
    
//DIFFERENT HERE
    socket.on('join', function(data){
        //joining
        socket.join(data.room);
        console.log(data.user + 'joined the room : ' + data.room);
        socket.broadcast.to(data.room).emit('new user joined', {user:data.user, message:'has joined this room.'});
    });

    socket.on('leave', function(data){
        console.log(data.user + 'left the room : ' + data.room);
        socket.broadcast.to(data.room).emit('left room', {user:data.user, message:'has left this room.'});
        socket.leave(data.room);
    });

    socket.on('message',function(data){
        io.in(data.room).emit('new message', {user:data.user, message:data.message});
    })
});