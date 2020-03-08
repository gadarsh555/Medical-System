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

  if(req.query.flag){
      var doctor = "SELECT * FROM doctor";
      console.log(" reacvhed in flag --------------------------------------");
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
 else if(req.query.search){
  console.log(" reacvhed in search --------------------------------------");
  result = [{
    "username" : req.query.username,
    "name"     : req.query.name,
    "profileimage" : req.query.profileimage
  }];
  res.render('appointment',{user:req.session.user,doctor : result,search :1,status:"*Schedule an Appoinment"});
 }//elseif for search

 else if(req.query.form){
  console.log(" reacvhed in form --------------------------------------");
  result = [{
    "username" : req.query.username,
    "name"     : req.query.name,
    "profileimage" : req.query.profileimage
  }];
  var slot = req.query.slot;
  res.render('appointment',{user:req.session.user,slot:req.query.slot,date:req.query.date,doctor : result,form:1,status:"*Apply for Appoinment"});
 }//elseif for form
});

router.post('/:id/appointment',checkSignIn,function(err,req,res,next){
  console.log("i am inside appointment get");
  console.log("error : ",err);
  res.redirect('/login');      
},function(req,res){

   if(req.query.schedule){
    console.log(" reacvhed in schedule --------------------------------------");
   result = [{
     "username" : req.query.username,
     "name"     : req.query.name,
     "profileimage" : req.query.profileimage
   }];
   var docId = req.query.username;
   var find = "select * from appointment where doctor='"+docId+"' and  date='"+req.body.date+"' ";
   con.query(find, function (err,slot,fields) {
     if (err){
       console.log("error ocurrred",err);
       res.render('appointment',{user:req.session.user,doctor : result,search :1,status:"*Schedule an Appoinment"});
     }
     else if(slot.length == 12){
       console.log("found search reesult already present: ",slot);
       res.render('appointment',{user:req.session.user,appointment : slot,doctor : result,search :1,status:"*Fill the Form to Fix Appoinment"});
     }//elseif
     else{
       console.log("no result found ");
       var insert = "insert into appointment(slot,doctor,date,status) values('10:00 - 10:30','"+docId+"','"+req.body.date+"','Free'),('10:30 - 11:00','"+docId+"','"+req.body.date+"','Free'),('11:00 - 11:30','"+docId+"','"+req.body.date+"','Free'),('11:30 - 12:00','"+docId+"','"+req.body.date+"','Free'),('12:00 - 12:30','"+docId+"','"+req.body.date+"','Free'),('12:30 - 01:00','"+docId+"','"+req.body.date+"','Free'),('02:00 - 02:30','"+docId+"','"+req.body.date+"','Free'),('02:30 - 03:00','"+docId+"','"+req.body.date+"','Free'),('03:00 - 03:30','"+docId+"','"+req.body.date+"','Free'),('03:30 - 04:00','"+docId+"','"+req.body.date+"','Free'),('04:00 - 04:30','"+docId+"','"+req.body.date+"','Free'),('04:30 - 05:00','"+docId+"','"+req.body.date+"','Free')";
       con.query(insert, function (err, slot2,fields) {
         if (err){
           console.log("error ocurrred in inserting 12 rows",err);
           res.render('appointment',{user:req.session.user,doctor : result,search :1,status:"*Schedule an Appoinment"});
         }
         else{
           console.log("12 rows insertrted succcessfully !");
           var find2 = "select * from appointment where doctor='"+docId+"' and  date='"+req.body.date+"' ";
           con.query(find2, function (err,slot3,fields) {
             if (err){
               console.log("error ocurrred",err);
               res.render('appointment',{user:req.session.user,doctor : result,search :1,status:"*Schedule an Appoinment"});
             }
             else {
               console.log("found search reesult--------------------- : ",slot3);
               res.render('appointment',{user:req.session.user,appointment : slot3,doctor : result,search :1,status:"*Fill the Form to Fix Appoinment"});
            
             }//else
           });//againg finding those 12 rows after insertion
         }//else after inserting all 12 values
       });//insert all the appointments
     }//else
   });//finding search in appointment
  }//if for schedule

  else if(req.query.form){
    console.log(" reacvhed in form post --------------------------------------");
   result = [{
     "username" : req.query.username,
     "name"     : req.query.name,
     "profileimage" : req.query.profileimage
   }];
   console.log("doctor :",req.query.username);
   console.log("slot :",req.body.slot);
   console.log("date :",req.body.date);

      var findemail = "select * from patient where username='"+req.body.patient+"' ";
      con.query(findemail,function(err,patient,fields){
         if(err){
           console.log("err in finding patient",err);
         }
         else if(patient.length == 0){
           console.log("Patient Not Found or Registered ");
           res.render('appointment',{user:req.session.user,slot:req.body.slot,date:req.body.date,doctor : result,form:1,status:"*Patient Id '"+req.body.patient+"' Not Found or Registered !"});
         }//elseif
         else{
          var fix = "update appointment set patient='"+req.body.patient+"',status='Fixed' where doctor='"+req.query.username+"' and date='"+req.body.date+"' and slot='"+req.body.slot+"'  ";

          con.query(fix, function(err,fixed,fields) {
           if (err){
             console.log("error ocurrred",err);
             res.render('appointment',{user:req.session.user,doctor : result,search :1,status:"*Schedule an Appoinment"});
           }
           else{
             console.log("appomjtment is fixed: ",fixed);
             mail.send_email(res,'',"Medical System","gadarsh780@gmail.com","zinfwpjphbywlekm",patient[0].email,"Medical System","Your Appointment is Fixed Successfully with Patient Id : '"+req.body.patient+"' at Time-Slot : '"+req.body.slot+"' , on Date : '"+req.body.date+"' . Your Doctor's Id is :  "+req.query.username+".",'','');
             res.render('appointment',{user:req.session.user,slot:req.body.slot,date:req.body.date,doctor : result,form:1,patient:req.body.patient,email:"An Email is Sent To the Patient with All the Necessary Details.",status:"*Appoinment Fixed Successfully !!"});
               }//else of fixing appointment
          });//query to update patient in apooinrment

         }//else of finding patient
      });//query to find patient  

  }//else if for form
});//routert fopr date searching 

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
  