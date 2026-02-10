import { validationResult } from "express-validator";
import { APIerrors } from "../utils/api-errors.js";

export const validate = (req,res,next) =>
{

    const errors = validationResult(req);
    if(errors.isEmpty())
    {
        return next();
    }
    const trappedErrors = [];
    errors.array().map((err)=> trappedErrors.push(err));
   
    return res
        .status(422)
        .json(
            new APIerrors(422,"Recieved user data is invalid")
        )
}