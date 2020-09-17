import express from "express"

// Router for retrieving assets from the server.
const router = express.Router();

router.use(express.static(path.resolve("asset")));

export default router;