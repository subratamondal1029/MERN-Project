import { Router } from "express";
import { channelProfileDetails } from "../controllers/users.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  subscribeChannel,
  unsubscribeChannel,
} from "../controllers/subscription.controllers.js";
import {
  getSingleVideo,
  uploadVideoWithDetails,
} from "../controllers/video.controllers.js";

const router = Router();

router.route("/:username").get(verifyJwt, channelProfileDetails);
router.route("/subscribe").post(verifyJwt, subscribeChannel);
router.route("/unsubscribe").delete(verifyJwt, unsubscribeChannel);
router.route("/upload").post(
  verifyJwt,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideoWithDetails
);
router.route("/v/:videoId").get(getSingleVideo);

export default router;
