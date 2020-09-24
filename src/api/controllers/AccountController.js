import express from "express"

import client from "../../client/index.js"

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function AccountInfo(req, res) {
    const service = client.AccountService;
    const account = await service.getAccount(req.auth.user.id);

    let json = account.toJSON();

    json.connections = Object.fromEntries(Object.entries(json.connections).map(([name, connection]) => {
        return {
            created_at: connection.created_at,
            id: connection.id,
            name: connection.name,
            url: connection.url,
            username: connection.username
        };
    }));

    res.status(200).json(account);s 
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function GetUser(req, res) {
    res.status(200).json(req.auth.user);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function Logout(req, res) {
    try {
        await req.auth.logout();

        res.status(200).json(true);
    } catch (e) {
        console.error(e);

        res.status(500).json(false);
    }
}

export default {
    AccountInfo,
    GetUser,
    Logout
}