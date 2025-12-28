const express = require("express");
const app = express();
const cors = require("cors");
const port = 8080;
//middleware
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("App is Live");
});
app.post("/login",(req,res)=>{
    const {email,password} = req.body;

    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    res.json({
        success:true,
        message:"Login api works",
    });
});
app.listen(port,()=>{
    console.log(`App is Listing on port ${port}`);
});

