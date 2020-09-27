import express from "express"
import path from "path"

// Router for retrieving assets from the server.
const router = express.Router();

router.use(express.static(path.resolve("asset")));

export default router;