// Imports
import discord from "discord.js"

import { SettingDefinition, SettingType } from "../service/SettingsService.js"

const FLAGS = discord.Permissions.FLAGS;

export default {
    "Prefix": new SettingDefinition({
        name: "Prefix",
        description: "The prefix of the server.",
        emoji: "❗",
        type: SettingType.Prefix,
        permissions: FLAGS.MANAGE_GUILD,
        default: "."
    }),
    "Log Channel": new SettingDefinition({
        name: "Log Channel",
        description: "The channel for where logs are sent to.",
        emoji: "📜",
        type: SettingType.Channel,
        permissions: FLAGS.MANAGE_GUILD,
        default: null
    })
}