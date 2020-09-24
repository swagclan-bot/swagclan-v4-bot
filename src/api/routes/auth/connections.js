import express from "express"

import ConnectionsController from "../../controllers/ConnectionsController.js"

const router = express.Router();

router.get("/:connection", ConnectionsController.RedirectAccountConnection);
router.get("/:connection/callback", ConnectionsController.LinkAccountConnection);

router.delete("/:connection", ConnectionsController.DeleteAccountConnection);

export default router;