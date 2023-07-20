//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}))

//connect with database 
mongoose.connect("mongodb+srv://apekshajadhav:user123@cluster0.f22obfq.mongodb.net/usserDB");

// encryption code
const userSchema =new mongoose.Schema({
   email: String,
   password : String
});
//add secret code
const secret = "thisisthelittelencryprion";
//plugin add for encryption password
userSchema.plugin(encrypt,{secret:secret, encryptedfiled: {password: true}});


const user = new mongoose.model("user",userSchema);

 



//home page
app.get("/",function(req,res)
 {
    res.render("home");
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



//registration 
app.post("/register", function(req, res){
   const newUser = new user({
       email: req.body.username,
       password: req.body.password
   });

   newUser.save().then(()=>{
       res.render("secrets");
   }).catch((err)=>{
       console.log(err);
   })
});


//login user with  registerd user and password
app.post("/login", function(req, res){
   const username = req.body.username;
   const password = req.body.password;

   user.find({email:username}, function(err, founduser){
      if(err){
         console.log(err);
      }else{
         if(founduser){  
            if(founduser.password === password){
               res.render("secrets")
            }
         }
      }
   });

});


//server started on port 
app.listen(3000,function(req,res)
{
    console.log("server started at port 3000");
});
