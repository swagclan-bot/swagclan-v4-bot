import express from "express"

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
export function GetUser(req, res) {
    res.status(200).json(req.auth.user);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export function GetGuilds(req, res) {

}

export default {
    GetUser,
    GetGuilds
}