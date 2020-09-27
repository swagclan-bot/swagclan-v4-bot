import express from "express"
import sys from "systeminformation"

import credentials from "../../../.credentials.js"
import config from "../../../.config.js"

import { user_object } from "./UserController.js"
import { rule_manager } from "../../service/CustomCommandService.js"

import client from "../../client/index.js"

const versions = await sys.versions();

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function BotInfo(req, res) {
    res.status(200).json({
        environment: process.env.ENVIRONMENT,
        version: config.version,
        site: {
            web: process.env.BASE_WEB,
            api: process.env.BASE_API
        },
        versions: {
            node: versions.node,
            npm: versions.npm,
            discordjs: "12.2.0"
        },
        commit: await client.getCommit()
    });
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function BotStatus(req, res) {
    res.status(200).json({
        started: Date.now() - Math.floor(process.uptime() * 1000),
        status: client.user.presence.status,
        user: user_object(client.user)
    })
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export function CreateInvite(req, res) {
    res.redirect("https://discord.com/oauth2/authorize?client_id=" + credentials.client_id + "&scope=bot&permissions=" + config.permissions);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export function GuildCount(req, res) {
    res.status(200).json({ guilds: client.guilds.cache.size });
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export function SettingsDefinitions(req, res) {
    res.status(200).json(client.SettingsService.definitions);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export function LoadedModules(req, res) {
    res.status(200).json(Object.fromEntries(client.ModuleService.modules.entries()));
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export function CommandRules(req, res) {
    res.status(200).json(rule_manager.rule_groups);
}

export default {
    BotInfo,
    BotStatus,
    CreateInvite,
    GuildCount,
    SettingsDefinitions,
    LoadedModules,
    CommandRules
}