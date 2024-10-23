import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUserDetails,
  updatedUserAvatar,
  updatedUserCoverImage,
} from "../controllers/users.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refreshAccessToken").post(refreshAccessToken);
router.route("/currentUser").get(verifyJwt, getCurrentUser);
router.route("/changePassword").post(verifyJwt, changePassword);
router.route("/updateUserDetails").post(verifyJwt, updateUserDetails);
router
  .route("/updatedUserAvatar")
  .post(verifyJwt, upload.single("avatar"), updatedUserAvatar);
router
  .route("/updatedUserCoverImage")
  .post(verifyJwt, upload.single("coverImage"), updatedUserCoverImage);

export default router;
