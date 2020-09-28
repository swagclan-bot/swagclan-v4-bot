import express from "express"

import client from "../../client/index.js"
import oauth from "../schema/OAuth.js"

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function RedirectAccountConnection(req, res) {
    if (!req.session) {
        return res.redirect(oauth.discord.code.getUri());
    }

    const account = await client.AccountService.getAccount(req.session.user.id);

    const uri = account.getURI(req.params.connection);

    if (uri) {
        res.redirect(uri);
    } else {
        res.redirect(BASE_WEB + "/account?linkerror=true");
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function LinkAccountConnection(req, res) {
    if (!req.session) {
        return res.redirect(oauth.discord.code.getUri());
    }

    const account = await client.AccountService.getAccount(req.session.user.id);

    if (await account.authorise(req.params.connection, req.originalUrl)) {
        res.redirect(process.env.BASE_WEB + "/account");
    } else {
        res.redirect(process.env.BASE_WEB + "/account?linkerror=true");
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function DeleteAccountConnection(req, res) {
    if (!req.session) {
        return res.redirect(oauth.discord.code.getUri());
    }
    
    const account = await client.AccountService.getAccount(req.session.user.id);

    delete account.connections[req.params.connection];

    await account.save();

    res.status(200).json(true);
}

export default {
    RedirectAccountConnection,
    LinkAccountConnection,
    DeleteAccountConnection
}