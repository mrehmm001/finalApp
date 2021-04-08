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
        res.render("home.ejs", {username : req.session.username==null? null : req.session.username});
    })

    app.get("/about",(req,res)=>{
        res.render("about.ejs", {username : req.session.username==null? null : req.session.username});
    })

    app.get("/addFood" , (req,res)=>{
        res.render("addFood.ejs", {message: "", username:req.session.username});
    })

    app.get("/login",(req,res)=>{
        res.render("loginPage.ejs", {message: "", username:req.session.username});
    })

    app.get("/register", (req,res)=>{
        res.render("register.ejs" , {message : "", username:req.session.username});
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
                }else{
                    bcrypt.hash(account.password, saltRounds, (err, hashedPassword)=>{
                        if(err) throw err;
                        account.password=hashedPassword;
                        db.collection("users").insertOne(account, (err, result)=>{
                            if(err) throw err;
                            res.render("register.ejs",  {message : "Account registered!",type : "accept", username:req.session.username});

                        });

                    })

                }
                client.close();

            });
        });        

    })


    app.post("/login_submitted", (req,res)=>{
        const bcrypt = require("bcrypt"); //importing bcrypt object
        const saltRounds = 10; //salt rounds for spicing up the hashing security
        const MongoClient = require("mongodb").MongoClient; //get mongoDB
        const url = "mongodb://localhost"; //get mondoDB url
        const query={
            username : req.sanitize(req.body.username),
        }
        const plainPassword = req.body.password;
        MongoClient.connect(url, (err, client)=>{
            const db = client.db("calorieBuddy"); //connects to myBookshop db
            db.collection("users").findOne(query, (err,result)=>{
                if(err) throw err;

                if(result!=null){
                    const hashedPassword = result.password;
                    bcrypt.compare(plainPassword,hashedPassword, (err, result)=>{
                    if(err) throw err;
                    if(result){
                            req.session.username = query.username;
                            console.log(req.session.username)
                            res.render("loginPage.ejs", {message: "Logged in successful!", type : "accept", username:req.session.username});
                    }else{
                            res.render("loginPage.ejs", {message: "username or password is incorrect",type : "reject", username:req.session.username});
                    }
                    });
                }
                client.close();
            })

        });

    })

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
        }

        MongoClient.connect(url, (err, client)=>{
            const db = client.db("calorieBuddy"); //connects to myBookshop db
            db.collection("food").insertOne(query, (err, result)=>{
                if(err)throw err;
                res.render("addFood.ejs",{message: "Food added!", type : "accept", username:req.session.username});
            });
        })
    });

    app.get("/logOut", (req,res)=>{
        req.session.destroy((err) => {
            if (err) return res.redirect("/");
        });
        res.render("home.ejs", {username : null});
    })
}