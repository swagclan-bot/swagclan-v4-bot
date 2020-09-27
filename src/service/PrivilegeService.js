// Imports
import path from "path"
import discord from "discord.js"

import { promises as fs } from "fs"

import { SwagClan } from "../class/SwagClan.js"

import { Service } from "./Service.js"

/**
 * @typedef PrivilegedUser
 * @property {String} id The ID of the user.
 * @property {String} tag The tag of the user.
 * @property {Number} timestamp When the user was added.
 */

/**
 * @typedef PrivilegedGuild
 * @property {String} id The ID of the guild.
 * @property {String} name The name of the guild.
 * @property {Number} timestamp When the guild was added.
 */
 
/**
 * Convert a collection to an object.
 * @param {discord.Collection} col The collection to convert into an object.
 * @returns {any}
 */
function to_object(col) {
	return Object.fromEntries(col.entries());
}

/**
 * Represents a class of privileges.
 */
class PrivilegeClass {
    /**
     * Instantiate a class of privileges object.
     * @param {PrivilegeService} service The privilege service that the privilege class is loaded into.
     * @param {String} name The name of the privilege class.
     */
    constructor(service, name) {
        /**
         * The privilege service that the privilege class is loaded into.
         * @type {PrivilegeService}
         */
        this.service = service;

        /**
         * The name of the privilege class.
         * @type {String}
         */
        this.name = name;

        /**
         * The users of the privilege class.
         * @type {discord.Collection<String,PrivilegedUser>}
         */
        this.users = new discord.Collection;

        /**
         * The guilds of the privilege class.
         * @type {discord.Collection<String,PrivilegedGuild>}
         */
        this.guilds = new discord.Collection;

        this.service.client.on("userUpdate", async (old_user, new_user) => {
            const cache = this.users.get(new_user.id);

            if (cache) {
                cache.tag = new_user.tag;

                await this.sync();
            }
        });

        this.service.client.on("guildUpdate", async (old_guild, new_guild) => {
            const cache = this.guilds.get(new_guild.id);

            if (cache) {
                cache.name = new_guild.name;

                await this.sync();
            }
        });
    }

    /**
     * Save the privilege class version to the file system.
     */
    async save() {
        const pathname = path.resolve(this.service.path, this.name + ".json");

        try {
            await fs.writeFile(pathname, JSON.stringify({
                users: to_object(this.users),
                guilds: to_object(this.guilds)
            }));
        } catch (e) {
			throw e;
        }
    }
	
	/**
	 * Load the privilege class from the file system.
	 */
	async load() {
		const pathname = path.resolve(this.service.path, this.name + ".json");
		
		try {
            const read = await fs.readFile(pathname, "utf8");
            const json = JSON.parse(read.toString());

            if (json.users) {
                this.users = new discord.Collection([
                    ...Object.entries(json.users),
                    ...this.users.entries()
                ]);
            }

            if (json.guilds) {
                this.guilds = new discord.Collection([
                    ...Object.entries(json.guilds),
                    ...this.guilds.entries()
                ]);
            }
		} catch (e) {
			if (e.code === "ENOENT") {
				await fs.writeFile(pathname, "{users:{},guilds:{}}");
			} else {
				throw e;
			}
		}
	}

    /**
     * Check whether a guild or user or member's guild has this privilege class.
     * @param {discord.User|discord.GuildMember|discord.Guild} whowhat Who/what the check.
     * @returns {Boolean}
     */
    test(whowhat) {
        return !!this.get(whowhat);
    }

    /**
     * Get a guild or user or members's guild in this privilege class.
     * @param {discord.User|discord.GuildMember|discord.Guild} whowhat Who/what the check.
     * @returns {discord.User|discord.Guild}
     */
    get(whowhat) {
        if (!whowhat.id) {
            return this.users.get(whowhat) || this.guilds.get(whowhat);
        }

        if (whowhat.guild) {
            return this.users.get(whowhat.id) || this.guilds.get(whowhat.guild.id);
        }

        return this.users.get(whowhat.id) || this.guilds.get(whowhat.id);
    }
}

/**
 * Represents a service dedicated to managing privilege classes.
 */
export class PrivilegeService extends Service {
    /**
     * Instantiate the privileges service.
     * @param {SwagClan} client The bot client that instantiated this service
     */
    constructor(client, path) {
        super(client);

        /**
         * Users or guilds with administrator access for the bot.
         * @type {PrivilegeClass}
         */
        this.admins = new PrivilegeClass(this, "admins");
        
        /**
         * Blacklisted users or guilds for the bot.
         * @type {PrivilegeClass}
         */
        this.blacklist = new PrivilegeClass(this, "blacklist");
        
        /**
         * Users or guilds with access to beta commands.
         * @type {PrivilegeClass}
         */
        this.beta = new PrivilegeClass(this, "beta");
        
        /**
         * Users or guilds with premium access.
         * @type {PrivilegeClass}
         */
        this.premium = new PrivilegeClass(this, "premium");

        /**
         * The path to store the privilege classes.
         * @type {String}
         * 
         */
        this.path = path;
    }
}