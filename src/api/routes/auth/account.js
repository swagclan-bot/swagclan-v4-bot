import express from "express"

import client from "../../../client/index.js"

import accountController from "../../controllers/AccountController.js"
import connectionsRouter from "./connections.js"
import userRouter from "./user.js"
import guildRouter from "./guild/guild.js"

import Errors from "../../schema/Errors.js"

// Router for authorised account information.
const router = express.Router();

router.use(client.SessionService.handle());

router.use("/account/connections", connectionsRouter);

router.use(async function (req, res, next) {
    if (!res.auth) {
        Errors.Forbidden(req, res);
    } else {
        next();
    }
});

router.get("/account", accountController.AccountInfo);

router.post("/logout", accountController.Logout);

router.use("/", userRouter);
router.use("/guilds", guildRouter);

export default router;