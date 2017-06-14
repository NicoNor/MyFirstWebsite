/***********
   Modules
***********/

//Load the express library
var express = require('express');
//Create a new variable called “app”; we pass on the express() method.
var app = express();
//Set Port
var port = 7878;
var mongoose = require('mongoose'); //Place this on top; Loads mongoose library
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

/*Body parser*///whenever you do a post request from the form, it gets the data through a URL encoded format.
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/js', express.static(__dirname + '/js'));

/*Initialize Sessions*/
app.use(cookieParser());
app.use(bodyParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

/*Initialize Passport*/
app.use(passport.initialize());
app.use(passport.session());

/***********
  Database
***********/

/*Database connection - MongoDB*/

//Created from the command earlier. Ensure this is done on the first_db instance
var usr = 'admin';
var pwd = '123456';

var dbHost = 'localhost';
var dbPort = '27017';
var database = 'first_db';

var url = 'mongodb://' + usr + ':' + pwd + '@' + dbHost + ':' + dbPort + '/' + database;
console.log('mongodb connection = ' + url);

mongoose.connect(url, function(err) {
    if(err) {
        console.log('connection error: ', err);
    } else {
        console.log('connection successful');
    }
});

/***********
   Models
***********/

//User model
//Define our fields for the table
var UserSchema = new mongoose.Schema({
     user_id: mongoose.Schema.ObjectId,
     username: String,
     password: String
   });
//Create model object
var User = mongoose.model('user', UserSchema);

//Item Model
var ItemSchema = new mongoose.Schema({
      owner: String,
      details: String,
      post_time: String,
      edit_time: String,
      isPublic: Boolean
});

var Item = mongoose.model('item', ItemSchema);

/***********
   Routes
***********/
var bcrypt = require('bcrypt-nodejs'); //should be placed on top
//Renders our html file
app.get('/', function (req, res, next) {
  res.sendFile( __dirname + '/index.html');
});
//render register.html when /register is called
app.get('/register', function (req, res, next) {
  res.sendFile( __dirname + '/register.html');
});

app.get('/home', loggedIn, function (req, res, next) {
    res.sendFile(__dirname + '/home.html');
});

app.get('/user', loggedIn, function(req, res, next) {
    User.findById({ _id: req.user._id }, function(err, user) {
        return res.json(user);
    });
});

app.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

app.post('/login', passport.authenticate('local'),
    function(req, res) {
        res.redirect('/home');
});

/* Login logic for passport.authenticate*/
passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if(user !== null) {
                var isPasswordCorrect = bcrypt.compareSync(password, user.password);
                if(isPasswordCorrect) {
                    console.log("Username and password correct!");
                    return done(null, user);
                } else {
                    console.log("Password incorrect!");
                    return done(null, false);
                }
           } else {
               console.log("Username does not exist!");
               return done(null, false);
           }
       });
    }
));

/**********
Serialize and Deserialize here for passport.authenticate
**********/
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.post('/register', function (req, res, next) {
    var password = bcrypt.hashSync(req.body.password);
    req.body.password = password;

    User.create(req.body, function(err, saved) {
        if(err) {
            console.log(err);
            res.json({ message : err });
        } else {
            res.json({ message : "User successfully registered!"});
        }
    });
});

app.post('/add', function (req, res, next) {
    var item = new Item();
    item.details = req.body.details:
    item.isPublic = req.body.isPublic;
    item.post_time = getDataTime();
    item.owner = req.user.username;

    Item.create(item, function(err, saved) {
        if(err) {
            console.log(err);
        } else {
            res.json({ message : "item successfully registered!", item: saved})
        }
    });
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
      res.redirect('/');
    }
}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + " - " + hour + ":" + min + ":" + sec;
}

app.listen(port, '0.0.0.0', function() {
 console.log('Server running at port ' + port);
});
