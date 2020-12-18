// Imports
import { SwagClan } from "../class/SwagClan.js"

import { Service } from "./Service.js"

import discord from "discord.js"
import express from "express"
import fetch from "node-fetch"
import path from "path"
import oauth2 from "client-oauth2"

import lichess from "../../lib/lichess/index.js"

import credentials from "../../.credentials.js"

import { promises as fs } from "fs"

/**
 * @typedef JSONConnection
 * @property {JSONAuthorisation} auth The authorisation for the connection.
 * @property {String} name The name of the connection.
 * @property {String} id The ID of the profile.
 * @property {String} url The URL of the profile.
 * @property {String} username The username of the profile.
 * @property {Number} created_at When the connection was created.
 */

/**
 * @typedef JSONUserAccount
 * @property {String} id the ID of the account.
 * @property { { [key: string]: JSONConnection } } connections The third-party connections linked to the account.
 */

/**
 * @typedef JSONAccountConnection
 * @property {String} 
 */

/**
 * @typedef JSONAuthorisation
 * @property {String} access_token The token to access authorised endpoints.
 * @property {String} token_type The type of token that was granted.
 * @property {Number} expires_in The number of seconds until the code expires.
 * @property {String} refresh_token The token to refresh the access token after it expires.
 * @property {String} scope The scope that was granted.
 */


class AccountConnection {
    /**
     * Instantiate an account connection.
     * @param {UserAccount} account The account that the connection is linked to.
     * @param {JSONConnection} connection The raw connection information.
     */
    constructor(account, connection) {
        /**
         * The account that the connection is linked to.
         * @type {UserAccount}
         */
        this.account = account;

        /**
         * The authorisation for the connection.
         * @type {JSONAuthorisation}
         */
        this.auth = connection.auth;

        /**
         * The name of the connection.
         * @type {String}
         */
        this.name = connection.name;

        /**
         * The ID of the profile.
         * @type {String}
         */
        this.id = connection.id;

        /**
         * The URL of the profile.
         * @type {String}
         */
        this.url = connection.url;

        /**
         * The username of the profile.
         * @type {String}
         */
        this.username = connection.username;

        /**
         * When the connection was created.
         * @type {Number}
         */
        this.created_at = connection.created_at;
    }

    /**
     * Convert the complex object to a pure JSON object.
     * @returns {JSONConnection}
     */
    toJSON() {
        return {
            auth: this.auth,
            name: this.name,
            id: this.id,
            url: this.url,
            username: this.username,
            created_at: this.created_at
        }
    }
    
    /**
     * Get the access token.
     * @returns {String}
     */
    async token() {
        return this.auth.token_type + " " + this.auth.access_token;
    }
}

const oauthLichess = new oauth2({
    clientId: credentials.lichess_id,
    clientSecret: credentials.lichess_secret,
    accessTokenUri: lichess.Client.BASE_OAUTH + "/oauth",
    authorizationUri: lichess.Client.BASE_OAUTH + "/oauth/authorize",
    redirectUri: process.env.BASE_API + "/account/connections/lichess/callback",
    scopes: ["challenge:read", "challenge:write"]
});

const oauthGithub = new oauth2({
    clientId: credentials.github_id,
    clientSecret: credentials.github_secret,
    accessTokenUri: "https://github.com/login/oauth/access_token",
    authorizationUri: "https://github.com/login/oauth/authorize",
    redirectUri: process.env.BASE_API + "/account/connections/github/callback",
    scopes: ["read:user"]
});

class UserAccount {
    /**
     * Instantiate a user account.
     * @param {AccountService} service The account service that instantiated the user account.
     * @param {JSONUserAccount} account The raw account information.
     */
    constructor(service, account) {
        /**
         * The account service that instantiated the user account.
         * @type {AccountService}
         */
        this.service = service;

        /**
         * The ID of the account.
         * @type {Number}
         */
        this.id = account.id;

        /**
         * The connections to the account.
         * @type { { [key: string]: AccountConnection } }
         */
        this.connections = Object.fromEntries(Object.entries(account.connections).map(([name, connection]) => {
            return [name, new AccountConnection(this, connection)];
        }));
    }

    /**
     * Convert the complex object to a pure JSON object.
     * @returns {JSONUserAccount}
     */
    toJSON() {
        return {
            id: this.id,
            connections: this.connections
        }
    }

