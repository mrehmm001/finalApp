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

app.use(expressSanitizer());//lets app use the sanitizer functionality

app.use(express.static('views'));//this is used so that style.css and other files can be located


//lets the app use session functionality
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

app.listen(port, () => console.log(`listening on port ${port}!`));

