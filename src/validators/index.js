import {body} from "express-validator"

const userRegisterValidations = ()=>{

 return [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("The email must be in the proper format")
        ,
        
        body("username")
        .trim()
        .notEmpty()
        .withMessage("The username is required")
        .isLowercase()
        .isLength({min:3})
        .withMessage("The username should be of minimum length 3"),

        body("password")
        .notEmpty()
        .withMessage("The password is required")
        .trim(),

        body("fullName")
        .trim()
        .isLowercase()
        .optional()
        .withMessage("The fullname must be in the lowercase only")
 ]
    
}
    
 const loginValidations = ()=>{

    return [
        body("email")
        .optional()
        .isEmail()
        .withMessage("The email should be in the proper format"),

        body("password")
        .notEmpty()
        .withMessage("The password is required")
    ]
}
const forgotPasswordValidator = ()=>{

    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("The email should be in the proper format")
    ]
}
const changeCurrentPasswordValidator = ()=>{

    return [
        body("oldPassword")
        .notEmpty()
        .withMessage("The old password is required"),
        body("newPassword")
        .notEmpty()
        .withMessage("The new password is required")

    ]
}
const resetForgotPasswordValidator = ()=>{

    return [

        body("newPassword")
        .notEmpty()
        .withMessage("The new password is required")
    ]


}
export { userRegisterValidations, loginValidations ,forgotPasswordValidator ,changeCurrentPasswordValidator ,resetForgotPasswordValidator };


