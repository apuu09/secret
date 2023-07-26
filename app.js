//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//  use password encryption 
 // const encrypt = require('mongoose-encryption');
 //bcrypt password
 const bcrypt = require('bcrypt');
 const saltRounds = 10;
// hashing Function
 var md5 = require('md5'); 
 const session = require('express-session');
 const passport = require("passport");
 const passportLocalMongoose = require("passport-local-mongoose");
  //mongoose findocreate oauth declartion
 const findOrCreate = require('mongoose-findorcreate');
 const GoogleStrategy = require('passport-google-oauth20').Strategy;


const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}))

//session
app.use(session({
   secret:"Our Litele secret.",
   resave: false,
   saveUninitialized: false,
   cookie: { secure: true }
 }));



//passport
app.use(passport.initialize());

//passport session
app.use(passport.session());

//connect with database 
mongoose.connect("mongodb+srv://apekshajadhav:user123@cluster0.f22obfq.mongodb.net/usserDB");

// {useNewUrlParser: true, useCreateIndex: true});
 


// //set passport session
//   mongoose.set("useCreateIndex",false);

// encryption code plugin
const userSchema =new mongoose.Schema({
   email: String,
   password : String,
   googleId: String,
   secret: String
});
// //add secret code
// const secret = "thisisthelittelencryprion";
//plugin add for encryption password
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedfiled: {password: true}});

//passport plugin
userSchema.plugin(passportLocalMongoose);

//o auth plugin 
userSchema.plugin(findOrCreate);

const user = new mongoose.model("user",userSchema);

passport.use(user.createStrategy());

//passport serial
passport.serializeUser(function(user, done) {
   done(null, user.id);
 });
 
 passport.deserializeUser(function(id, done) {
   user.findById(id, function(err, user) {
     done(err, user);
   });
 });


//o auth code
passport.use(new GoogleStrategy({
   clientID: process.env.CLIENT_ID,
   clientSecret: process.env.CLIENT_SECRET,
   callbackURL: "https://localhost:3000/auth/google/secrets",
   userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
 },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    user.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



//home page
app.get("/",function(req,res)
 {
    res.render("home");
 });
 //auth 
 app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
  });

 //login page
 app.get("/login",function(req,res)
 {
    res.render("login");
 });

 //register page
 app.get("/register",function(req,res)
 {
    res.render("register");
 });

 app.get("/secrets", function(req, res){
   user.find({"secret": {$ne: null}}, function(err, foundUsers){
     if (err){
       console.log(err);
     } else {
       if (foundUsers) {
         res.render("secrets", {usersWithSecrets: foundUsers});
       }
     }
   });
 });
 


 app.get("/submit", function(req, res){
   if (req.isAuthenticated()){
     res.render("submit");
   } else {
     res.redirect("/login");
   }
 });
 app.post("/submit", function(req, res){
   const submittedSecret = req.body.secret;
 
 //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
   // console.log(req.user.id);
 
   userser.findById(req.user.id, function(err, foundUser){
     if (err) {
       console.log(err);
     } else {
       if (foundUser) {
         foundUser.secret = submittedSecret;
         foundUser.save(function(){
           res.redirect("/secrets");
         });
       }
     }
   });
 });
 

 app.get("/logout",function(req, res)
 {
    res.logout();
    res.redirect("/");
 });

 


//registration 
app.post("/register", function(req, res){

// //bcrypt hashing function
//    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//       const newUser = new user({
//          email: req.body.username,
//          password: hash
//      });
  
//      newUser.save().then(()=>{
//          res.render("secrets");
//      }).catch((err)=>{
//          console.log(err);
//      })
//   }); 


//passport
user.register({username: req.body.username}, req.body.password, function(err,user){
if(err){
   console.log(err);
   res.redirect("/register");
} else {
   passport.authenticate("local")(req,res, function(){
      res.redirect("/secrets");
   });
}
});
  });
  


//login user with  registerd user and password
app.post("/login", function(req, res){
//    const username = req.body.username;
//    const password = req.body.password;

//   user.find({email:username}, function(err, founduser){
//         if(err){
//            console.log(err);
//            return;
//         } else {
//            if(founduser){  
//             //use bcrypt hashing function
//             bcrypt.compare(password, founduser.password, function(err, result) {
//                if(result === true){
//                res.render("secrets");
//                return;
//             }
//            });
//             return;
//               }
//            }
//            return;
//         });


const user = new user({
   username: req.body.username,
   password: req,body,password

});
req.login(user, function(err){
   if(err){
      console.log(err);
   }else {
      passport.authenticate("local")(req, res, function(){
         res.redirect("/secrets");

      });

   }
})

     });



//server started on port 
app.listen(3000,function(req,res)
{
    console.log("server started at port 3000");
});
