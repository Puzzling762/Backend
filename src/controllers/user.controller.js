import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { User } from "../models/user.model.js";


const registerUser=asyncHandler( async(req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username,email
    // check for images,check for avtar
    // upload them to cloudinary
    // create user object-create entry in db
    //remove password and refreash token field from response user ko password ni bhejna  
    // check for user creation 
    // return res


    const {fullName,email,username,password}=req.body //getting user details from frontend
    console.log("email:",email);


    if (
        [fullName,email,username,password].some((field)=> field?.trim() ==="")
    ) {
        throw new ApiError(400,"All fields are required")
    }
    const existedUser=User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    const avtarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath= req.file?.coverImageLocalPath[0]?.path;

    if(!avtarLocalPath){
        throw new ApiError(400,"Avtar file required")  //check for avtar
    }

    //cloudinary pain upload

    const avatar=await UploadOnCloudinary(avtarLocalPath)
    const coverImage=await UploadOnCloudinary(coverImageLocalPath)

    //dobara check avtar gya hai ya nahi

    if(!avatar){
        throw new ApiError(400,"Avtar file required")
    }

    //object banao aur database main entry

    const user=await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()  //user model se uthaye sara


    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"   // by default sara selected hai usme se password aur refreshToken ko hata do
       // remove password and refreash token field from response user ko password ni bhejna 
    )

     //check karre user hai ki nahi using mongodb id
     if(!createdUser){
        throw new ApiError(500,"Something went wrong while registreing user ") 
     }

    //return response

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )




})

export {
    registerUser,
}
