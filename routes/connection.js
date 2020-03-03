var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'medical'
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("database Connected!");
  });

  module.exports = con;