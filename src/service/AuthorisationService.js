// Imports
import discord from "discord.js"
import fetch from "node-fetch"
import express from "express"
import FormData from "form-data"
import oauth2 from "client-oauth2"

import { Service } from "./Service.js"

import sleep from "../util/sleep.js"

import credentials from "../../.credentials.js"

// Exportable constants
export const CACHE_EXPIRE = 30 * 60 * 1000; // 30 minutes

/**
 * @typedef JSONUserObject
 * @property {String} id The ID of the user.
 * @property {String} username The username of the user.
 * @property {String} discriminator The discriminator of the user.
 * @property {String} avatar The avatar hash of the user.
 * @property {Boolean} bot? Whether the user is a bot.
 * @property {Boolean} system? Whether or not the user is an official system user.
 * @property {Boolean} mfa_enabled? Whether or not the user has two factor authentication enabled.
 * @property {Locale} string? The language options of the user.
 * @property {Boolean} verified? Whether or not the user has a verified email.
 * @property {String} email? The email of the user.
 * @property {Number} flags? The flags of the user.
 * @property {Number} premium_type? The type of nitro subscription of the user.
 * @property {Number} public_flags? The publish flags of the user.
 */

 /**
  * @typedef JSONPartialGuildObject
  * @property {String} id The ID of the guild.
  * @property {String} name The name of the guild.
  * @property {String} icon The icon hash of the guild.
  * @property {Boolean} owner Whether or not the user is an owner of the guild.
  * @property {Number} permissions The permissions of the user in the guild.
  */

/**
 * @typedef JSONAuthorisationObject
 * @property {String} access_token The token to access authorised endpoints.
 * @property {String} token_type The type of token that was granted.
 * @property {Number} expires_in The number of seconds until the code expires.
 * @property {String} refresh_token The token to refresh the access token after it expires.
 * @property {String} scope The scope that was granted.
 */

/**
 * Represent an authorised user.
 */
class AuthorisedUser {
    /**
     * Instantiate an authorised user object.
     * @param {String} authorisation The access token for the user.
     * @param {JSONUserObject} user The authorised user object.
     */
    constructor(authorisation, user) {
        /**
         * The authorisation information for the user.
         * @type {String}
         */
        this.authorisation = authorisation;

        /**
         * The authorised user object.
         * @type {JSONUserObject}
         */
        this.user = user;

        /**
         * When the last request was made.
         * @type {Number}
         */
        this.last_request = 0;
    }

    /**
     * Update the last request timestamp.
     * @param {Number} [date] When to update the last request timestamp to.
     * @returns {Number} When the last request was made.
     */
    update(date = Date.now()) {
        this.last_request = date;

        return this.last_request;
    }

    /**
     * Make a request to discord api.
     * @param {String} path The path to request.
     * @param {fetch.RequestInit} 
     */
    async make(path, options = {}) {
        const base = "https://discord.com/api/v6";

        if (!options.headers) {
            options.headers = {};
        }

        options.headers.Authorization = "Bearer " + this.authorisation;

        const req = await fetch(base + path, options);

        if (req.status === 200) {
            return await req.json();
        } else if (req.status === 429) {
            const json = await req.json();

            await sleep(json.retry_after);

            return await this.make(path, options);
        } else {
            try {
                return await req.json();
            } catch (e) {
                throw new Error("Invalid JSON response given.");
            }
        }
    }

    /**
     * Get guilds for the user.
     * @returns {Array<JSONPartialGuildObject>}
     */
    async getGuilds() {
        const guilds = await this.make("/users/@me/guilds");

        return guilds;
    }
}

/**
 * Represents a service dedicated to managing authorised users through the API and bot.
 * @extends Service;
 */
export class AuthorisationService extends Service {
    /**
     * Instantiate the cache.
     * @param {SwagClan} client The client that instantiated this object.
     */
    constructor(client) {
        super(client);

        /**
         * The cached users by the authorisation token.
         * @type {discord.Collection<String,AuthorisedUser>}
         */
        this.users = new discord.Collection;
    }

    /**
     * Express middleware to handle authorisation.
     * @returns { { (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> } }
     */
    handle() {
        return async (req, res, next) => {
            if (req.headers.authorization) {
                const auth = await this.getUser(req.headers.authorization);

                if (auth) {
                    req.auth = auth;

                    next();
                } else {
                    res.status(401).json({
                        error: {
                            code: 401,
                            message: "Invalid authorisation."
                        }
                    });
                }
            } else {
                res.status(401).json({
                    error: {
                        code: 401,
                        message: "Invalid authorisation."
                    }
                });
            }
        }
    }

    /**
     * Authorise a user with their code.
     * @param {String} code The code that the user was given.
     * @param {String} redirect_uri The redirect URI that the user was redirected to after the oauth procedure.
     * @returns {Promise<JSONAuthorisationObject>} The access code that was given.
     */
    async authorise(code, redirect_uri) {
        const data = new FormData;

        data.append("client_id", credentials.client_id);
        data.append("client_secret", credentials.client_secret);
        data.append("grant_type", "authorization_code");
        data.append("code", code);
        data.append("redirect_uri", redirect_uri);
        data.append("scope", "identify email guilds");

        const req = await fetch("https://discord.com/api/v6/oauth2/token", {
            method: "POST",
            headers: data.getHeaders(),
            body: data
        });

        if (req.status === 200) {
            return await req.json();
        } else if (req.status === 429) {
            const json = await req.json();

            await sleep(json.retry_after);

            return await this.refresh(code, redirect_uri);
        } else if (req.status === 401) {
            return null;
        } else {
            return null;
        }
    }

    /**
     * Refresh a user's access token.
     * @param {String} token The refresh token.
     * @param {String} redirect_uri The redirect URI that the user was redirected to after the oauth procedure.
     * @returns {Promise<JSONAuthorisationObject>} The access code that was given.
     */
    async refresh(token) {
        const data = new FormData;

        data.append("client_id", credentials.client_id);
        data.append("client_secret", credentials.client_secret);
        data.append("grant_type", "refresh_token");
        data.append("refresh_token", token);
        data.append("redirect_uri", process.env.BASE_WEB + "/oauth/discord");
        data.append("scope", "identify email guilds");

        const req = await fetch("https://discord.com/api/v6/oauth2/token", {
            method: "POST",
            headers: data.getHeaders(),
            body: data
        });

        if (req.status === 200) {
            return await req.json();
        } else if (req.status === 429) {
            const json = await req.json();

            await sleep(json.retry_after);

            return await this.refresh(token, redirect_uri);
        } else if (req.status === 401) {
            return null;
        } else {
            return null;
        }
    }

    /**
     * Get a user by their authorisation token.
     * @param {String} token The user's authorisation token.
     * @param {Boolean} [refresh] Whether or not to refresh the user object.
     * @returns {Promise<AuthorisedUser>}
     */
    async getUser(token, refresh = false) {
        const user = this.users.get(token);

        if (user && Date.now() < user.last_request + CACHE_EXPIRE && !refresh) {
            this.last_request = Date.now();

            return this.users.get(token);
        } else {
            const req = await fetch("https://discord.com/api/v6/users/@me", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (req.status === 200) {
                const user = await req.json();

                const auth = new AuthorisedUser(token, user);

                this.users.set(token, auth);

                auth.last_request = Date.now();
                
                return await this.getUser(token);
            } else if (req.status === 429) {
                const json = await req.json();

                await sleep(json.retry_after);
                
                return await this.getUser(token);
            } else if (req.status === 401) {
                return null;
            } else {
                return null;
            }
        }
    }
}