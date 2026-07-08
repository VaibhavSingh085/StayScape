const mongoose=require("mongoose");
const Review = require("./review");

let listingSchema=new mongoose.Schema({
    title: {
        type:String,
        required:true
    },
    description: String,
    image: {
        url:String,
        filename:String
    },
    price: {
        type: Number,
        min:1
    },
    location:String,
    country:String,
    review:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    category:{
            type: String,
            enum: [
                "Rooms",
                "EntireHomes",
                "Cabins",
                "Beachfront",
                "Mountains",
                "Countryside",
                "Pools",
                "Camping",
                "Farms",
                "Castles",
                "Apartments",
                "Hotels",
                "Tropical",
                "Skiing",
                "Others"
            ],
            default: "Others"
    }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing.review.length){
        await Review.deleteMany({id:listing.review.id});
    }
})

let Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;