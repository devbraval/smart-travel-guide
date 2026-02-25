const mongoose = require("mongoose");
const initdata = require("./db");
const listing = require("../models/listings");

const mongoose_url = "mongodb://127.0.0.1:27017/smartTravelAuth";

main().then(()=>{
    console.log("connected to DB");
    initDB();
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(mongoose_url);
}

const initDB = async()=>{
    await listing.deleteMany({});
    initdata.data = initdata.data.map((obj)=>({
        ...obj,
    }));
    await listing.insertMany(initdata.data);
    console.log("data was initalized");
};

