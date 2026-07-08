const Listing = require("./model/listing");
const Review = require("./model/review");
const wrapAsync = require("./utils/wrapAsync");
const mongoose=require("mongoose");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.currUrl=req.originalUrl;
        req.flash("error","You must be logged in.");
        return res.redirect("/login");
    }
    next();
};

module.exports.getUrl=(req,res,next)=>{
    let currUrl="/listings";
    if(req.session.currUrl){
        currUrl=req.session.currUrl;
        delete req.session.currUrl;
    }

    res.locals.currUrl=currUrl;
    next();
};

module.exports.isOwner=wrapAsync(async (req,res,next)=>{
    let {id}=req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID");
        return res.redirect("/listings");
    }
    let listing=await Listing.findById(id).populate("owner");
    if(!listing){
        req.flash("error","No such listing exists.");
        return res.redirect("/listings");
    }
    console.log(listing);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You must be the owner of the listing.");
        return res.redirect(`/listings/${id}`);
    }
    next();
});

module.exports.isReviewAuthor=wrapAsync(async(req,res,next)=>{
    let {id,reviewId}=req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
        req.flash("error", "Invalid Listing ID");
        return res.redirect("/listings");
    }
    let review=await Review.findById(reviewId);

    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You must be the author of the review.");
        return res.redirect(`/listings/${id}`);
    }
    next();
});