
import User from "../models/user.models.js";
import { APIerrors } from "../utils/api-errors.js";

import { APIresponse } from "../utils/api-response.js";

import asyncHandler from "../utils/async-handler.js";

import { forgotPasswordMailgen, sendEmail } from "../utils/mail.js";

import { emailverificationMailgen } from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateAccessandRefreshTokens = async (userID) => {

    try {
        const user = await User.findById(userID);
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();
        user.refreshToken  = refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    } catch (error) {
        throw new APIerrors(400,error.message);
    }
}
const registerUser = asyncHandler(async (req, res) => {

    const { email, username, password, role } = req.body;

    const isUserPresent = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (isUserPresent) {
        throw new APIerrors(409, "The user with email or username is already present");
    }
    const user = await User.create({
        email,
        username,
        password,
        isEmailVerified: false,
    })
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTempraryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });
    await sendEmail({

        email: user.email,
        subject: "Please verify your email",
        mailgenContent: emailverificationMailgen(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    })
    const createdUser = await User.findById(user._id).select(

        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )
    if (!createdUser) {
        throw new APIerrors(500, "Something went wrong while registering a user");
    }
    return res
        .status(201)
        .json(
            new APIresponse(200, { user: createdUser }, "User registered successfully and verification email has been sent on your email")
        )
});
const login = asyncHandler(async ( req,res)=>{

    const {email,password,username} = req.body;
    if(!email)
    {
        throw new APIerrors(400,"Email is required ");
    }
    const user= await User.findOne({email})
    if(!user)
    {
        throw new APIerrors(400,"User not found");
    }
    const passwordValid = await user.isPasswordCorrect(password);
    if(!passwordValid)
    {
        throw new APIerrors(400,"Invalid credentials");
    }
    const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user._id);

    const LoggedinUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )
    const options = {
        httpOnly : true,
        secure : true,
    }
    return res.status(200)
        .cookie("accessToken", accessToken,options)
        .cookie("refreshToken", refreshToken,options)
        .json(
            new  APIresponse(200,{user:LoggedinUser},"User logged in successfully")
        )
})
const logout = asyncHandler(async (req,res)=>
{

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken : ""
            }
        }
        ,
        {
            new: true,
        }
    )
    const options = {
        httpOnly : true,
        secure : true,
    }

    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken", options)
        .json(
            new APIresponse(200,{},"User logged out successfully")
        )
})
const getCurrentUser = asyncHandler(async (req,res)=>{

    return res
        .status(200)
        .json(
            new APIresponse(200,req.user,"Current user fetched successfully")
        )
})
const verifyEmail = asyncHandler(async(req,res)=>{

    const {verificationToken} = req.params;
    if(!verificationToken)
    {
        throw new APIerrors(400,"Verification token is invalid")
    }
    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")
    const user = await User.findOne(
        {
            emailVerificationToken : hashedToken,
            emailVerificationExpiry : {$gt: Date.now()}
        }
    )
    if(!user)
    {
        throw new APIerrors(400,"Invalid verification token or token is expiry")
    }
    user.emailVerificationExpiry = undefined;
    user.emailVerificationToken = undefined;
    user.isEmailVerified = true;
    await user.save({validateBeforeSave : false});
    return res
        .status(200)
        .json
        (
            new APIresponse(200,{isEmailVerified : true},"Email verified successfully")
        )
})
const resendEmailVerification = asyncHandler(async (req,res)=>{

    const user = await User.findById(req.user?._id);
    if(!user)
    {
        throw new APIerrors(404,"User not found");
    }
    if(user.isEmailVerified)
    {
        throw new APIerrors(400,"Email is already verified");
    }
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTempraryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });
    await sendEmail({

        email: user.email,
        subject: "Please verify your email",
        mailgenContent: emailverificationMailgen(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });

    return res
        .status(200)
        .json(
           new APIresponse(200,{},"Mail for verification is sent on your mail ID") 
        )

})
const refreshAccessToken = asyncHandler(async (req,res)=>{

    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken)
    {
        throw new APIerrors(400,"Unauthorised request");
    }
    try {
        
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if(!user)
        {
            throw new APIerrors(400,"User not present");
        }
        if(incomingRefreshToken !==user.refreshToken)    //tells us - Is this the latest key we gave this person?
        {
            throw new APIerrors(400,"Invalid refresh token")
        }
        const options = {
            httpOnly : true,
            secure : true,
        }

        const {accessToken,refreshToken : newRefreshToken} = generateAccessandRefreshTokens(user?._id);
        user.refreshToken = newRefreshToken;
       await  user.save({validateBeforeSave:false});

        return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newRefreshToken,options)
            .json(
                new APIresponse(200,{accessToken:accessToken,refreshToken:newRefreshToken},"Access token refreshed successfully")
            )
    } catch (error) {
        throw new APIerrors(400,error.message);
    }

})
const forgotPassword = asyncHandler(async(req,res)=>{

    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user)
    {
        throw new APIerrors(404,"User not found");
    }
    const { unHashedToken, hashedToken, tokenExpiry} = user.generateTempraryToken();

    user.forgotPasswordExpiry = tokenExpiry;
    user.forgotPasswordToken = hashedToken;

    await user.save({validateBeforeSave:false});

    await sendEmail({

        email: user?.email,
        subject: "Password reset request",
        mailgenContent:forgotPasswordMailgen(
            user.username,
            `${process.env.FORGOT_PASSWORD_URL}/${unHashedToken}`
        )
    })
    return res
        .status(200)
        .json(
            new APIresponse(200,"Password reset mail has been sent to your mail")
        )
})
const resetForgotPassword = asyncHandler(async(req,res)=>{

    const {resetToken} = req.params;
    const {newPassword} = req.body

    const hashedToken = crypto
                        .createHash("sha256")
                        .update(resetToken)
                        .digest("hex")

    const user  = await User.findOne({
        forgotPasswordToken : hashedToken,
        forgotPasswordExpiry : {$gt:Date.now()}
    })

    if(!user)
    {
        throw new APIerrors(404,"User not found");
    }

    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    user.password = newPassword;
    await user.save({validateBeforeSave:false});

    return res
        .status(200)
        .json(
            new APIresponse(200,"Password reset has been completed")
        )
})
const changeCurrentPassword = asyncHandler(async(req,res)=>{

    const {oldPassword,newPassword} = req.body;
    const user = await User.findById(req.user?._id);
    if(!user)
    {
        throw new APIerrors(404,"Invalid password");
    }
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid)
    {
        throw new APIerrors(401,"Invalid old password");
    }
    user.password = newPassword;
    await user.save({validateBeforeSave:false});
    return res
        .status(200)
        .json(

            new APIresponse(200,"Password updated successfully")

        )
})
export { registerUser, login, logout, getCurrentUser, verifyEmail,resendEmailVerification, refreshAccessToken ,forgotPassword,resetForgotPassword ,changeCurrentPassword};



