if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}
// console.log(process.env);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session=require("express-session");
const MongoStore=require("connect-mongo").default;
const flash=require("connect-flash");
const passport=require("passport");
const {Strategy:LocalStrategy}=require("passport-local");
const User=require("./model/user.js");

const ExpressError = require("./utils/ExpressError");

const listingRoute=require("./routes/listings.js");
const reviewRoute=require("./routes/reviews.js");
const userRoute=require("./routes/user.js");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

let port = 8080;

const dbUrl=process.env.ATLASDB_URL;

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);

    app.listen(port, () => {
        console.log("Server started.");
    });
}

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600
});

store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE: ",err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false, 
    saveUninitialized: false,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly:true   
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})

app.use("/listings",listingRoute);
app.use("/listings/:id/reviews",reviewRoute);
app.use("/",userRoute);

// Home Route
// app.get("/", (req, res) => {
//     res.send("Hi");
// });

// Catch-all Route
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


// Error Middleware
app.use((err, req, res, next) => {
    let { status = 500, message = "oops, something went wrong" } = err;
    res.status(status).render("error.ejs",{err});
    console.log(err);
    // res.status(status).send(message);
});
