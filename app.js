var express               = require("express"),
    app                   = express(),
    mongoose              = require("mongoose"),
    User                  = require("./models/user"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    localStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");
    
mongoose.connect("mongodb://localhost/authDemo");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(require("express-session")({
    secret: "password",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//==========
// ROUTES
//==========
app.get("/", function(req, res){
   res.render("home"); 
});

app.get("/secret", isLoggedIn, function(req, res){
   res.render("secret"); 
});

//==============
// AUTH ROUTES
//==============

//Register
app.get("/register", function(req, res){
   res.render("register"); 
});

app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
      if(err){
          console.log(err);
          res.render("register");
      }
          passport.authenticate("local")(req, res, function(){
             res.redirect("/secret"); 
         });
   }); 
});

//Login
app.get("/login", function(req,res){
   res.render("login"); 
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function(req, res){
});

//Logout
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/");
});

//Middleware for Secret Route
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Server is Running"); 
});