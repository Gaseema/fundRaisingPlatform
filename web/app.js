var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var flash = require('connect-flash')
var User = require("./models/user.js");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.listen(8000, function() {
    console.log('Application worker ' + process.pid + ' started...');
});

var morgan = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');

var async = require('async');

// Require controller modules.
var business_controller = require('./controllers/businessController');
var ico_controller = require('./controllers/icoListController');

app.use(expressSession({
    secret: 'mySecretKey',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


//Set up default mongoose connection
var configDb = require('./database.js');
mongoose.connect(configDb.url, {
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

require('./config/passport')(passport); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


//Handle Requests
app.get('/', function(req, res) {
    res.json('index');
});
app.get('/login', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login', {
        message: req.flash('loginMessage')
    });
});
app.get('/signup', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('signup', {
        message: req.flash('signupMessage')
    });
});
app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile', {
        user: req.user
    });
});
app.get('/profile/ico', isLoggedIn, function(req, res) {
    res.render('manageICO', {
        user: req.user
    });
});
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

//Facebook Routes
app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
}));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

//Google Routes
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));
app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

// locally --------------------------------
app.get('/connect/local', function(req, res) {
    res.render('connect-local.ejs', {
        message: req.flash('loginMessage')
    });
});
app.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

// facebook -------------------------------

// send to facebook to do the authentication
app.get('/connect/facebook', passport.authorize('facebook', {
    scope: ['public_profile', 'email']
}));

// handle the callback after facebook has authorized the user
app.get('/connect/facebook/callback',
    passport.authorize('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

// twitter --------------------------------

// send to twitter to do the authentication
app.get('/connect/twitter', passport.authorize('twitter', {
    scope: 'email'
}));

// handle the callback after twitter has authorized the user
app.get('/connect/twitter/callback',
    passport.authorize('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

// google ---------------------------------

// send to google to do the authentication
app.get('/connect/google', passport.authorize('google', {
    scope: ['profile', 'email']
}));

// the callback after google has authorized the user
app.get('/connect/google/callback',
    passport.authorize('google', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/login');
}

// process the signup form
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

// process the login form
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

// GET request for creating a product. NOTE This must come before routes that display product (uses id).
app.get('/profile/ico/create', isLoggedIn, business_controller.business_create_get);

// POST request for creating product.
app.post('/profile/ico/create', isLoggedIn, business_controller.business_create_post);

// GET request to update product.
app.get('/product/:id/update', isLoggedIn, business_controller.business_update_get);

// POST request to update product.
app.post('/product/:id/update', isLoggedIn, business_controller.business_update_post);

// POST request to update product.
app.get('/businessprofile/:id', business_controller.business_profile_page);
// POST request to update product.
app.get('/businessprofile/:id/details', business_controller.business_profile_page_details);

//ICO List PAGE
app.get('/icos/ongoing', ico_controller.ongoing_ico_list_page);
app.get('/icos/upcoming', ico_controller.upcoming_ico_list_page);
app.get('/icos/past', ico_controller.past_ico_list_page);
app.get('/icos/all', ico_controller.all_ico_list_page);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// Access to MPESA
var request = require('request'),
  consumer_key = "Ezr4QUDKPG4jaqpoqjA5gcJZWjavQKFa",
  consumer_secret = "BQAqVKbWtcqYBMVR",
  url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
  auth = "Basic " + new Buffer(consumer_key + ":" + consumer_secret).toString("base64");

  request(
    {
      url : url,
      headers : {
        "Authorization" : auth
      }
    },
    function (error, response, body) {
      // TODO: Use the body object to extract OAuth access token
      console.log("================================================")
    }
  )

module.exports = app;
