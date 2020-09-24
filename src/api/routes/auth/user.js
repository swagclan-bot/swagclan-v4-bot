import express from "express"

import UserController from "../../controllers/UserController.js"

const router = express.Router();

router.get("/me", accountController.GetUser);

export default router;