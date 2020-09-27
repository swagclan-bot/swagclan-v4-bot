import express from "express"

import client from "../../../client/index.js"

import accountController from "../../controllers/AccountController.js"
import connectionsRouter from "./connections.js"
import userRouter from "./user.js"
import guildRouter from "./guild/guild.js"

// Router for authorised account information.
const router = express.Router();

router.use(client.SessionService.handle());

router.get("/account", accountController.AccountInfo);

router.post("/logout", accountController.Logout);

router.use("/", userRouter);
router.use("/account/connections", connectionsRouter);
router.use("/guilds", guildRouter);

export default router;