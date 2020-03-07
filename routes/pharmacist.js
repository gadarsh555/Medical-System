var express = require('express');
var router = express.Router();
var express = require('express');
var router = express.Router();
var multer = require('multer');
var passport = require('passport');
var upload = multer({dest:'./public/uploads/profileimage'});
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var con = require('/home/adarsh/node_projects/Medical/routes/connection');


//handle sessions
router.use(session({
  secret:'secret', // this is to encrypt and decrypt all the
                   // cookie values or user data
  saveUninitialized :true,// dont save unmodified
  resave:true,  // forces the session to be saved back to the store
  duration: 10*1000,// define the time interval for which
          // user will be logged in afetr that session
          // session will expire and user will be logged out
      
   /* saveUnitialized prevents your router from 
   overloading with too many empty sessions 
   and resave is to ensure sessions are not 
    deleted even if they are idle for a long time. */
}));
// passport

router.use(passport.initialize());
router.use(passport.session());

// validator

router.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));



function checkSignIn(req,res,next){
    if(req.session.user){
       next();     //If session exists, proceed to page
    } else {
       var err = new Error("Not logged in!");
       console.log(req.session.user);
       next(err);  //Error, trying to access unauthorized page!
    }
  }
  
  module.exports = router;
  