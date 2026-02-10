//This file of express is kept aprt from the index file to make the things easy

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();

//Basic configuration

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

//cors configuration

app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

//app.use(cors()) is also valid

import router from "./routes/healthcheck.routes.js";

import authrouter from "./routes/auth.routes.js";

app.use("/api/v1/healthcheck",router);

app.use("/api/v1/auth", authrouter);
export default app;