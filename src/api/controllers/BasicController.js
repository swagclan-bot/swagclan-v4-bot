import express from "express"
import sys from "systeminformation"

import client from "../../client/index.js"

import credentials from "../../../.credentials.js"
import config from "../../../.config.js"

import { user_object } from "./UserController.js"

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
        user: resolve_basic_user_object(client.user)
    })
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export function CreateInvite(req, res) {
    res.redirect("https://discord.com/oauth2/authorize?client_id=" + credentials.client_id + "&scope=bot&permissions=" + config.permissions);
}

export default {
    BotInfo,
    BotStatus,
    CreateInvite
}