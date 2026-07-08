const Express=require("express");
const router=Express.Router({ mergeParams: true });
const User=require("../model/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const {getUrl}=require("../middlewares.js");
const { renderSignUp, signup, renderLogin, login, logout } = require("../controllers/user.js");

router.get("/signup",renderSignUp);

router.post("/signup",wrapAsync(signup));

router.get("/login",renderLogin);

router.post("/login",
    getUrl,
    passport.authenticate("local",{failureRedirect:'/login', failureFlash: true}),
    wrapAsync(login)
);

router.get("/logout",logout)

module.exports=router;