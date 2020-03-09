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
var mail = require('easy-email');

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

router.get('/:id/treatment',checkSignIn,function(err,req,res,next){
  console.log("i am inside get home ");
  console.log("error : ",err);
  res.redirect('/login');
},function(req,res){
  res.render('treatment',{user:req.session.user});
});//router to render to the treatment page

router.post('/:id/treatment',checkSignIn,function(err,req,res,next){
  console.log("i am inside get home ");
  console.log("error : ",err);
  res.redirect('/login');
},function(req,res){

   var patient = "select * from patient where username='"+req.body.patient+"' ";
   con.query(patient, function (err,patient,fields) {
    if(err){
      console.log("error ocurred in inserting treatment",err);
    }
    else if(patient.length == 0){
        console.log("patient does not exist",err);
         res.render('treatment',{user:req.session.user,status:"*Patient does not exist or is not Registered"});
    }//patient does not exist
    else{
      var completed = "update appointment set status='Completed' where doctor='"+req.body.doctor+"' and patient='"+req.body.patient+"' and date='"+req.body.date+"' ";
      con.query(completed, function (err,completed,fields) {
        if(err){
          console.log("error ocurred in inserting treatment",err);
          res.render('treatment',{user:req.session.user,status:"*Error in fixing Checkup"});
        }
        else{
          var status = "yes";
          if(req.body.type == "Medication"){
            status="no";
          }
          var treatment = "insert into treatment values('"+req.body.doctor+"','"+req.body.patient+"','"+req.body.type+"','"+req.body.date+"','"+req.body.medicine+"','"+status+"')";
          con.query(treatment, function (err,treatment,fields) {
              if(err){
                console.log("error ocurred in inserting treatment",err);
                res.render('treatment',{user:req.session.user,status:"*Error in fixing Checkup"});
              }
              else{
               console.log("row inserted in treatment",treatment);
               if(req.body.nextdate && req.body.slot){
                var find = "select * from appointment where doctor='"+req.body.doctor+"' and  date='"+req.body.nextdate+"' ";
                con.query(find, function (err,slot,fields) {
                  if (err){
                    console.log("error ocurrred",err);
                    res.render('treatmen',{user:req.session.user,doctor : result,search :1,status:"*Schedule an Appoinment"});
                  }//found appintments from doctor
                  
                  else if(slot.length == 12){
                    console.log("found search reesult already present: ",slot);
                    var check = "select * from appointment where doctor='"+req.body.doctor+"' and  date='"+req.body.nextdate+"' and slot='"+req.body.slot+"' and status='Fixed' ";
                    con.query(check, function (err,check,fields) {
                      if (err){
                        console.log("error ocurrred",err);
                        res.render('treatment',{user:req.session.user,status:"*error in fixing checkup"});
                      }//found appintments from doctor
                      else if(check.length > 0){
                        console.log("Slot is already fixed",check);
                        res.render('treatment',{user:req.session.user,status:"*Slot is already Fixed,Try another Slot."});
                      }
                      else{
                         var checkup="update appointment set patient='"+req.body.patient+"',status='Fixed' where doctor='"+req.body.doctor+"' and date='"+req.body.nextdate+"' and slot='"+req.body.slot+"' ";
                         con.query(checkup, function (err,checkup,fields) {
                          if (err){
                            console.log("error ocurrred",err);
                            res.render('treatment',{user:req.session.user,status:"*error in fixing checkup"});
                          }//found appintments from doctor
                          else{
                            console.log("checkup fixed",checkup);
                            mail.send_email(res,'',"Medical System","gadarsh780@gmail.com","zinfwpjphbywlekm",patient[0].email,"Medical System","Your Next Checkup is fixed with Patient Id : "+req.body.patient+" on Date : "+req.body.nextdate+" at Time-Slot : "+req.body.slot+" and Doctor Id : "+req.body.doctor+".",'','');
                            res.render('treatment',{user:req.session.user,email:"An email is sent to the patient with all the details for the next checkup.",status:"*Treatment is Registered and Next Checkup is Scheduled Successfully."});
                          }//else
                         });//query for fixing checkup by updating appointment 
                      }//slot is empty for patient
                    });//qwuery to check if the slot is already fixed
                  }//elseif
                  else{
                    var docId = req.body.doctor;
                    console.log("no result found ");
                    var insert = "insert into appointment(slot,doctor,date,status) values('10:00 - 10:30','"+docId+"','"+req.body.nextdate+"','Free'),('10:30 - 11:00','"+docId+"','"+req.body.nextdate+"','Free'),('11:00 - 11:30','"+docId+"','"+req.body.nextdate+"','Free'),('11:30 - 12:00','"+docId+"','"+req.body.nextdate+"','Free'),('12:00 - 12:30','"+docId+"','"+req.body.nextdate+"','Free'),('12:30 - 01:00','"+docId+"','"+req.body.nextdate+"','Free'),('02:00 - 02:30','"+docId+"','"+req.body.nextdate+"','Free'),('02:30 - 03:00','"+docId+"','"+req.body.nextdate+"','Free'),('03:00 - 03:30','"+docId+"','"+req.body.nextdate+"','Free'),('03:30 - 04:00','"+docId+"','"+req.body.nextdate+"','Free'),('04:00 - 04:30','"+docId+"','"+req.body.nextdate+"','Free'),('04:30 - 05:00','"+docId+"','"+req.body.nextdate+"','Free')";
                    con.query(insert, function (err, slot2,fields) {
                      if (err){
                         console.log("error ocurrred in inserting 12 rows",err);
                         res.render('treatment',{user:req.session.user,status:"*error in fixing checkup"});
                      }
                      else{
                        console.log("12 rows insertrted succcessfully !");
                        var find2 = "select * from appointment where doctor='"+docId+"' and  date='"+req.body.date+"' ";
                        con.query(find2, function (err,slot3,fields) {
                          if (err){
                            console.log("error ocurrred",err);
                            res.render('treatment',{user:req.session.user,status:"*error in fixing checkup"});
                          }
                          else {
                            console.log("found search reesult--------------------- : ",slot3);
                            var checkup="update appointment set patient='"+req.body.patient+"',status='Fixed' where doctor='"+req.body.doctor+"' and date='"+req.body.nextdate+"' and slot='"+req.body.slot+"' ";
                            con.query(checkup, function (err,checkup,fields) {
                             if (err){
                               console.log("error ocurrred",err);
                               res.render('treatment',{user:req.session.user,status:"*error in fixing checkup"});
                             }//found appintments from doctor
                             else{
                               console.log("checkup fixed",checkup);
                               mail.send_email(res,'',"Medical System","gadarsh780@gmail.com","zinfwpjphbywlekm",patient[0].email,"Medical System","Your Next Checkup is fixed with Patient Id : "+req.body.patient+" on Date : "+req.body.nextdate+" at Time-Slot : "+req.body.slot+" and Doctor Id : "+req.body.doctor+".",'','');
                               res.render('treatment',{user:req.session.user,email:"An email is sent to the patient with all the details for the next checkup.",status:"*Treatment is Registered and Next Checkup is Scheduled Successfully."});
                             }//else
                            });//query for fixing checkup by updating appointment 
                          }//else
                        });//againg finding those 12 rows after insertion
                      }//else after inserting all 12 values
                    });//insert all the appointments
                  }//else
                });//finding search in appointment
            
               }//if to appoint for next checkup
               else{
                res.render('treatment',{user:req.session.user,status:"*Treatment is Registered Successfully."});
               }//else to not appoint next checkup
              }//row is inserted in treatment
          });//query to insert row in treatment
        }//else updated status of patient appointment
      });//query to update staus of appointment from fixed to completed
      
    }//else patient exists
   });//query to check if the patient exists or not
   

   
  
});//router for the post of the treatment page


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
  