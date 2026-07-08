const Listing = require("../model/listing");
const Review = require("../model/review.js");


module.exports.postReview=async(req,res)=>{
    let {id}=req.params;
    let {rating,comment}=req.body;
    if(!req.user){
        req.flash("error","Please log in.");
        return res.redirect(`/listings/${id}`);
    }
    let post=await Listing.findById(id);
    console.log(req.user);
    let author=req.user._id;
    let review=await Review.create({rating:rating,comment:comment,author:author});
    console.log(post);
    post.review.push(review._id);
    await post.save();
    req.flash("success","New review posted");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteReview=async(req,res)=>{
    let {id, reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {review:reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash("success","Review Deleted.");
    res.redirect(`/listings/${id}`);
};