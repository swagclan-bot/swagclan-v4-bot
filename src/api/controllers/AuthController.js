import express from "express"

import client from "../../client/index.js"
import oauthSchema from "../schema/OAuth.js"

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export function RedirectDiscord(req, res) {
    res.redirect(oauthSchema.discord.code.getUri());
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export function DiscordCallback(req, res) {
    try {
        const user = await oauthSchema.discord.code.getToken(req.originalUrl);

        await client.SessionService.register(req.cookies.sid, user.data);

        res.redirect(process.env.BASE_WEB);
    } catch (e) {
        console.error(e);

        res.redirect(process.env.BASE_WEB + "?loginerror=true")
    }
}

export default {
    RedirectDiscord,
    DiscordCallback
}