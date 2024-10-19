import fs from "fs"
import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js"
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js"

const generateAccessAndRefreshTokens = async (userId) =>{
  const user = await User.findById(userId)
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  user.refreshToken = refreshToken
  user.save({validateBeforeSave: false})

  return {accessToken, refreshToken}
}
const options = {
  httpOnly: true,
  secure: true
}

const registerUser = asyncHandler(async (req, res) => {
  // get user details
  const { fullName, username, email, password } = req.body;

  // data validation
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All Fields Are Required");
  }

  // check existing data conflict
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser){
    throw new apiError(409, "User with same Email or Username already exist!");
}

// handle file upload and validation
  const uploadedFiles = req.files;

  if(!uploadedFiles || !uploadedFiles.avatar || uploadedFiles.avatar.length === 0){
    throw new apiError(400, "Avatar is Required")
  }
  
  const avatarLocalPath = uploadedFiles.avatar[0].path;
  let coverImageLocalPath;
  if(uploadedFiles.coverImage && uploadedFiles.coverImage.length > 0){
    coverImageLocalPath = uploadedFiles.coverImage[0].path
  }

  // cloudinary file upload
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    let coverImage;
    
    if(!avatar){
      fs.unlinkSync(coverImageLocalPath)
      throw new apiError(400, "Avatar is Required")
    }else{
      coverImage = await uploadOnCloudinary(coverImageLocalPath)
    }

    // new user Creation
  const user = await User.create({
      fullName,
      email,
      username: username.toLowerCase(),
      password,
      avatar: avatar.url,
      coverImage: coverImage?.url || ""
    })

    // Check is the created and make a response data
   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){ throw new apiError(500, "Internal Server Erorr while user Creation")}

    return res.status(201).json(new apiResponse(201, createdUser, "User Register Successfully"))

});

const loginUser = asyncHandler(async (req, res) =>{
  const {username, email, password} = req.body;

  if(!username && !email){
    throw new apiError(400, "username or email is required")
  }

  const user = await User.findOne({
    $or: [{username}, {email}]
  })

  if(!user) throw new apiError(404, "User with your email or username is not exist")  

  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid) throw new apiError(401, "wrong login credintials")

  // create accessToken and refreshToken
  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const resposeUser = await User.findById(user._id).select("-password -refreshToken")

  return res
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options)
          .json(new apiResponse(200, {user: resposeUser, accessToken, refreshToken}, "Loged In successFully"))

})

const logoutUser = asyncHandler(async (req, res) =>{
  
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {refreshToken: 1}
    },
    {
      new: true
    }
  )

  res.clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new apiResponse(200, null, "User logout successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) =>{
  const clientRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.header()?.Authorization;
  if (!clientRefreshToken) throw new apiError(401, "Unauthorized request")

  const decodedRefreshToken = jwt.verify(clientRefreshToken, process.env.REFRESH_TOKEN_SECRET)

  const user = await User.findById(decodedRefreshToken?._id)
  if (!user || user?.refreshToken !== clientRefreshToken) throw new apiError(401, "Invalid Refresh Token")

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

  return res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .send(new apiResponse(200, {accessToken, refreshToken}, "New AccessToken Created Successfully"))
})

export { registerUser, loginUser, logoutUser, refreshAccessToken };