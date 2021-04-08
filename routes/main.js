const { query } = require("express");

module.exports=(app)=>{
    const { check, validationResult } = require("express-validator");
    const redirectLogin = (req, res, next) => {
        if (!req.session.username) {
          res.redirect("./login");
        } else {
          next();
        }
      };
    const username= null;
    app.get("/",(req,res)=>{
        res.render("home.ejs", {message: "", username : req.session.username==null? null : req.session.username});
        
    })

    app.get("/about",(req,res)=>{
        res.render("about.ejs", {username : req.session.username==null? null : req.session.username});
    })

    app.get("/addFood" , redirectLogin, (req,res)=>{
        res.render("addFood.ejs", {message: "", username:req.session.username});
    })

    app.get("/login",(req,res)=>{
        res.render("loginPage.ejs", {message: "", username:req.session.username});
    })

    app.get("/register", (req,res)=>{
        res.render("register.ejs" , {message : "", username:req.session.username});
    })

    app.get("/searchFood", (req,res)=>{
        res.render("searchfood.ejs" , {message : "", username:req.session.username, searchResult: null, keyword : null});
    })

    app.get("/updateFood",redirectLogin ,(req,res)=>{
        res.render("updateFood.ejs" , {message : "", username:req.session.username, searchResult: null, keyword : null});
    })

    app.post("/register_submitted",    [
        check("email").isEmail(),
        check("password").not().isEmpty().isLength({ min: 8 }),
      ], (req,res)=>{
        const bcrypt = require("bcrypt"); //importing bcrypt object
        const saltRounds = 10; //salt rounds for spicing up the hashing security
        const MongoClient = require("mongodb").MongoClient; //get mongoDB
        const url = "mongodb://localhost"; //get mondoDB url
        const account={
            firstname : req.sanitize(req.body.firstname),
            lastname : req.sanitize(req.body.lastname),
            username : req.sanitize(req.body.username),
            email : req.sanitize(req.body.email),
            password : req.sanitize(req.body.password), //Retrieving plain password from the body
        }
        const errors = validationResult(req);



        if (!errors.isEmpty()) {
            res.render("/register", { message: "Invalid email or password",type : "reject" , username:req.session.username});
            return;
        }

        MongoClient.connect(url, (err, client) => {
            if(err) throw err;
            const db = client.db("calorieBuddy"); //connects to myBookshop db
            const query1 = {
                username: account.username,
            }

            const query2 ={
                email : account.email
            }
            db.collection("users").findOne({$or :[query1, query2]}, (err,result)=>{
                if(err) throw err;
                if(result!=null){
                    res.render("register.ejs",  {message : "username or email is already taken!",type : "reject", username:req.session.username})
                    client.close();
                }else{
                    bcrypt.hash(account.password, saltRounds, (err, hashedPassword)=>{
                        if(err) throw err;
                        account.password=hashedPassword;
                        db.collection("users").insertOne(account, (err, result)=>{
                            if(err) throw err;
                            res.render("register.ejs",  {message : "Account registered!",type : "accept", username:req.session.username});
                            client.close();
                        });
                           

                    })

                }

            });
        });        

    })


    app.post("/login_submitted", (req, res) => {
        const bcrypt = require("bcrypt"); //imports bcrypt as an object
        //variables for MongoDB , needed for connection
        var MongoClient = require("mongodb").MongoClient;
        var url = "mongodb://localhost";
        const query={
            username : req.sanitize(req.body.username),
        }
        //establishing mongoDB connection
        MongoClient.connect(url, (err, client) => {
          if (err) throw err;
          var db = client.db("calorieBuddy");
          //querying user data from users collections, retrieving data only equal to the name the user has entered
          db.collection("users").findOne(query, (err, result) => {
            if (err) throw err;
    
            //condition to check if result is not null, if it is, a response of access denied is sent
            if (result == null)
                res.render("loginPage.ejs", {message: "username or password is incorrect",type : "reject", username:req.session.username});
            else {
              req.session.username = query.username;
              //store plain password and userData's hash password in local variables
              let plainPassword = req.sanitize(req.body.password);
              let hash = result.password;
              //Will first check if both, plainPassword & hash arent null, otherwise this will throw an error
              if (plainPassword != null && hash != null) {
                //Will use bcrypt to compare the plain password and hash password;
                bcrypt.compare(plainPassword, hash, (err, result) => {
                  if (err) throw err;
                  if (result) {
                    //if result is true, the login is successful
                    res.render("home.ejs", {message: "Logged in successful!", type : "accept", username:req.session.username});
                  } else {
                    //however is result is false, use will be presented with this message bellow
                    res.render("loginPage.ejs", {message: "username or password is incorrect",type : "reject", username:req.session.username});
                  }
                  client.close(); //close client to prevent data leak
                });
              }
            }
          });
        });
      });
    

    app.post("/foodAdded", (req,res)=>{
        const MongoClient = require("mongodb").MongoClient; //get mongoDB
        const url = "mongodb://localhost"; //get mondoDB url
        const query={
            name:req.body.name,
            value:req.body.value,
            unit:req.body.unit,
            calories:req.body.calories,
            carbs:req.body.carbs,
            fat:req.body.fat,
            protein:req.body.protein,
            salt:req.body.salt,
            sugar:req.body.sugar,
            image: req.body.image,
            author : req.session.username
        }

        MongoClient.connect(url, (err, client)=>{
            const db = client.db("calorieBuddy"); //connects to myBookshop db
            db.collection("food").insertOne(query, (err, result)=>{
                if(err)throw err;
                res.render("addFood.ejs",{message: "Food added!", type : "accept", username:req.session.username});
            });
        })
    });

 //searchresult page
    app.post("/foodSearched", (req, res) => {
        //returns results of books based off search keyword
        var MongoClient = require("mongodb").MongoClient;
        var url = "mongodb://localhost";
        let searchWord = req.sanitize(req.body.name.trim()); //retrieve keyword and store it in the keyword variable
        if(searchWord==null){
            searchWord="";
        }
        MongoClient.connect(url, searchWord, (err, client) => {
        //connects to database
        if (err) throw err; //error handling
        var db = client.db("calorieBuddy"); //connects to myBookshop db
        //retrieves list of books from books collections with the help of rejex escape to prevent a few bugs, stores the results in an object array called results
        db.collection("food")
            .find({ name: { $regex: escapeRegExp(searchWord), $options: "i" } })
            .toArray((findErr, results) => {
            if (findErr) throw findErr;
            else{
                if(results.length>0){
                    res.render("searchfood.ejs" , {message : results.length+" results found for "+searchWord,type:"accept", username:req.session.username, searchResult: results, keyword: searchWord});

                }else{
                    res.render("searchfood.ejs" , {message : "No results were found for "+searchWord,type:"reject", username:req.session.username, searchResult: results, keyword: searchWord});

                }
            }
            client.close();
            });
        });
    });


     //searchresult page for updateFood page
     app.post("/updateFoodSearched", (req, res) => {
        //returns results of books based off search keyword
        var MongoClient = require("mongodb").MongoClient;
        var url = "mongodb://localhost";
        let searchWord = req.sanitize(req.body.name.trim()); //retrieve keyword and store it in the keyword variable
        if(searchWord==null){
            searchWord="";
        }
        MongoClient.connect(url, searchWord, (err, client) => {
        //connects to database
            if (err) throw err; //error handling
            var db = client.db("calorieBuddy"); //connects to myBookshop db
            //retrieves list of books from books collections with the help of rejex escape to prevent a few bugs, stores the results in an object array called results
            db.collection("food")
                .find({ name: { $regex: escapeRegExp(searchWord), $options: "i" } })
                .toArray((findErr, results) => {
                if (findErr) throw findErr;
                else{
                    if(results.length==0){
                        res.render("updateFood.ejs" , {message : "Could not find any results for "+searchWord, type:"reject", username:req.session.username, searchResult: results, keyword: searchWord});
                    }else{
                        res.render("updateFood.ejs" , {message : "", username:req.session.username, searchResult: results, keyword: searchWord});
                    }
                }
                client.close();
                });
        });
    });

    app.post("/updateFood", (req,res)=>{
        var MongoClient = require("mongodb").MongoClient;
        var url = "mongodb://localhost";
        var author = req.body.author;
        if(req.session.username==author){
            MongoClient.connect(url, (err, client) => {
                //connects to database
                if (err) throw err; //error handling
                var db = client.db("calorieBuddy"); //connects to myBookshop db
                let query={
                    name:req.body.name,
                    value: req.body.value,
                    unit: req.body.unit,
                    calories: req.body.calories,
                    carbs: req.body.carbs,
                    protein: req.body.protein,
                    salt: req.body.salt,
                    sugar: req.body.sugar,
                    image: req.body.image
                }
                db.collection("food").updateOne({"author":author}, {$set: query}, (err, result)=>{
                    if(err) throw err;
                    res.render("updateFood.ejs" , {message :req.body.name+" has been updated!" , type:"accept", username:req.session.username, searchResult: null, keyword: null});

                });
                
            });
        }else{
            res.render("updateFood.ejs" , {message : "Only "+author+" can edit this!", type:"reject", username:req.session.username, searchResult: null, keyword: null});

        }
    });


    app.post("/deleteFood", (req,res)=>{
        var MongoClient = require("mongodb").MongoClient;
        var url = "mongodb://localhost";
        var author = req.body.author;

        var ObjectId = require('mongodb').ObjectId; 
        console.log(req.body);
        var id = new ObjectId(req.body.id);
        if(req.session.username==author){
            MongoClient.connect(url, (err, client) => {
                //connects to database
                if (err) throw err; //error handling
                var db = client.db("calorieBuddy"); //connects to myBookshop db
                let query={
                    id:req.body.id,
                }
                db.collection("food").deleteOne({"_id":id}, (err, result)=>{
                    if(err) throw err;
                    res.render("updateFood.ejs" , {message :req.body.name+" has been deleted!" , type:"accept", username:req.session.username, searchResult: null, keyword: null});

                });
                
            });
        }else{
            res.render("updateFood.ejs" , {message : "Only "+author+" can delete this!", type:"reject", username:req.session.username, searchResult: null, keyword: null});

        }
    });


    app.get("/listFood", (req,res)=>{
        var MongoClient = require("mongodb").MongoClient;
        var url = "mongodb://localhost";
        MongoClient.connect(url, (err, client) => {
            if(err) throw err;
            var db = client.db("calorieBuddy"); //connects to myBookshop db
            db.collection("food").find().toArray((err,result)=>{
                if(err) throw err;
                res.render("listFood.ejs" , {message : "", username:req.session.username, searchResult: result});

            });
        });
    });

    app.get("/api",(req,res)=>{
        var MongoClient = require('mongodb').MongoClient;
        var url = 'mongodb://localhost';
        MongoClient.connect(url, function (err, client) {
            if (err) throw err                                                                                                                                                
            var db = client.db('calorieBuddy');                                                                                                                                                                   
            db.collection('food').find().toArray((findErr, results) => {                                                                                                                                
            if (findErr) throw findErr;
            else
                res.json(results);                                                                                                                                             
                client.close();                                                                                                                                                   
            });
        });    

    });



    app.get("/logOut", (req,res)=>{
        req.session.destroy((err) => {
            if (err) return res.redirect("/");
        });
        res.render("home.ejs", {message: "", username : null});
    })




}


//used for escaping regular expression characters
function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
  