import express from "express"

import GuildController from "../../../controllers/GuildController.js"

const router = express.Router();

router.get("/", GuildController.GetStorage);
router.get("/stream", GuildController.StreamStorage);
router.post("/collections", GuildController.CreateCollection);
router.delete("/collections", GuildController.ClearStorage);
router.get("/collections/:collection_name", GuildController.GetCollection);
router.delete("/collections/:collection_name", GuildController.DeleteCollection);
router.delete("/collections/:collection_name/items", GuildController.ClearCollection);
router.put("/collections/:collection_name/items/:item_name", GuildController.SetItem);
router.delete("/collections/:collection_name/items/:item_name", GuildController.DeleteItem);

export default router;