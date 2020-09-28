import express from "express"

import UserController from "../../controllers/UserController.js"

import guildRouter from "./guild/guild.js"

// Router for authorised user requests.
const router = express.Router();

router.get("/me", UserController.GetUser);
router.use("/guilds", guildRouter);

export default router;