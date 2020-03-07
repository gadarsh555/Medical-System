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

router.get('/:id/regpatient',checkSignIn,function(err,req,res,next){
  console.log("i am inside regpatient ");
    console.log("error : ",err);
    res.redirect('/login');
},function(req,res){
   var user =[{
     "name" : req.query.name,
     "username" : req.params.id,
     "profileimage": req.query.profileimage
   }];
   console.log("reachged in regpatient");
   res.render('regpatient',{user:user});
});

// get home 
router.get('/:id/home',checkSignIn,function(err,req,res,next){
  console.log("i am inside get home ");
  console.log("error : ",err);
  res.redirect('/login');
},function(req,res){
   if(req.query.table == 'doctor'){
    res.render('docprofile',{user:req.session.user});
   }
   else if(req.query.table == 'receptionist'){
    res.render('recprofile',{user:req.session.user});
   }
   else{
    res.render('pharprofile',{user:req.session.user});
   }
});

// Logout endpoint
router.get('/:id/logout', function (req, res) {
  req.session.destroy();
  /* res.send("logout success!"); */
  console.log("Logout successful :");
  res.redirect('/login');
});

//change password get 
router.get('/:id/change',checkSignIn,function(err,req,res,next){
  console.log("i am inside password change ");
  console.log("error : ",err);
  res.redirect('/login');
},function(req,res){
  console.log("rechaed in change password get");
  res.render('forgot',{user:req.session.user,table:req.query.table});
});

//change password post
router.post('/:id/change',checkSignIn,function(err,req,res,next){
  console.log("i am inside password change ");
  console.log("error : ",err);
  res.redirect('/login');
},function(req,res){
  console.log("rechaed in change password post");
  var table = req.query.table;
  console.log("user is currently,",table);
  var findusername = "select * from "+table+" where username='"+req.params.id+"' and password='"+req.body.oldpass+"' ";
  con.query(findusername, function (err, result,fields) {
    if (err){
      console.log("error ocurrred",err);
    }
    else if(result.length > 0){
      console.log("1 record found");
      console.log("found the user now going to change apsswordS");
      //console.log("fields",fields);S
      var change = "update "+table+" set password='"+req.body.newpass+"' where password='"+req.body.oldpass+"'";
      con.query(change,function(err,result,fields){
        if (err){
          console.log("error ocurrred",err);
        }
        else{
          console.log("changed password now rendering...");
          res.render('forgot',{user:req.session.user,change:'*Password Updated Successfully',table:table});
        }//elseif
      });//con chnage to chnage bpassowrd
    }
    else{
      console.log("wrong password now rendering...");
      res.render('forgot',{user:req.session.user , change:"*Password did not matched",table:table});
    }
});//query con to aunthenticate user
  
});

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
