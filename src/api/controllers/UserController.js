import express from "express"

import { api_guild_object } from "./GuildController.js"

import Errors from "../schema/Errors.js"

import client from "../../client/index.js"

export function user_object(user) {
    return {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function GetUser(req, res) {
    res.status(200).json(req.session.user);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function GetGuilds(req, res) {
    try {
        const guilds = (await req.session.getGuilds()).filter(guild => {
            const cache_guild = client.guilds.resolve(guild.id);

            return req.query.manageable !== "true" || cache_guild && (guild.permissions & 0x20) === 0x20; // MANAGE_GUILD
        }).map(api_guild_object);

        res.status(200).json(guilds);
    } catch (e) {
        console.log(e);

        Errors.Internal_Server_Error(req, res);
    }
}

export default {
    GetUser,
    GetGuilds
}