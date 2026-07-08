const Express=require("express");
const router=Express.Router();
const mongoose=require("mongoose");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage })


const Listing = require("../model/listing");
const {listingSchema}=require("../schema.js");
const {isLoggedIn,isOwner}=require("../middlewares.js");

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { index, indexCategory, renderNewForm, showListing, createListing, renderEditPage, updateListing, deleteListing } = require("../controllers/listings.js");


const validateListing=(req,res,next)=>{
    console.log(req.body);
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errorMessage=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errorMessage);
    }
    else{
        next();
    }
}

router.route("/")
.get(wrapAsync(index))  //Index Route
.post(isLoggedIn, upload.single("image"), validateListing, wrapAsync(createListing)); //Create Route

//Category
router.route("/category/:category")
.get(wrapAsync(indexCategory));

// New Route
router.get("/new", isLoggedIn, renderNewForm);

router.route("/:id")
.get(wrapAsync(showListing))    //Show Route
.patch(isLoggedIn, isOwner, upload.single("image"), validateListing,wrapAsync(updateListing))   //Update Route
.delete(isLoggedIn, isOwner, wrapAsync(deleteListing))  //Delete Route

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(renderEditPage));

module.exports=router;