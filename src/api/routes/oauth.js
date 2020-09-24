import express from "express"

import AuthController from "../controllers/auth.js"

// Router for basic bot information.
const router = express.Router();

router.get("/discord", AuthController.RedirectDiscord);
router.get("/discord/callback", AuthController.DiscordCallback);

export default router;