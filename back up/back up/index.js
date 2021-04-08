//import express
var express = require ('express');
//import express session
var session = require('express-session');
//import express validator
var validator = require('express-validator');
//import express sanitizer
var expressSanitizer = require('express-sanitizer');





//pass express object to app
const app = express()
const port = 8000;//port for the web server

app.use(expressSanitizer());

app.use(express.static('views'));

//mongodb database
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost/calorieBuddy";

//connect to mongodb database
MongoClient.connect(url, function(err, db) {

  if (err) throw err;

  console.log("Database created!");

  db.close();

});



app.use(session({
	secret:'myLittleSecret',
	resave: false,
	saveUninitialized: false,
	cookie:{
	   expires:600000	
        }
}));



var bodyParser= require ('body-parser')//body parser used for passing the body content from front end to middleware.
app.use(bodyParser.urlencoded({ extended: true }))
require('./routes/main')(app);//importing main.js routes (middleware)
app.set('views',__dirname + '/views');//setting views directory 
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);//setting view render engine

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

