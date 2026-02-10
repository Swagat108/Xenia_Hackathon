import dotenv from "dotenv"
import app from "./app.js";
import connectDB from "./db/database.js";
dotenv.config({
    path:"./.env"
});

const port = process.env.PORT || 3000;

connectDB()
    .then(()=>{
        app.listen(port, () => {
            console.log(`The server is listening at http://localhost:${port}`);
        })      //When the database is connected then only listen to the port
    })
    .catch((error)=>{
        console.error("MongoDB connection failed ",error);
        process.exit(1);
    })
