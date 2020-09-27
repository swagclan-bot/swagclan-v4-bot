import express from "express"

import GuildController from "../../../controllers/GuildController.js"

const router = express.Router();

router.get("/", GuildController.GetCommands);
router.post("", GuildController.CreateCommand);
router.get("/:command_id", GuildController.GetCommand);
router.delete("/:command_id", GuildController.DeleteCommand);
router.put("/:command_id", GuildController.UpdateCommand);
router.get("/:command_id/timeouts", GuildController.GetCommandTimeouts);
router.get("/:command_id/timeouts/stream", GuildController.StreamTimeouts);
router.delete("/:command_id/timeouts", GuildController.ClearTimeouts);
router.delete("/:command_id/timeouts/:user_id", GuildController.ClearTimeout);

export default router;