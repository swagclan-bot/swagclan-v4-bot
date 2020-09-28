import express from "express"

import client from "../../../client/index.js"

import accountController from "../../controllers/AccountController.js"
import connectionsRouter from "./connections.js"
import userRouter from "./user.js"

import Errors from "../../schema/Errors.js"

// Router for authorised account information.
const router = express.Router();

router.use(client.SessionService.handle());

router.use("/account/connections", connectionsRouter);

router.use(async function (req, res, next) {
    if (!req.session) {
        Errors.Forbidden(req, res);
    } else {
        next();
    }
});

router.get("/account", accountController.AccountInfo);

router.post("/logout", accountController.Logout);

router.use("/", userRouter);

export default router;