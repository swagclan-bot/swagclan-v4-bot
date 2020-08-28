// Imports
import { SwagClan } from "../class/SwagClan.js"

import { Service } from "./Service.js"

import discord from "discord.js"

/**
 * @typedef JSONGuildMessageLogsObject
 * @property {Array<JSONGuildMessageLogEntryObject>} messages The logged messages.
 */

/**
 * @typedef JSONGuildMessageLogEntryObject
 * @property {String} id The ID of the message.
 * @property {}
 */

/**
 * @typedef JSONChannelObject
 * @property {String} id The ID of the channel.
 * @property {String} name The name of the channel.
 */

/**
 * @typedef JSONAuthorObject
 * @property {String} id The ID of the author.
 * @property {S}
 */

/**
 * 
 */

/**
 * Represents a log entry for a message.
 */
class GuildMessageLogEntry {
    /**
     * 
     * @param {GuildMessageLogs} guild_lgos The message logs for the guild.
     * @param {JSONGuildMessageLogEntryObject} message The message to log.
     */
    constructor(guild_logs, message) {
        /**
         * The message logs for the guild.
         */
        this.guild_logs = logs;

        /**
         * The ID of the message.
         * @type {String}
         */
        this.id = message.id;

        /**
         * The ID of the channel.
         * @type {String}
         */
        this.channel = message.channel;
    }
}

/**
 * Represents logged messages in a text channel.
 */
class ChannelessageLogs {
    /**
     * 
     * @param {GuildMessageLogs} logs 
     * @param {*} messages 
     */
    constructor(logs, messages) {

    }
}

/**
 * Represents message logs for a guild.
 */
class GuildMessageLogs {
    /**
     * Instantiate a guild's message logs.
     * @param {MessageLogService} service The service that instantiated this object.
     * @param {discord.Guild} guild The guild that the message logs are for.
     * @param { { [key: string]: JSONChannelMessageLogsObject } }
     */
    constructor(service, guild, channels) {
        /**
         * The service that instantiated this object.
         * @type {MessageLogService}
         */
        this.service = service;

        /**
         * The guild that the message logs are for.
         * @type {discord.Guild}
         */
        this.guild = guild;
        
        /**
         * The logged messages.
         * @type {discord.Collection<String,ChannelMessageLogs>}
         */
        this.channels = discord.Collection(Object.entries(channels).map());
    }

    /**
     * Convert the complex object to a pure JSON structure.
     * @returns {JSONGuildMessageLogsObject}
     */
    toJSON() {
        return Object.fromEntries(this.channels.entries());
    }
}

/**
 * Represents a service dedicated to managing message logs.
 * @extends Service
 */
export class MessageLogService extends Service {
    /**
     * Instantiate the message log service.
     * @param {SwagClan} client The client that instantiated this service.
     */
    constructor(client, path) {
        super(client);

        /**
         * The path where the guild message logs are stoed.
         * @type {String}
         */
        this.path = path;

        /**
         * The message log by guild IDs.
         * @type {discord.Collection<String,GuildMessageLogs>}
         */
        this.guilds = new discord.Collection;
    }

    /**
     * Create message logs for a guild.
     * @param {discord.GuildResolvable} guild_resolvable The guild to create the message logs for.
     * @returns {GuildMessageLogs}
     */
    createMessageLogs(guild_resolvable) {
        const guild = this.client.guilds.resolve(guild_resolvable);

        const logs = new GuildMessageLogs(this, guild, { channels: {} });

        this.guilds.set(guild.id, logs);

        return logs;
    }
}