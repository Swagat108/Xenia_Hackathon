import { APIresponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";


 /* const healthCheck = async (req,res,next)=>{
    try {
        const user = await  getUserFromDB();
        res.status(200).json(
            new APIresponse(200,"Server is running")
        );
    } catch (error) {
        next(error);
    }

} */


const healthCheck = asyncHandler(async (req,res)=>{
    res.status(200).json(
        new APIresponse(200,"Server is still running")
    );
    
})
export default healthCheck;

