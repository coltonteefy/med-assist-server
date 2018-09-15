var express = require("express");
var PORT = process.env.PORT || 5000;
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var userController = require('./controllers/user');
mongoose.connect('mongodb://admin:admin2018@ds251632.mlab.com:51632/musicondb', {useNewUrlParser: true});
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
var router = express.Router();

// app.use('/api', router);

app.use(express.static(path.join(__dirname, '/api')), router);

app.set('view engine','ejs');

router.route('/allUsers').get(userController.getAllUsers);
router.route('/users/:_id').get(userController.getUserById);
router.route('/user/:userName').get(userController.getUser);
router.route('/addUser').post(userController.addUser);
router.route('/updateUser/:_id').post(userController.updateUser);
router.route('/deleteUser/:_id').get(userController.deleteUser);


app.listen(PORT, function () {
    console.log("Server listening on port 5000");
});