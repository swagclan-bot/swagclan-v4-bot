import express from "express"

import BasicController from "../controllers/BasicController.js"

// Router for basic bot information.
const router = express.Router();

router.get("/", BasicController.BotInfo);
router.get("/status", BasicController.BotStatus);
router.get("/invite", BasicController.CreateInvite);
router.get("/guilds/count", BasicController.GuildCount);

router.get("/definition", BasicController.SettingsDefinition);
router.get("/modules", BasicController.LoadedModules);
router.get("/rules", BasicController.CommandRules);

export default router;