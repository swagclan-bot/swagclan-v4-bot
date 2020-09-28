// Imports
import { SwagClan } from "../class/SwagClan.js"

import { Service } from "./Service.js"

import discord from "discord.js"
import express from "express"
import fetch from "node-fetch"
import path from "path"

import oauth from "../api/schema/OAuth.js"
import Errors from "../api/schema/Errors.js"

import { promises as fs } from "fs"

/**
 * @typedef User
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
  * @typedef PartialGuild
  * @property {String} id The ID of the guild.
  * @property {String} name The name of the guild.
  * @property {String} icon The icon hash of the guild.
  * @property {Boolean} owner Whether or not the user is an owner of the guild.
  * @property {Number} permissions The permissions of the user in the guild.
  */

/**
 * @typedef Authorisation
 * @property {String} access_token The token to access authorised endpoints.
 * @property {String} token_type The type of token that was granted.
 * @property {Number} expires_in The number of seconds until the code expires.
 * @property {String} refresh_token The token to refresh the access token after it expires.
 * @property {String} scope The scope that was granted.
 */

/** The time before the user/guild cache expires. */
const CACHE_EXPIRE = 300000;

class SessionAuthorisation {
    constructor(service, id, auth) {
        /**
         * The service that the session is from.
         * @type {SessionService}
         */
        this.service = service;

        /**
         * The ID of the user.
         * @type {String}
         */
        this.id = id;

        /**
         * When the last user request was made.
         * @type {Number}
         */
        this.last_usr = 0;

        /**
         * When the last guild request was made.
         * @type {Number}
         */
        this.last_gld = 0;

        /**
         * The authorisation information for the session.
         * @type {Authorisation}
         */
        this.auth = auth;

        /**
         * The user with the session.
         * @type {User}
         */
        this.user = null;

        /**
         * The guilds that the user with the session is in.
         * @type {Array<PartialGuild>}
         */
        this.guilds = [];
    }

    /**
     * Convert the complex object to a simple pure JSON object.
     * @returns {any}
     */
    toJSON() {
        return {
            id: this.id,
            auth: this.auth
        }
    }

    /**
     * Save the session to a file.
     */
    async save() {
        await fs.writeFile(path.resolve(this.service.path, this.id + ".json"),  JSON.stringify(this));
    }

    /**
     * Logout of the user.
     */
    async logout() {
        this.user = null;
        this.guilds = null;
        this.auth = null;

        this.service.sessions.delete(this.id);

        await fs.unlink(path.resolve(this.service.path, this.id + ".json"), JSON.stringify(this));
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

        options.headers.Authorization = this.auth.token_type + " " + this.auth.access_token;

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
     * Get the user with the session.
     * @type {Boolean} no_cache= Force to not use the cache.
     * @returns {User}
     */
    async getUser(no_cache = false) {
        const t = Date.now();

        if (t < this.last_usr + CACHE_EXPIRE && !no_cache && this.user) {
            return this.user;
        }

        /** @type {User} */
        const user = await this.make("/users/@me");

        if (user.username) {
            this.user = user;
            this.last_usr = t;

            return user;
        } else {
            return null;
        }
    }

    /**
     * Get guilds for the user.
     * @type {Boolean} no_cache= Force to not use the cache.
     * @returns {Array<JSONPartialGuildObject>}
     */
    async getGuilds(no_cache = false) {
        const t = Date.now();

        if (t < this.last_gld + CACHE_EXPIRE && !no_cache && this.guilds) {
            return this.guilds;
        }

        /** @type {Array<PartialGuild>} */
        const guilds = await this.make("/users/@me/guilds");

        if (Array.isArray(guilds)) {
            this.guilds = guilds;
            this.last_gld = t;

            return guilds;
        } else {
            return null;
        }
    }
}

/**
 * Represents a service dedicated to managing user sessions.
 * @extends Service
 */
export class SessionService extends Service {
    /**
     * Instantiate the session service.
     * @param {SwagClan} client The client that instantiated this service.
     * @param {String} path The path of where the sessions are stored.
     */
    constructor(client, path) {
        super(client);

        /**
         * The path of where the sessions are stored.
         * @type {String}
         */
        this.path = path;

        /**
         * @type {discord.Collection<String,SessionAuthorisation>}
         */
        this.sessions = new discord.Collection;
    }

    /**
     * Middleware for handling authorised requests.
     * @returns { { (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> } }
     */
    handle() {
        /**
         * @param {express.Request} req The request body.
         * @param {express.Response} res The response body.
         */
        return async (req, res, next) => {
            if (req.cookies.sid) {
                req.auth = await this.get(req.cookies.sid);

                if (req.auth) {
                    await req.auth.getUser();
                } else {
                    req.auth = null;
                }
            } else {
                req.auth = null;
            }
            
            next();
        }
    }

    /**
     * Register a session by it's ID.
     * @param {String} id The ID of the session to register.
     * @param {Authorisation} authorisation The authorisation information for the session.
     */
    async register(id, authorisation) {
        const session = new SessionAuthorisation(this, id, authorisation);

        this.sessions.set(id, session);

        await session.save();

        return session;
    }

    /**
     * Get a session by it's ID.
     * @param {String} id The session ID to get.
     */
    async get(id) {
        if (this.sessions.get(id)) {
            return this.sessions.get(id);
        }

        try {
            const data = await fs.readFile(path.resolve(this.path, id + ".json"));
            const session = await new SessionAuthorisation(this, id, JSON.parse(data).auth);

            this.sessions.set(id, session);

            return session;
        } catch (e) {
            if (e.code === "ENOENT") {
                return null;
            }
            
            throw e;
        }
    }
}