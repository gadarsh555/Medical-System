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


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('register');
});

router.post('/', upload.single('profileimage'),function(req, res, next) {
   
     var register = req.query.register;
     if(req.file){
      console.log("got the image");
      req.body.profileimage = "../../../uploads/profileimage/"+req.file.filename;
    }
    else{
     console.log("no image");
     req.body.profileimage = "../../../uploads/profileimage/"+'default.png';
    }
 
    req.checkBody('name',"*Name is Required").notEmpty();
    req.checkBody('username',"*Username is Required").notEmpty();
    req.checkBody('email',"*Email is Required").notEmpty();
    req.checkBody('email',"*Email is Invalid").isEmail();
    req.checkBody('password',"*Password is Required").notEmpty();
    req.checkBody('phone', '*Phone Number must be 10 digits long ').isLength({ min: 10, max:10 });
    req.checkBody('phone', '*Phone Number has only digits ').isNumeric();
    req.checkBody('phone', '*Phone Number is Required').notEmpty();
    req.checkBody('profileimage', '*Profileimage is Required').notEmpty();
    var regex = /^([a-zA-Z]+\s)*[a-zA-Z]+$/;
    var present ="";
    if(!regex.test(req.body.name)){
      present = "*Text only contains characters";
    }
    
 
    var errors = req.validationErrors(); // storing all the errors in the array
    if (errors || present) {
      console.log("validation errors ");
      res.render('register',{errors : errors , present : present,formData : req.body});
    }
    console.log("no validation errors ");
    console.log("the user details as input are ",req.body);

  // for doctor

     if(register == "doctor"){

      var findemail = "select * from doctor where email='"+req.body.email+"' ";
      var findphone = "select * from doctor where phone='"+req.body.phone+"' ";
      var findusername = "select * from doctor where username='"+req.body.username+"' ";

      var promise = [];
      promise.push(new Promise((resolve)=>{
        con.query(findemail, function (err, result,fields) {
          if (err){
            console.log("error ocurrred",err);
            res.render('index');
          }
          else if(result.length > 0){
            console.log("findemail - 1",result)
            resolve(1);
          }
          else{
            console.log("findemail - 0",result)
            resolve(0);
          }
        });
      }));//promise-1
      promise.push(new Promise((resolve)=>{
        con.query(findphone, function (err, result,fields) {
          if (err){
            console.log("error ocurrred",err);
            res.render('index');
          }
          else if(result.length > 0){
            console.log("findphone - 1",result)
            resolve(1);
          }
          else{
            console.log("findphone - 0",result)
            resolve(0);
          }
        });
      }));//promise-2
      promise.push(new Promise((resolve)=>{
        con.query(findusername, function (err, result,fields) {
          if (err){
            console.log("error ocurrred",err);
            res.render('index');
          }
          else if(result.length > 0){
            console.log("findusername - 1",result)
            resolve(1);
          }
          else{
            console.log("findusername - 0",result)
            resolve(0);
          }
        });
      }));//promise-3
      Promise.all(promise)
         .then(result=> {
          console.log("search results are",result);
            if(result[0] == 1){
              console.log("same email already present ");
              res.render('register',{present : "*Email already present" , formData : req.body});
            }//if
            else if(result[1] == 1){
              console.log("same phone already present ");
              res.render('register',{present : "*Phone already present" , formData : req.body});
            }//elseif
            else if(result[2] == 1){
              console.log("same username already present ");
              res.render('register',{present : "*Username already present" , formData : req.body});
            }//elseif
            else{
              // inserting into db(username,name,email,phone,password)
                  var sql = "INSERT INTO doctor VALUES('"+req.body.username+"','"+req.body.name+"','"+req.body.email+"','"+req.body.phone+"','"+req.body.password+"','"+req.body.profileimage+"')";
                  con.query(sql, function (err, result,fields) {
                    if (err){
                      console.log("error ocurrred",err);
                    }
                    console.log("1 record inserted",result);
                    console.log("fields",fields);
                    req.session.user = req.body;
                    var user = [req.body];
                    res.render('docprofile',{user:user});
                  });//inserting data in db doctor
            }//else 
         })
         .catch(err=> console.log(err));
    
     }//if doctor
     
    // for receptionist

     else if(register == "receptionist"){
      var findemail = "select * from receptionist where email='"+req.body.email+"' ";
      var findphone = "select * from receptionist where phone='"+req.body.phone+"' ";
      var findusername = "select * from receptionist where username='"+req.body.username+"' ";

      var promise = [];
      promise.push(new Promise((resolve)=>{
        con.query(findemail, function (err, result,fields) {
          if (err){
            console.log("error ocurrred",err);
            res.render('index');
          }
          else if(result.length > 0){
            console.log("findemail - 1",result)
            resolve(1);
          }
          else{
            console.log("findemail - 0",result)
            resolve(0);
          }
        });
      }));//promise-1
      promise.push(new Promise((resolve)=>{
        con.query(findphone, function (err, result,fields) {
          if (err){
            console.log("error ocurrred",err);
            res.render('index');
          }
          else if(result.length > 0){
            console.log("findphone - 1",result)
            resolve(1);
          }
          else{
            console.log("findphone - 0",result)
            resolve(0);
          }
        });
      }));//promise-2
      promise.push(new Promise((resolve)=>{
        con.query(findusername, function (err, result,fields) {
          if (err){
            console.log("error ocurrred",err);
            res.render('index');
          }
          else if(result.length > 0){
            console.log("findusername - 1",result)
            resolve(1);
          }
          else{
            console.log("findusername - 0",result)
            resolve(0);
          }
        });
      }));//promise-3
      Promise.all(promise)
         .then(result=> {
          console.log("search results are",result);
            if(result[0] == 1){
              console.log("same email already present ");
              res.render('register',{present : "*Email already present" , formData : req.body});
            }//if
            else if(result[1] == 1){
              console.log("same phone already present ");
              res.render('register',{present : "*Phone already present" , formData : req.body});
            }//elseif
            else if(result[2] == 1){
              console.log("same username already present ");
              res.render('register',{present : "*Username already present" , formData : req.body});
            }//elseif
            else{
              // inserting into db(username,name,email,phone,password)
                  var sql = "INSERT INTO receptionist VALUES('"+req.body.username+"','"+req.body.name+"','"+req.body.email+"','"+req.body.phone+"','"+req.body.password+"','"+req.body.profileimage+"')";
                  con.query(sql, function (err, result,fields) {
                    if (err){
                      console.log("error ocurrred",err);
                    }
                    console.log("1 record inserted",result);
                    console.log("fields",fields);
                    req.session.user = req.body;
                    var user = [req.body];
                    res.render('recprofile',{user:user});
                  });//inserting data in db doctor
            }//else 
         })
         .catch(err=> console.log(err));
    }//elseif

   /// for pharmacist

    else{
      var findemail = "select * from pharmacist where email='"+req.body.email+"' ";
      var findphone = "select * from pharmacist where phone='"+req.body.phone+"' ";
      var findusername = "select * from pharmacist where username='"+req.body.username+"' ";

      var promise = [];
      promise.push(new Promise((resolve)=>{
        con.query(findemail, function (err, result,fields) {
          if (err){
            console.log("error ocurrred",err);
            res.render('index');
          }
          else if(result.length > 0){
            console.log("findemail - 1",result)
            resolve(1);
          }
          else{
            console.log("findemail - 0",result)
            resolve(0);
          }
        });
      }));//promise-1
      promise.push(new Promise((resolve)=>{
        con.query(findphone, function (err, result,fields) {
          if (err){
            console.log("error ocurrred",err);
            res.render('index');
          }
          else if(result.length > 0){
            console.log("findphone - 1",result)
            resolve(1);
          }
          else{
            console.log("findphone - 0",result)
            resolve(0);
          }
        });
      }));//promise-2
      promise.push(new Promise((resolve)=>{
        con.query(findusername, function (err, result,fields) {
          if (err){
            console.log("error ocurrred",err);
            res.render('index');
          }
          else if(result.length > 0){
            console.log("findusername - 1",result)
            resolve(1);
          }
          else{
            console.log("findusername - 0",result)
            resolve(0);
          }
        });
      }));//promise-3
      Promise.all(promise)
         .then(result=> {
          console.log("search results are",result);
            if(result[0] == 1){
              console.log("same email already present ");
              res.render('register',{present : "*Email already present" , formData : req.body});
            }//if
            else if(result[1] == 1){
              console.log("same phone already present ");
              res.render('register',{present : "*Phone already present" , formData : req.body});
            }//elseif
            else if(result[2] == 1){
              console.log("same username already present ");
              res.render('register',{present : "*Username already present" , formData : req.body});
            }//elseif
            else{
              // inserting into db(username,name,email,phone,password)
                  var sql = "INSERT INTO pharmacist VALUES('"+req.body.username+"','"+req.body.name+"','"+req.body.email+"','"+req.body.phone+"','"+req.body.password+"','"+req.body.profileimage+"')";
                  con.query(sql, function (err, result,fields) {
                    if (err){
                      console.log("error ocurrred",err);
                    }
                    console.log("1 record inserted",result);
                    console.log("fields",fields);
                    req.session.user = req.body;
                    var user = [req.body];
                    res.render('pharprofile',{user:user});
                  });//inserting data in db doctor
            }//else 
         })
         .catch(err=> console.log(err));
    }//else
   
});//router for registering 


