import express from "express"

import GuildController from "../../../controllers/GuildController.js"

// Router for guild settings.
const router = express.Router();

router.get("/", GuildController.GetSettings);
router.patch("/", GuildController.UpdateSettings);
router.get("/history", GuildController.GetSettingsHistory);

export default router;