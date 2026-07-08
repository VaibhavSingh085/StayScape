const mongoose=require("mongoose");
const Listing=require("../model/listing");
const sampleListings=require("./data");

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  sampleListings.data=sampleListings.data.map((obj)=>({
    ...obj,
    owner: "6a44a878f5f99e3f96c9649b"
  }))

  await Listing.insertMany(sampleListings.data).then((res)=>{console.log("Success")});

}

