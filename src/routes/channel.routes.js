import { Router } from "express";
import { channelProfileDetails } from "../controllers/users.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  subscribeChannel,
  unsubscribeChannel,
} from "../controllers/subscription.controllers.js";

const router = Router();

router.route("/c/:username").get(verifyJwt, channelProfileDetails);
router.route("/subscribe").post(verifyJwt, subscribeChannel);
router.route("/unsubscribe").post(verifyJwt, unsubscribeChannel);

export default router;