    /**
     * Save the user account.
     */
    async save() {
        await fs.writeFile(path.resolve(this.service.path, this.id + ".json"), JSON.stringify(this));
    }

    /**
     * Get the oauth2 authorisation flow URL for a connection.
     * @param {String} connection The connection to get the authorisation flow URL for.
     * @returns {String}
     */
    getURI(connection) {
        if (connection === "lichess") {
            return oauthLichess.code.getUri();
        } else if (connection === "github") {
            return oauthGithub.code.getUri();
        } else {
            return "";
        }
    }

    /**
     * Authorise a connection.
     * @param {String} connection The connection to authorise.
     * @param {String} url The callback URL.
     * @returns {Boolean}
     */
    async authorise(connection, url) {
        try {
            if (connection === "lichess") {
                const lichesstoken = await oauthLichess.code.getToken(url);
                const auth = lichesstoken.data;

                const user = await fetch(lichess.Client.BASE_API + "/account", {
                    headers: {
                        "Authorization": auth.token_type + " " + auth.access_token
                    }
                });

                const json = await user.json();

                this.connections.lichess = new AccountConnection(this, {
                    id: json.id,
                    name: "lichess",
                    username: json.username,
                    url: json.url,
                    created_at: Date.now(),
                    auth
                });
            } else if (connection === "github") {
                const githubtoken = await oauthGithub.code.getToken(url);
                const auth = githubtoken.data;

                const user = await fetch("https://api.github.com/user", {
                    headers: {
                        "Authorization": auth.token_type + " " + auth.access_token
                    }
                });

                const json = await user.json();

                this.connections.github = new AccountConnection(this, {
                    id: json.id,
                    name: "github",
                    username: json.login,
                    url: json.html_url,
                    created_at: Date.now(),
                    auth
                });
            } else {
                return false;
            }
        } catch (e) {
            console.error(e);

            return false;
        }
        
        await this.save();

        return true;
    }
}

/**
 * Represents a service dedicated to managing user account connections.
 * @extends Service
 */
export class AccountService extends Service {
    /**
     * Instantiate the account service.
     * @param {SwagClan} client The client that instantiated this service.
     * @param {String} path The path of where the accountss are stored.
     */
    constructor(client, path) {
        super(client);

        /**
         * The path of where the connections are stored.
         * @type {String}
         */
        this.path = path;

        /**
         * @type {discord.Collection<String,UserAccount>}
         */
        this.users = new discord.Collection;
    }

    /**
     * Get a guild's settings by it's ID.
     * @param {discord.UserResolvable} user_resolvable The guild to get the settings for.
     * @returns {UserAccount}
     */
    async getAccount(user_resolvable) {
        const user = this.client.users.resolveID(user_resolvable);

        if (this.users.get(user)) {
            return this.users.get(user);
        } else {
            try {
                await this.loadAccount(user);
            } catch (e) {
                if (e.code === "ENOENT") {
                    const account = await this.createAccount(user_resolvable);
                    
                    await account.save();

                    this.users.set(user, account);
                } else {
                    throw e;
                }
            }
            
            return await this.getAccount(user_resolvable);
        }
    }

    /**
     * Save all settings.
     */
    async saveAll() {
        for (let entry of this.users) {
            const user = entry[1];

            await user.save();
        }
    }

    /**
     * Load custom commands for a guild.
     * @param {String} id The ID of the guild to load.
     * @returns {UserAccount]
     */
    async loadAccount(id) {
        try {
            const data = await fs.readFile(path.resolve(this.path, id + ".json"));
            const json = JSON.parse(data.toString());

            const account = new UserAccount(this, json);

            this.users.set(id, account);

            this.emit("load", account);
            
            return account;
        } catch (e) {
            if (~e.toString().indexOf("ENOENT")) {
                throw e;
            }

            const account = this.createAccount(id);

            account.prevent_save = true;
            
            this.emit("error", id, e);

            return account;
        }
    }

    /**
     * Create a user account.
     * @param {discord.UserResolvable} user_resolvable The user to create the account for.
     * @returns {UserAccount}
     */
    createAccount(user_resolvable) {
        const user = this.client.users.resolve(user_resolvable);

        const account = new UserAccount(this, {
            id: user.id,
            connections: {}
        });

        this.users.set(user.id, account);

        return account;
    }
}