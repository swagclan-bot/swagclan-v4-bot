import express from "express"

import basicController from "../controllers/basic.js"

// Router for basic bot information.
const router = express.Router();

router.get("/invite", basicController.CreateInvite);

export default router;