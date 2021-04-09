const { query } = require("express");

module.exports=(app)=>{
    const { check, validationResult } = require("express-validator");
    const redirectLogin = (req, res, next) => {//rediect login called if the user is not logged in.
        if (!req.session.username) {
          res.redirect("./login");//redirects them to login page
        } else {
          next();
        }
      };
    const username= null;
    //All the get routes
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
        const account={//storing inputs into account object
            firstname : req.sanitize(req.body.firstname),//sanitizing the inputs
            lastname : req.sanitize(req.body.lastname),
            username : req.sanitize(req.body.username),
            email : req.sanitize(req.body.email),
            password : req.sanitize(req.body.password), //Retrieving plain password from the body
        }
        const errors = validationResult(req);//getting the error validator


        //checks to see if any errors exist
        if (!errors.isEmpty()) {//if error does exist, then the user will be presented with a reject message on the same page they are in
            res.render("register.ejs", { message: "Invalid email or password",type : "reject" , username:req.session.username});
            return;
        }

        MongoClient.connect(url, (err, client) => {
            if(err) throw err;
            const db = client.db("calorieBuddy"); //connects to calorieBuddy db
            const query1 = {//storing query1
                username: account.username,
            }

            const query2 ={//storying query2
                email : account.email
            }                           //checking to see if username or email exists
            db.collection("users").findOne({$or :[query1, query2]}, (err,result)=>{
                if(err) throw err;
                if(result!=null){       //if username or exmail exists, then the user will be prompt a message suggesting that the inputted username or email is already taken
                    res.render("register.ejs",  {message : "username or email is already taken!",type : "reject", username:req.session.username})
                    client.close();//closes the db connection
                }else{       //if all goes well, the password is hashed
                    bcrypt.hash(account.password, saltRounds, (err, hashedPassword)=>{
                        if(err) throw err;
                        account.password=hashedPassword;//storing the new hashed password here
                        db.collection("users").insertOne(account, (err, result)=>{//proceeds to initialise the final register stage by adding in the new user to the user collection
                            if(err) throw err;
                            res.render("register.ejs",  {message : "Account registered!",type : "accept", username:req.session.username});//user is presented with a message on the same page confirming that they have successfully registered
                            client.close();//db connection closes
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
    

    app.post("/foodAdded", redirectLogin,//adding form validation checks for each inpits
        [check("name").not().isEmpty(),//checking if all inputs are not empty
        check("value").not().isEmpty().isFloat(),//and checking if relevant data is added,
        check("unit").not().isEmpty(),//e.g unit shouldnt be empty
        check("calories").not().isEmpty().isFloat(),//e.g calories should be a floating point number
        check("carbs").not().isEmpty().isFloat(),
        check("fat").not().isEmpty().isFloat(),
        check("protein").not().isEmpty().isFloat(),
        check("salt").not().isEmpty().isFloat(),
        check("sugar").not().isEmpty().isFloat(),
        check("image").not().isEmpty(),
    ] ,(req,res)=>{

    const errors = validationResult(req);//for form error checking
    if (!errors.isEmpty()) {//checks to see if theres any errors
        res.render("addFood.ejs", { message: "Invalid inputs!",type : "reject" , username:req.session.username});
        return;
    }
        const MongoClient = require("mongodb").MongoClient; //get mongoDB
        const url = "mongodb://localhost"; //get mondoDB url
        const query={//Query which will contain all the inputted form values
            name:req.sanitize(req.body.name),
            value:req.sanitize(req.body.value),
            unit:req.sanitize(req.body.unit),
            calories:req.sanitize(req.body.calories),
            carbs:req.sanitize(req.body.carbs),
            fat:req.sanitize(req.body.fat),
            protein:req.sanitize(req.body.protein),
            salt:req.sanitize(req.body.salt),
            sugar:req.sanitize(req.body.sugar),
            image: req.sanitize(req.body.image),
            author : req.sanitize(req.session.username)//includes the user who added this as the author
        }

        MongoClient.connect(url, (err, client)=>{//connects to db
            const db = client.db("calorieBuddy"); //connects to calorieBuddy db
            db.collection("food").insertOne(query, (err, result)=>{//inserts the inputted food into the back end
                if(err)throw err;
                res.render("addFood.ejs",{message: "Food added!", type : "accept", username:req.session.username});//message is displayed to the user to confirm that the food has been added
            });
        })
    });

 //searchresult page
    app.get("/foodSearched", (req, res) => {
        //returns results of food based off search keyword
        var MongoClient = require("mongodb").MongoClient;
        var url = "mongodb://localhost";
        let searchWord = req.sanitize(req.query.name.trim()); //retrieve keyword and store it in the keyword variable
        if(searchWord==null){
            searchWord="";
        }
        MongoClient.connect(url, searchWord, (err, client) => {
        //connects to database
        if (err) throw err; //error handling
        var db = client.db("calorieBuddy"); //connects to calorieBuddy db
        //retrieves list of food from foood collections with the help of rejex escape to prevent a few bugs, stores the results in an object array called results
        db.collection("food")
            .find({ name: { $regex: escapeRegExp(searchWord), $options: "i" } })
            .toArray((findErr, results) => {
            if (findErr) throw findErr;
            else{
                if(results.length>0){
                    res.render("searchfood.ejs" , {message : results.length+" results found for "+searchWord,type:"accept", username:req.session.username, searchResult: results, keyword: searchWord});// displays message to the user telling them that no food of the one they searched for appeared

                }else{
                    res.render("searchfood.ejs" , {message : "No results were found for "+searchWord,type:"reject", username:req.session.username, searchResult: results, keyword: searchWord});// displays a message to the user confirming search results

                }
            }
            client.close();//closes database
            });
        });
    });


     //searchresult page for updateFood page
     app.get("/updateFoodSearched", redirectLogin,(req, res) => {
        //returns results of food based off search keyword
        var MongoClient = require("mongodb").MongoClient;
        var url = "mongodb://localhost";
        let searchWord = req.sanitize(req.query.name.trim()); //retrieve keyword and store it in the keyword variable
        if(searchWord==null){
            searchWord="";
        }
        MongoClient.connect(url, searchWord, (err, client) => {
        //connects to database
            if (err) throw err; //error handling
            var db = client.db("calorieBuddy"); //connects to calorieBuddy db
            //retrieves list of food from food collections with the help of rejex escape to prevent a few bugs, stores the results in an object array called results
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



    app.post("/updateFood", redirectLogin,  [//adding form validation checks for each inpits
        check("name").not().isEmpty(),//checking if all inputs are not empty
        check("value").not().isEmpty().isFloat(),//and checking if relevant data is added,
        check("unit").not().isEmpty(),//e.g unit shouldnt be empty
        check("fat").not().isEmpty().isFloat(),//e.g calories should be a floating point number
        check("carbs").not().isEmpty().isFloat(),
        check("calories").not().isEmpty().isFloat(),
        check("protein").not().isEmpty().isFloat(),
        check("salt").not().isEmpty().isFloat(),
        check("sugar").not().isEmpty().isFloat(),
        check("image").not().isEmpty(),
      ] ,(req,res)=>{

        const errors = validationResult(req);//for form error checking
        if (!errors.isEmpty()) {//Checks to see if theres any errors
            res.render("updateFood.ejs" , { message: "Invalid inputs!",type : "reject", username:req.session.username, searchResult: null, keyword: null}); //if there are errors, the user are prompted with an "invalid input" message notifcation on the same page
            return;
        }



        var MongoClient = require("mongodb").MongoClient;//gets mongoclient
        var url = "mongodb://localhost";//gets client
        var author = req.body.author;//gets the author
        if(req.session.username==author){//checks to see if the author is the user who created that food, as only the authour can update/ delete food
            MongoClient.connect(url, (err, client) => {
                //connects to database
                if (err) throw err; //error handling
                var db = client.db("calorieBuddy"); //connects to calorieBuddy db
                let query={//Query which will contain all the inputted form values
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
                
                var ObjectId = require('mongodb').ObjectId; //creates new object id , used for querying
                var id = new ObjectId(req.body.id);

                db.collection("food").updateOne({"_id":id}, {$set: query}, (err, result)=>{//proceeds to update the food
                    if(err) throw err;
                    res.render("updateFood.ejs" , {message :req.body.name+" has been updated!" , type:"accept", username:req.session.username, searchResult: null, keyword: null});//if update successfully, the user will get a message "FOODNAME has been updated!" 

                });
                client.close(); //closes the db
                
            });
        }else{
            res.render("updateFood.ejs" , {message : "Only "+author+" can edit this!", type:"reject", username:req.session.username, searchResult: null, keyword: null});//if the user is not the author, then they are presented with "only USER can edit this" message on the same page

        }
    });


    app.post("/deleteFood", redirectLogin,(req,res)=>{
        var MongoClient = require("mongodb").MongoClient;
        var url = "mongodb://localhost";
        var author = req.body.author;//gets the author and stores it in a variable

        var ObjectId = require('mongodb').ObjectId; 
        var id = new ObjectId(req.body.id);//gets the id
        if(req.session.username==author){//checks to see if the user who is trying to delete is the author (the one who added the food to the system)
            MongoClient.connect(url, (err, client) => {
                //connects to database
                if (err) throw err; //error handling
                var db = client.db("calorieBuddy"); //connects to calorieBuddy db
                let query={//query which stores the id as input query
                    id:req.body.id,
                }
                db.collection("food").deleteOne({"_id":id}, (err, result)=>{//delete process happens here
                    if(err) throw err;
                    res.render("updateFood.ejs" , {message :req.body.name+" has been deleted!" , type:"accept", username:req.session.username, searchResult: null, keyword: null});//User is shown a message confirming the food has been deleted

                });
                
            });
        }else{
            res.render("updateFood.ejs" , {message : "Only "+author+" can delete this!", type:"reject", username:req.session.username, searchResult: null, keyword: null});//If the user isnt the author, then they are shown a "only USER can delete this" message, and will be prevented from deleting it

        }
    });


    app.get("/listFood", (req,res)=>{
        var MongoClient = require("mongodb").MongoClient;
        var url = "mongodb://localhost";
        MongoClient.connect(url, (err, client) => {
            if(err) throw err;
            var db = client.db("calorieBuddy"); //connects to calorieBuddy db
            db.collection("food").find().toArray((err,result)=>{//retrieves the list of all food
                if(err) throw err;
                res.render("listFood.ejs" , {message : "", username:req.session.username, searchResult: result});//displays the food uses listFood.ejs, passed in the results for it to be visulised into a table

            });
        });
    });

    //Logout route
    app.get("/logOut", (req,res)=>{
        req.session.destroy((err) => {//destroyes the session, ending the session 
            if (err) return res.redirect("/");//error handling , redirects you to home page
        });
        res.render("home.ejs", {message: "Logged out!" ,type:"accept", username : null});//once session ended, user is redirected back to home page, and a message confirming that they logged out is shown
    })



    //-----------
    //API SECTION
    //------------


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

    //api post which used to food data to the back end
    app.post("/api/post",
       [check("name").not().isEmpty(),//validation check occures here to ensure the inputs are all valid
        check("value").not().isEmpty().isFloat(),
        check("unit").not().isEmpty(),
        check("calories").not().isEmpty().isFloat(),
        check("carbs").not().isEmpty().isFloat(),
        check("fat").not().isEmpty().isFloat(),
        check("protein").not().isEmpty().isFloat(),
        check("salt").not().isEmpty().isFloat(),
        check("sugar").not().isEmpty().isFloat(),
        check("image").not().isEmpty(),
    ] ,(req,res)=>{
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.send("Invalid input!")
        return;
    }
        
        const MongoClient = require("mongodb").MongoClient; //get mongoDB
        const url = "mongodb://localhost"; //get mondoDB url
        const query={//query stores all the inputs recieved
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
            const db = client.db("calorieBuddy"); //connects to calorieBuddy db
            db.collection("food").insertOne(query, (err, result)=>{//peforms the insertOne functionality
                if(err)throw err;
            });
        })

        
    
    });



    //for getting exactly 1 food recipe using the ID mongo provides with
    app.get("/api/id/:id",(req,res)=>{
        var MongoClient = require('mongodb').MongoClient;
        var url = 'mongodb://localhost';

        var ObjectId = require('mongodb').ObjectId; //used for processing the ID
        var id = new ObjectId(req.params.id);//recieves the id from the parameter, makes a instance of it using the ObjectID

        MongoClient.connect(url, (err, client) => {
            //connects to database
            if (err) throw err; //error handling
            var db = client.db("calorieBuddy"); //connects to calorieBuddy db
            //retrieves list of food from foood collections with the help of rejex escape to prevent a few bugs, stores the results in an object array called results
            db.collection("food").findOne({ _id:id }, (err, result)=>{
                if(err) throw err;
                res.json(result);                                                                                                                                             
                client.close();      

            })
                
        });

    });

    //for getting food with the exact same name provided, however may list other food that may have the same name
    app.get("/api/name/:name",(req,res)=>{
        var MongoClient = require('mongodb').MongoClient;
        var url = 'mongodb://localhost';
        var name = req.sanitize(req.params.name);
        //connects to database
        MongoClient.connect(url, function (err, client) {
            if (err) throw err                                                                                                                                                
            var db = client.db('calorieBuddy');                                                                                                                                                                   
            db.collection('food').find({"name":name}).toArray((findErr, results) => {                                                                                                                                
            if (findErr) throw findErr;
            else
                res.json(results);                                                                                                                                             
                client.close();                                                                                                                                                   
            });
        });  

    });

    //for getting all food that was posted by the author
    app.get("/api/author/:author",(req,res)=>{
        var MongoClient = require('mongodb').MongoClient;
        var url = 'mongodb://localhost';
        var author = req.sanitize(req.params.author);
        MongoClient.connect(url, function (err, client) {
            if (err) throw err                                                                                                                                                
            var db = client.db('calorieBuddy');                                                                                                                                                                   
            db.collection('food').find({"author":author}).toArray((findErr, results) => {                                                                                                                                
            if (findErr) throw findErr;
            else
                res.json(results);                                                                                                                                             
                client.close();                                                                                                                                                   
            });
        });  
    });

    //for updating food using a specific id
    app.patch("/api/id/:id", (req,res)=>{
        var MongoClient = require('mongodb').MongoClient;
        var ObjectId = require('mongodb').ObjectId; //used for processing the ID
        var id = new ObjectId(req.params.id);//recieves the id from the parameter, makes a instance of it using the ObjectID

        res.send(req.body);
    });



    app.patch("/api/id/:id", redirectLogin,  [//adding form validation checks for each inpits
        check("name").not().isEmpty(),//checking if all inputs are not empty
        check("value").not().isEmpty().isFloat(),//and checking if relevant data is added,
        check("unit").not().isEmpty(),//e.g unit shouldnt be empty
        check("fat").not().isEmpty().isFloat(),//e.g calories should be a floating point number
        check("carbs").not().isEmpty().isFloat(),
        check("calories").not().isEmpty().isFloat(),
        check("protein").not().isEmpty().isFloat(),
        check("salt").not().isEmpty().isFloat(),
        check("sugar").not().isEmpty().isFloat(),
        check("image").not().isEmpty(),
      ] ,(req,res)=>{

        const errors = validationResult(req);//for form error checking
        if (!errors.isEmpty()) {//Checks to see if theres any errors
            res.render("updateFood.ejs" , { message: "Invalid inputs!",type : "reject", username:req.session.username, searchResult: null, keyword: null}); //if there are errors, the user are prompted with an "invalid input" message notifcation on the same page
            return;
        }



        var MongoClient = require("mongodb").MongoClient;//gets mongoclient
        var url = "mongodb://localhost";//gets client
       
        MongoClient.connect(url, (err, client) => {
                //connects to database
                if (err) throw err; //error handling
                var db = client.db("calorieBuddy"); //connects to calorieBuddy db
                let query={//Query which will contain all the inputted form values
                    name:req.sanitize(req.body.name),
                    value: req.sanitize(req.body.value),
                    unit: req.sanitize(req.body.unit),
                    calories: req.sanitize(req.body.calories),
                    carbs: req.sanitize(req.body.carbs),
                    protein: req.sanitize(req.body.protein),
                    salt: req.sanitize(req.body.salt),
                    sugar: req.sanitize(req.body.sugar),
                    image: req.sanitize(req.body.image)
                }
                
                var ObjectId = require('mongodb').ObjectId; //creates new object id , used for querying
                var id = new ObjectId(req.params.id);//gets the id

                db.collection("food").updateOne({"_id":id}, {$set: query}, (err, result)=>{//proceeds to update the food
                    if(err) throw err;
                    res.send("food updated!")
                });
                client.close(); //closes the db
                
        });
    });


    app.delete("/api/id/:id", redirectLogin,(req,res)=>{
        var MongoClient = require("mongodb").MongoClient;
        var url = "mongodb://localhost";
        var author = req.body.author;//gets the author and stores it in a variable

        var ObjectId = require('mongodb').ObjectId; 
        var id = new ObjectId(req.params.id);//gets the id
      
         MongoClient.connect(url, (err, client) => {
                //connects to database
                if (err) throw err; //error handling
                var db = client.db("calorieBuddy"); //connects to calorieBuddy db
                db.collection("food").deleteOne({"_id":id}, (err, result)=>{//delete process happens here
                    if(err) throw err;
                    res.send("Food deleted!")
                });
                
        });
       
    });









}


//used for escaping regular expression characters
function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
  