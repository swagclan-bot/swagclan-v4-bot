import express from "express"

import UserController from "../../controllers/UserController.js"

const router = express.Router();

router.get("/me", UserController.GetUser);
router.get("/guilds", UserController.GetGuilds);

export default router;