const User=require("../model/user.js");

module.exports.renderSignUp=(req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup=async (req,res,next)=>{
    try{
        let {username,email,password}=req.body;
        let user=new User({
            username:username,
            email:email
        });
        await User.register(user,password);
        await req.login(user,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to Wanderlust.");
            res.redirect("/listings");
        })
        
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLogin=(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login=async(req,res)=>{
    req.flash("success","Welcome back to Wanderlust!");
    res.redirect(res.locals.currUrl);
};

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","logged you out");
        res.redirect("/listings");
    })
};