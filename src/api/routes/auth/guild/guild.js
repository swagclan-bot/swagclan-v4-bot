import express from "express"

import UserController from "../../../controllers/UserController.js"
import GuildController from "../../../controllers/GuildController.js"

import Errors from "../../../schema/Errors.js"

import channelsRouter from "./channels.js"
import commandsRouter from "./commands.js"
import settingsRouter from "./settings.js"
import storageRouter from "./storage.js"

import client from "../../../../client/index.js"

const router = express.Router();

router.get("/", UserController.GetGuilds);

/**
 * Check if a guild is manageable.
 * @param {discord.Guild} guild The guild to check if manageable.
 * @param {discord.GuildMember} member The member to check.
 * @returns {Boolean}
 */
function is_manageable(req, res, next) {
    const cache_guild = client.guilds.resolve(req.params.guild_id);

    if (cache_guild) {
        const member = cache_guild.members.resolve(req.session.user.id);

        if (member && member.hasPermission("MANAGE_GUILD")) {
            req.guild = cache_guild;

            next();
        } else {
            Errors.Forbidden(req, res);
        }
    } else {
        Errors.Not_Found(req, res);
    }
}

router.use("/:guild_id", is_manageable);

router.get("/:guild_id", GuildController.GetGuild);

router.use("/:guild_id/channels", channelsRouter);
router.use("/:guild_id/commands", commandsRouter);
router.use("/:guild_id/settings", settingsRouter);
router.use("/:guild_id/storage", storageRouter);

export default router;