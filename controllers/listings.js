const mongoose=require("mongoose");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


const Listing = require("../model/listing");


module.exports.index=async (req, res) => {
    let listings = await Listing.find();
    res.render("listings/index.ejs", { listings });
};

module.exports.indexCategory=async (req, res) => {
    let {category}=req.params;
    let listings = await Listing.find({category});
    res.render("listings/index.ejs", { listings });
};

module.exports.renderNewForm=(req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID");
        return res.redirect("/listings");
    }
    let listing = await Listing.findById(id)
                        .populate({
                            path:"review",
                            populate:{
                                path:"author"
                            }
                        })
                        .populate("owner");
    
    // console.log(listing.review[0].author[0].username);
    if(!listing){
        req.flash("error","No such listing exists.");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing=async (req, res) => {
    let response=await geocodingClient.forwardGeocode({
        query: req.body.location,
        limit: 1
        })
        .send();
        
    let url=req.file.path;
    let filename=req.file.filename;
    
    let { title, description, price, location, country,category } = req.body;
    let owner=req.user._id;
    let image={url,filename};
    //console.log("Hello: ",res.body.features);
    let geometry=response.body.features[0].geometry;

    await Listing.create({
        title: title,
        description: description,
        image: image,
        price: price,
        location: location,
        country: country,
        owner:owner,
        geometry: geometry,
        category: category
    });

    req.flash("success","New listing created");

    res.redirect("/listings");
};

module.exports.renderEditPage=async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","No such listing exists.");
        return res.redirect("/listings");
    }
    //console.log(listing);
    let originalImageURL=listing.image.url;
    originalImageURL=originalImageURL.replace("/upload","/upload/w_250");

    res.render("listings/edit.ejs", { listing,originalImageURL });
};

module.exports.updateListing=async (req, res) => {
    
    let { title, description, price, location, country } = req.body;
    let { id } = req.params;

    let listing=await Listing.findByIdAndUpdate(id, {
        title: title,
        description: description,
        price: price,
        location: location,
        country: country
    });

    if(typeof req.file != "undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }


    req.flash("success","Listing Edited");

    res.redirect("/listings/" + id);
};

module.exports.deleteListing=async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);

    req.flash("success","Listing Deleted.");
    res.redirect("/listings");
};