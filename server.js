var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var userController = require('./controllers/user');
mongoose.connect('mongodb://admin:admin2018@ds251632.mlab.com:51632/musicondb', {useNewUrlParser: true});
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
var router = express.Router();

app.use('/api', router);

router.route('/allUsers').get(userController.getAllUsers);
router.route('/users/:_id').get(userController.getUserById);
router.route('/user/:_id').get(userController.getUser);
router.route('/addUser').post(userController.addUser);
router.route('/updateUser/:_id').post(userController.updateUser);
router.route('/deleteUser/:_id').get(userController.deleteUser);


app.listen(5000, function () {
    console.log("Server listening on port 5000");
});