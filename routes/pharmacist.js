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

router.get('/:id/pharmacist/search',checkSignIn,function(err,req,res,next){
  console.log("i am inside get home ");
  console.log("error : ",err);
  res.redirect('/login');
},function(req,res){
  var date = req.query.date;
  var find = "select * from treatment where date='"+date+"' ";
  con.query(find, function (err,treatment,fields) {
    if(err){
      console.log("error ocurred finding treatment",err);
      res.render('pharprofile',{user:req.session.user,status : "Error in getting the treatments"});
    }
    else{
      console.log("got the treatments",treatment);
      res.render('pharprofile',{user:req.session.user,treatment : treatment,status:"Number of patients received treatment on date: '"+date+"' are : "+treatment.length+"  "});
    }
  });//query to find the treatments of patient on a date
});//router to render to the treatment page

router.get('/:id/medicine',checkSignIn,function(err,req,res,next){
  console.log("i am inside get home ");
  console.log("error : ",err);
  res.redirect('/login');
},function(req,res){
  var med = req.query.medicine;
  console.log('medicines before',med);

  var quantity = new Array();
  quantity = med.match(/\d+/g); //getting all the medicines
  for(var i=0;i<quantity.length;i++){
    quantity[i] = parseInt(quantity[i]);
  }//printing medicines
  console.log('medicines quantity',quantity);

  var medicine =  new Array();
  med = med.toLowerCase();
  medicine = med.split(",");
  console.log('medicines are : ',medicine);
  var price = [];
  var status = [];
  var total = 0;
  var promise = [];

  for(var i=0;i<medicine.length;i++){
    medicine[i] = medicine[i].replace(/[^a-z]/g, '');
     promise.push(new Promise((resolve)=>{
      var getprice = "select * from inventory where medicine='"+medicine[i]+"' ";
      con.query(getprice, function (err,getprice,fields) {
        if(err){
          console.log("error ocurred in getting medicine",err)
           res.render("medicine",{user:req.session.user,status:"Error in getting medicines from inventory."});
        }
        else if(getprice.length == 0){
          console.log("medicine not found in inventory");
          status[i] = "Medicine : "+medicine[i]+" is not available in Inventory.";
          resolve(0);
        }//if medicine is not avaialble
        else{
          console.log("medicine found in inventory",getprice);
          console.log("price is :",getprice[0].price);
          resolve(getprice[0].price);
        }//medicine is found in inventory
      });//query to find the medicine price

    }));//promise to get the prices of all the medicines
    
  }//for loop removing all characters except alphabets and getting prices of all the medicines

  Promise.all(promise)
     .then(price =>{
      var numdate = req.query.date.replace(/\D/g,'');

      for(var i=0;i<quantity.length;i++){
        total = total + (price[i]*quantity[i]);
      }//getting total
      console.log("total is :",total);
      var reference = req.query.patient+medicine.length+req.query.doctor+numdate;
    
      console.log('medicines after',medicine);
      req.session.bill = {
        "reference":reference,
        "doctor":req.query.doctor,
        "patient":req.query.patient,
        "date":req.query.date,
        "medicine":medicine,
        "quantity":quantity,
        "price":price,
        "total":total
      };
      res.render('medicine',{status:status,user:req.session.user,reference:reference,medicine:medicine,price:price,total:total,quantity:quantity,date:req.query.date,doctor:req.query.doctor,patient:req.query.patient});
     })//then
     .catch(err => console.log("error ocurred in resolving promise"));
  
});//router to render to the treatment page

router.get('/:id/bill',checkSignIn,function(err,req,res,next){
  console.log("i am inside get home ");
  console.log("error : ",err);
  res.redirect('/login');
},function(req,res){
   console.log("reached inside bill");
   console.log("the bill details are : ",req.session.bill);
    var bill = req.session.bill;

   var treatment = "update treatment set status='yes' where doctor='"+bill.doctor+"' and patient='"+bill.patient+"' and date='"+bill.date+"'  ";
   con.query(treatment, function (err,treatment,fields) {
      if(err){
        console.log("error ",err);
      }
      else{
            var promise = [];
            for(var i=0;i<bill.quantity.length;i++){
                promise.push(new Promise((resolve)=>{
                  var inventory = "update inventory set quantity = quantity - "+bill.quantity[i]+" where medicine='"+bill.medicine[i]+"' ";
                  con.query(inventory, function (err,inventory,fields) {
                    if(err){
                      console.log("error ",err);
                    }
                    else{
                      resolve(0);
                      console.log("medicine "+bill.medicine+" is updated with a value :",bill.quantity);
                    }//else quantity is updated
                  });//query to update inventory
                }));//promise to update inventory table after payment
            }// for to insert promises in array

            Promise.all(promise)
               .then(inventory =>{
                  var billdata = "insert into bill values('"+bill.reference+"','"+bill.doctor+"','"+bill.patient+"','"+bill.date+"','"+bill.total+"') ";
                  con.query(billdata, function (err,billdata,fields) {
                    if(err){
                      console.log("error ",err);
                    }
                    else{
                      console.log("bill inserted successfully",billdata);
                      var status = [];
                      status[0] = "Bill Payment was Successfully recorded and Inventory updated,an email is sent to the patient with all the bill details.";
                      res.render('medicine',{status:status,user:req.session.user,reference:bill.reference,medicine:bill.medicine,price:bill.price,total:bill.total,quantity:bill.quantity,date:bill.date,doctor:bill.doctor,patient:bill.patient,billstatus:1});
                    }//else bill is inserted
                  });//query to insert bill 
               })//then
               .catch(err => console.log("error",err));
      }//else treatment table updated
   });//query to updte treatment table
   
});//router to finally complete payment

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
  