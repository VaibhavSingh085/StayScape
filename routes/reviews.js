const Express=require("express");
const router=Express.Router({ mergeParams: true });

const Listing = require("../model/listing");
const Review = require("../model/review.js");
const {reviewSchema}=require("../schema.js");

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn, isReviewAuthor } = require("../middlewares.js");
const { postReview, deleteReview } = require("../controllers/reviews.js");

const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errorMessage=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errorMessage);
    }
    else{
        next();
    }
}

//Posting Review
router.post("/",validateReview, wrapAsync(postReview));

//Delete Review
router.delete("/:reviewId",isReviewAuthor,wrapAsync(deleteReview));

module.exports=router;