router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login',function(req,res){
      
      var user = req.body.user;
      var password = req.body.password;

      if(req.query.login == "doctor"){
        
        var sql = "select * from doctor where password='"+password+"' and (email='"+user+"' or username='"+user+"' or phone='"+user+"')";
        con.query(sql, function (err, result,fields) {
          if (err){
            console.log("error ocurrred",err);
          }
          else if(result.length > 0){
            console.log("1 record found",result);
            console.log("fields",fields);
            req.session.user = result;
            res.render('docprofile',{user:result});
          }
          else{
            res.render('login',{loginerror:"*Id or Password did not Matched !"});
          }
      });//query con
    }//if
      else if(req.query.login == "receptionist"){

        var sql = "select * from receptionist where password='"+password+"' and (email='"+user+"' or username='"+user+"' or phone='"+user+"')";
        con.query(sql, function (err, result,fields) {
          if (err){
            console.log("error ocurrred",err);
          }
          else if(result.length > 0){
            console.log("1 record found",result);
            console.log("fields",fields);
            req.session.user = result
            res.render('recprofile',{user:result});
          }
          else{
            res.render('login',{loginerror:"*Id or Password did not Matched !"});
          }
      });//query con
      }//elseif

      else{
        var sql = "select * from pharmacist where password='"+password+"' and (email='"+user+"' or username='"+user+"' or phone='"+user+"')";
        con.query(sql, function (err, result,fields) {
          if (err){
            console.log("error ocurrred",err);
          }
          else if(result.length > 0){
            console.log("1 record found",result);
            console.log("fields",fields);
            req.session.user = result
            res.render('pharprofile',{user:result});
          }
          else{
            res.render('login',{loginerror:"*Id or Password did not Matched !"});
          }
      });//query con
      }
});

module.exports = router;
