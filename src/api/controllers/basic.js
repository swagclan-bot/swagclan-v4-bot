import express from "express"

import credentials from "../../../.credentials.js"
import config from "../../../.config.js"

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export function CreateInvite(req, res) {
    res.redirect("https://discord.com/oauth2/authorize?client_id=" + credentials.client_id + "&scope=bot&permissions=" + config.permissions);
}

export default {
    CreateInvite
}