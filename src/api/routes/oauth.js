import express from "express"

import AuthController from "../controllers/AuthController.js"

// Router for basic bot oauth.
const router = express.Router();

router.get("/discord", AuthController.RedirectDiscord);
router.get("/discord/callback", AuthController.DiscordCallback);

export default router;