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
var mail = require('easy-email');
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

router.get('/:id/register',checkSignIn,function(err,req,res,next){
  console.log("i am inside register patient get ");
  console.log("error : ",err);
  res.redirect('/login');      
},function(req,res){
     res.render('regpatient',{user:req.session.user});
});

router.post('/:id/register',checkSignIn,function(err,req,res,next){
  console.log("i am inside register patient post");
  console.log("error : ",err);
  res.redirect('/login');      
},upload.single('profileimage'),function(req,res){

  if(req.file){
    console.log("got the image");
    req.body.profileimage = "../../../uploads/profileimage/"+req.file.filename;
  }
  else{
   console.log("no image");
   req.body.profileimage = "../../../uploads/profileimage/"+'default.png';
  }
  var count ="select count(*) as num from patient";
  con.query(count,function(err,count,fields){
    if (err){
      console.log("error ocurrred",err);
      res.render('regpatient',{user:req.session.user,message:"*Try again...",formdata:req.body});
    }
    console.log("count is :",count[0].num);
    var num = count[0].num+1;
    var username = new Date().getFullYear()+"pt"+num;
    var find ="select * from patient where phone='"+req.body.phone+"' and dob='"+req.body.dob+"' ";
    con.query(find, function (err, result,fields) {
      if (err){
        console.log("error ocurrred",err);
        res.render('regpatient',{user:req.session.user,message:"*Try again...",formdata:req.body});
      }
      else if(result.length > 0){
        console.log("find - 1",result)
        res.render('regpatient',{user:req.session.user,message:"*User Already Registered",formdata:req.body});
      }//elseif
      else{
        console.log("find - 0",result)
        var patient = "INSERT INTO patient VALUES('"+username+"','"+req.body.name+"','"+req.body.email+"','"+req.body.phone+"','"+req.body.dob+"','"+req.body.profileimage+"')";
        con.query(patient, function (err, result,fields) {
          if (err){
            console.log("error ocurrred",err);
          }
          console.log("1 record inserted",result);
          mail.send_email(res,'',"Medical System","gadarsh780@gmail.com","zinfwpjphbywlekm",req.body.email,"Medical System","You're Registered Successfully with Patient Registration Id : "+username+"",'','');
          res.render('regpatient',{user:req.session.user,message:"*User Registered Successfully !"});
        });//inserting data in db doctor
      }//else
    });//finding if user already registered
  });//count previous number in patient table
});//route to register aptient

router.post('/:id/search',checkSignIn,function(err,req,res,next){
  console.log("i am inside search post");
  console.log("error : ",err);
  res.redirect('/login');      
},function(req,res){
  var item = req.body.search;
  var search = "SELECT * FROM patient WHERE (username='"+item+"' or name='"+item+"' or email='"+item+"' or phone='"+item+"' or dob='"+item+"' )";
  con.query(search, function (err, result,fields) {
    if (err){
      console.log("error ocurrred",err);
      res.render('recprofile',{user:req.session.user,status:"*Error ocurred while searching for '"+item+"'  "});
    }
    else if(result.length > 0){
      console.log("found search reesult : ",result);
      res.render('recprofile',{user:req.session.user,patient:result,status:"*Found patient's result related to '"+item+"' : "});
    }//elseif
    else{
      console.log("no result found ");
      res.render('recprofile',{user:req.session.user,status:"*Nothing found realted to '"+item+"' : "});
    }//else
  });//finding search in patient
});//router 

router.get('/:id/appointment',checkSignIn,function(err,req,res,next){
  console.log("i am inside appointment get");
  console.log("error : ",err);
  res.redirect('/login');      
},function(req,res){

  if(req.query.flag == 1){
      var doctor = "SELECT * FROM doctor";
      con.query(doctor, function (err, result,fields) {
        if (err){
          console.log("error ocurrred",err);
          res.render('appointment',{user:req.session.user,status:"*Error ocurred while searching for Doctor's Available"});
        }
        else if(result.length > 0){
          console.log("found search reesult : ",result);
          res.render('appointment',{user:req.session.user,doctor : result,status:"*Doctor's Available are :"});
        }//elseif
        else{
          console.log("no result found ");
          res.render('appointment',{user:req.session.user,status:"*No Doctor's are Available"});
        }//else
      });//finding search in doctor
 }//renderring to appointment page
 else{
  result = [{
    "username" : req.query.username,
    "name"     : req.query.name,
    "profileimage" : req.query.profileimage
  }];
  res.render('appointment',{user:req.session.user,doctor : result,form:1,status:"*Schedule an Appoinment"});
 }//else for flag
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
  