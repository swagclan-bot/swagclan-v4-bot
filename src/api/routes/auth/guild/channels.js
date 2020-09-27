import express from "express"

import GuildController from "../../../controllers/GuildController.js"

const router = express.Router();

router.get("/", GuildController.GetChannels);
router.get("/:channel_id", GuildController.GetChannel);

export default router;