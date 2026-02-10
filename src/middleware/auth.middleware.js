import jwt from "jsonwebtoken";
import {APIerrors} from "../utils/api-errors.js";
import asyncHandler from "../utils/async-handler.js"
import User from "../models/user.models.js";

const verifyJWT = asyncHandler(async (req,res,next)=>{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    if(!token)
    {
        throw new APIerrors(401,"Unauthorised user");
    }
   
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
        if (!user) 
        {
            throw new APIerrors(401, "User not found");
        }
        req.user = user;
        next();
    
})
export {verifyJWT};