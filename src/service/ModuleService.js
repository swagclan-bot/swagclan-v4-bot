// Imports
import discord from "discord.js"
import path from "path"

import { promises as fs } from "fs"

import { Service } from "./Service.js"

import { SwagClan } from "../class/SwagClan.js"
import ChunkArr from "../util/chunk.js"

import config from "../../.config.js"

const reply_modes = {
    success: 0x34eb34,
    info: 0x34a2eb,
    loading: 0x424242,
    debug: 0xebc034,
    error: 0xeb4c34
}

/**
 * @typedef CommandInterfaceInformation
 * @property {discord.Message} message The message that was sent.
 * @property {ModuleCommand} command The module command that was called.
 * @property {Object} args Parsed arguments for the message.
 * @property {Number} version_id The ID of the command version that was called.
 */

/**
 * @typedef {"success"|"info"|"loading"|"debug"|"error"} CommandInterfaceReplyMode
 */

/** 
 * @typedef CommandInterfaceReplyFile
 * @property {String} attachment The attachment of the file.
 * @property {String} name The name of the file.
 */

/**
 * @typedef CommandInterfaceReplyField
 * @property {String} title The title of the field.
 * @property {String} body The body of the field.
 * @property {Boolean} inline Whether or not the field should be inline.
 */

/**
 * @typedef CommandInterfaceReplyOptions
 * @extends {discord.MessageEmbed}
 * @property {Array<CommandInterfaceReplyField>} fields An array of fields in the reply.
 * @property {Array<CommandInterfaceReplyFile>} files An array of files to upload.
 * @property {String} footer The footer text.
 * @property {Date} timestamp The timestamp of the embed.
 */

/**
 * @typedef CommandInterfaceReplyPagesOptions
 * @property {Array<CommandCInterfaceReplyFile>} files An array of files to upload.
 */

/**
 * @typedef CommandInterfaceEditOptions
 * @property {Array<CommandInterfaceReplyField>} fields An array of fields in the reply.
 */

/**
 * Represents a command interface.
 */
export class CommandInterface {
    /**
     * Instantite a command interface.
     * @param {SwagClan} client The client that instantiated this interface.
     * @param {CommandInterfaceInformation} info The information for the interface.
     */
    constructor(client, info) {
        /**
         * The message that was sent.
         * @type {discord.Message}
         */
        this.message = info.message;
        
        /**
         * The module command that was called.
         * @type {ModuleCommand}
         */
        this.command = info.command;

        /**
         * The client that instantiated this object.
         * @type {SwagClan}
         */
        this.client = client;

        /**
         * All replies that were made to the original message.
         * @type {Array<discord.Message>}
         */
        this.replies = [];

        /**
         * The version ID that was used.
         * @type {Number}
         */
        this.version_id = info.version_id;

        /**
         * The version of the command that was used.
         * @type {CommandVersion}
         */
        this.version = this.command.versions[this.version_id];

        /**
         * The arguments that were parsed.
         * @type { { [key: string]: ParsedArgument } }
         */
        this.args = info.args;
    }

    /**
     * Escape message content to remove markdown effects.
     * @param {String} str The string to escape.
     * @returns {String}
     */
    escape(str) {
        return str
            .replace(/`/g, "\\`")
            .replace(/\*/g, "\\*")
            .replace(/_/g, "\\_")
            .replace(/~/g, "\\~")
            .replace(/\>/gm, "\\>")
            .replace(/\|\|/, "\\|\\|")
            .trim();
    }

    /**
     * Escape a string inside code tags.
     * @param {String} str The string to escape.
     * @returns {String}
     */
    escape_c(str) {
        return str.replace(/`/g, "ˋ").trim();
    }

    /**
     * Set the timeout until the user can use the command again.
     * @param {Number} [ms] The miliseconds to time out the user for. Leave empty to reset.
     */
    setTimeout(ms = 0) {
        this.command.timeouts.set(this.message.author.id, Date.now() + ms);
    }

    /**
     * Generate an embed object to reply with.
     * @param {CommandInterfaceReplyMode} mode The status of the embed, success/info/debug/error.
     * @param {String} body The body/description of the embed.
     * @param {CommandInterfaceReplyOptions} options Options for the embed.
     * @returns {Object}
     */
    async render(mode, body, options) {
        return {
            color: reply_modes[mode] || mode || 0x34eb34,
            title: this.command.display,
            ...options,
            description: body,
            fields: options.fields ? options.fields.map(field => {
                return {
                    name: field.title,
                    value: field.body,
                    inline: field.inline
                }
            }) : [],
            timestamp: options.timestamp ?? new Date(),
            footer: {
                icon_url: this.message.client.user.avatarURL({ format: "png" }),
                text: options.footer ?? ("v" + config.version + " by " + config.author.discord)
            }
        }
    }

    /**
     * Reply to a message without an embed.
     * @param {String} content The content of the message to reply with.
     * @returns {discord.Message}
     */
    async replyText(content) {
        this.replies.push(await this.message.channel.send(content));

        return this.replies[this.replies.length - 1];
    }

    /**
     * Edit the last message that was sent without an embed.
     * @param {String} content The content of the message to edit.
     * @returns {discord.Message}
     */
    async editText(content) {
        if (!this.replies.length) {
            return this.replyText(content);
        }

        if (this.replies[this.replies.length - 1].deleted) {
            return this.replyText(content);
        }

        return await this.replies[this.replies.length - 1].edit(content);
    }

    /**
     * Reply to the message that called the command.
     * @param {CommandInterfaceReplyMode} mode The status of the reply, success/info/debug/error.
     * @param {String} body The body/description of the reply.
     * @param {CommandInterfaceReplyOptions} options Options for the reply.
     * @returns {discord.Message}
     */
    async reply(mode, body, options = {}) {
        if (options.text) {
            this.replies.push(await this.message.channel.send({
                embed: await this.render(mode, body, options),
                files: options.files || []
            }));
        } else {
            this.replies.push(await this.message.channel.send(options.text, {
                embed: await this.render(mode, body, options),
                files: options.files || []
            }));
        }

        return this.replies[this.replies.length - 1];
    }

    /**
     * Edit the last reply to the message that called the command.
     * @param {CommandInterfaceReplyMode} mode The status of the edit, success/info/debug/error.
     * @param {String} body The body/description of the edit.
     * @param {CommandInterfaceEditOptions} options Options for the edit.
     * @returns {discord.Message}
     */
    async edit(mode, body, options = {}) {
        if (!this.replies.length) {
            return this.reply(mode, body, options);
        }

        if (this.replies[this.replies.length - 1].deleted) {
            return this.reply(mode, body, options);
        }

        if (options.text) {
            return await this.replies[this.replies.length - 1].edit(options.text, {
                embed: await this.render(mode, body, {
                    timestamp: this.replies[this.replies.length - 1].createdTimestamp,
                    ...options
                })
            });
        } else {
            return await this.replies[this.replies.length - 1].edit({
                embed: await this.render(mode, body, {
                    timestamp: this.replies[this.replies.length - 1].createdTimestamp,
                    ...options
                })
            });
        }
    }

    /**
     * Delete the last message sent.
     */
    async delete() {
        if (this.replies[this.replies.length - 1]) {
            await this.replies[this.replies.length - 1].delete();
        }
    }

    /**
     * Create an embed with multiple interactive pages.
     * @param {CommandInterfaceReplyMode} mode The status of the message, success/info/debug/error.
     * @param {String} body The body/description of the message.
     * @param {Array<CommandInterfaceReplyField>} fields The fields to display in pages.
     * @param {CommandInterfaceReplyPagesOptions} [options] Options for the message.
     */
    async createPages(mode, body, fields, options = {}) {
        // Chunk fields into 5 fields per page.
        const pages = ChunkArr(fields, options.per || 5);
        let cur_page = 0;

        const last_switch = {};
        const infractions = {};

        if (pages.length < 2) {
            await this.reply(mode, body.trim(), {
                fields: pages[cur_page],
                ...options
            });
        } else {
            const display = await this.reply(mode, (body + " (Page " + (cur_page + 1) + "/" + pages.length + ")").trim(), {
                fields: pages[cur_page],
                ...options
            });
            
            const collector = display.createReactionCollector((reaction, user) => { // Wait for ◀ and ▶ emoji reactions to change page.
                return (reaction.emoji.name === "◀" || reaction.emoji.name === "▶") && user.id === this.message.author.id;
            }, { idle: 60000, dispose: true });
    
            const update_page = async (reaction, user) => { // Re-render the page.
                const before = cur_page;
    
                if (last_switch[user.id] && Date.now() - last_switch[user.id] < 500) {
                    if (!infractions[user]) {
                        infractions[user] = 0;
                    }
    
                    infractions[user]++;
                }
    
                last_switch[user.id] = Date.now();
    
                if (infractions[user] && infractions[user] > 6) {
                    this.edit("error", "You are changing pages too fast.");
                    this.replies[this.replies.length - 1].reactions.removeAll();
                    collector.stop();
    
                    return;
                }
    
                if (reaction.emoji.name === "◀") {
                    cur_page = --cur_page >= 0 ? cur_page : 0; // Clamp the page number.
                } else if (reaction.emoji.name === "▶") {
                    cur_page = ++cur_page < pages.length ? cur_page : pages.length - 1;
                }
    
                if (before === cur_page) { // If the page hasn't changed, then there is nothing new to render.
                    return;
                }
    
                await this.edit(mode, body + " (Page " + (cur_page + 1) + "/" + pages.length + ")", { // Render new page.
                    fields: pages[cur_page],
                    ...options
                });
            }
    
            // Change and re-render the page if reactions of ◀ and ▶ have been updated.
            collector.on("collect", update_page);
            collector.on("remove", update_page);

            collector.on("end", async () => {
                await display.reactions.removeAll();
                
                await this.edit(mode, body + " (Page " + (cur_page + 1) + "/" + pages.length + ")", { // Render new page.
                    fields: pages[cur_page],
                    footer: "Page turning has ended.",
                    ...options
                });
            });

            try {
                await display.react("◀");
                await display.react("▶");
            } catch (e) {
                
            }
        }
    }
}

/**
 * @typedef MessageMatcherInterfaceInformation
 * @property {discord.Message} message The original message that was matched.
 * @property {MessageMatcher} matcher The matcher that was called.
 */

/**
 * Represents an interface for a message matcher callback.
 */
export class MessageMatcherInterface {
    /**
     * Instantiate a message matcher interface.
     * @param {SwagClan} client The client that instantiated this interface.
     * @param {MessageMatcherInterfaceInformation} info The message matcher interface information.
     */
    constructor(client, info) {
        /**
         * The message that was sent.
         * @type {discord.Message}
         * @private
         */
        this._message = info.message;
        
        /**
         * The matcher that was called.
         * @type {MessageMatcher}
         * @private
         */
        this._matcher = info.matcher;

        /**
         * The client that instantiated this object.
         * @type {SwagClan}
         */
        this.client = client;

        /**
         * All replies that were made to the original message.
         * @type {Array<discord.Message>}
         */
        this.replies = [];
    }
    
    /**
     * Escape message content to remove markdown effects.
     * @param {String} str The string to escape.
     * @returns {String}
     */
    escape(str) {
        return str
            .replace(/`/g, "\\`")
            .replace(/\*/g, "\\*")
            .replace(/_/g, "\\_")
            .replace(/~/g, "\\~")
            .replace(/\>/gm, "\\>")
            .replace(/\|\|/, "\\|\\|")
            .trim();
    }

    /**
     * Escape a string inside code tags.
     * @param {String} str The string to escape.
     * @returns {String}
     */
    escape_c(str) {
        return str.replace(/`/g, "ˋ").trim();
    }

    /**
     * Generate an embed object to reply with.
     * @param {CommandInterfaceReplyMode} mode The status of the embed, success/info/debug/error.
     * @param {String} body The body/description of the embed.
     * @param {CommandInterfaceReplyOptions} options Options for the embed.
     * @returns {Object}
     */
    async render(mode, body, options) {
        return {
            color: reply_modes[mode] || mode || 0x34eb34,
            title: this._matcher.display,
            ...options,
            description: body,
            fields: options.fields ? options.fields.map(field => {
                return {
                    name: field.title,
                    value: field.body,
                    inline: field.inline
                }
            }) : [],
            timestamp: options.timestamp ?? new Date(),
            footer: {
                icon_url: this._message.client.user.avatarURL({ format: "png" }),
                text: options.footer ?? ("v" + config.version + " by " + config.author.discord)
            }
        }
    }

    /**
     * Reply to the message that called the command.
     * @param {CommandInterfaceReplyMode} mode The status of the reply, success/info/debug/error.
     * @param {String} body The body/description of the reply.
     * @param {CommandInterfaceReplyOptions} options Options for the reply.
     * @returns {discord.Message}
     */
    async reply(mode, body, options = {}) {
        this.replies.push(await this._message.channel.send({
            embed: await this.render(mode, body, options),
            files: options.files || []
        }));

        return this.replies[this.replies.length - 1];
    }

    /**
     * Edit the last reply to the message that called the command. This handles rate limits for you.
     * @param {CommandInterfaceReplyMode} mode The status of the edit, success/info/debug/error.
     * @param {String} body The body/description of the edit.
     * @param {CommandInterfaceEditOptions} options Options for the edit.
     * @returns {discord.Message}
     */
    async edit(mode, body, options = {}) {
        if (!this.replies.length) {
            return this.reply(mode, body, options);
        }

        if (this.replies[this.replies.length - 1].deleted) {
            return this.reply(mode, body, options);
        }

        return await this.replies[this.replies.length - 1].edit({
            embed: await this.render(mode, body, {
                timestamp: this.replies[this.replies.length - 1].createdTimestamp,
                ...options
            })
        });
    }

    /**
     * Timeout the message matcher until it can be used again.
     * @param ms The miliseconds to timeout for.
     * @returns {Number}
     */
    timeout(ms) {
        this._matcher.timeout(ms);
    }
}

/**
 * @typedef {String|BotModule} BotModuleResolvable
 */

/**
 * @callback ModuleShutdown
 * @param {String} reason The reason for the shutdown.
 * @returns {Promise<void>}
 */

/**
 * @typedef BotModuleInformation
 * @property {String} name The name of the module.
 * @property {String} description The description of the module.
 * @property {String} emoji The emoji of the module.
 * @property {Boolean} [admin] Whether or not the module can only be used by bot admins.
 * @property {Boolean} [beta] Whether or not the module can only be used in beta-activated servers.
 * @property {Boolean} [hidden] Whether or not the module is hidden.
 * @property {Array<ModuleCommand>} commands An array of commands in the module.
 * @property {Array<MessageMatcher>} matchers An array of message matches in the module.
 * @property {ModuleShutdown} [shutdown] A shutdown function to clear or reset data.
 */

/**
 * @typedef JSONBotModuleObject
 * @property {String} name The name of the module.
 * @property {String} description The description of the module.
 * @property {String} emoji The emoji of the module.
 * @property {Boolean} [admin] Whether or not the module can only be used by bot admins.
 * @property {Boolean} [beta] Whether or not the module can only be used in beta-activated servers.
 * @property {Boolean} [hidden] Whether or not the module is hidden.
 * @property {Array<JSONModuleCommandObject>} commands An array of commands in the module.
 * @property {Array<JSONMessageMatcherObject>} matchers An array of message matches in the module.
 */

/**
 * Represents a bot module for the client.
 */
export class BotModule {
    /**
     * Instantiate a bot module object.
     * @param {BotModuleInformation} info The bot module information.
     */
    constructor(info) {
        /**
         * The name of the bot module.
         * @type {String}
         */
        this.name = info.name;

        /**
         * The description of the bot module.
         * @type {String}
         */
        this.description = info.description;

        /**
         * The emoji of the bot module.
         * @type {String}
         */
        this.emoji = info.emoji;

        /**
         * Whether or not the bot can only be used by bot administrators.
         * @type {Boolean}
         */
        this.admin = info.admin || false;

        /**
         * Whether or not the bot module can only be used in beta guilds.
         * @type {Boolean}
         */
        this.beta = info.beta || false;

        /**
         * Whether or not the bot module is hidden.
         * @type {Boolean}
         */
        this.hidden = info.hidden || false;

        /**
         * An array of commands in the bot module.
         * @type {Array<ModuleCommand>}
         */
        this.commands = (info.commands || []).map(command => {
            command.admin = command.admin || this.admin;
            command.beta = command.beta || this.beta;
            command.hidden = command.beta || this.hidden;

            return command;
        });

        /**
         * An array of message matches in the bot module.
         * @type {Array<MessageMatcher>}
         */
        this.matchers = info.matchers || [];

        /**
         * A shutdown function for the bot module.
         * @type {ModuleShutdown}
         */
        this.shutdown = info.shutdown;
    }

    /**
     * Covert the complex object into a pure JSON object.
     * @returns {JSONBotModuleObject}
     */
    toJSON() {
        return {
            name: this.name,
            description: this.description,
            emoji: this.emoji,
            admin: this.admin,
            beta: this.beta,
            hidden: this.hidden,
            commands: this.commands.filter(command => !command.hidden && !command.beta && !command.admin),
            matchers: this.matchers
        }
    }

    /**
     * The name as it would be displayed on an embed.
     * @type {String}
     */
    get display() {
        return this.name +
            (this.emoji ? " " + this.emoji : "") +
            (this.beta ? " 🚧" : "") +
            (this.admin ? " 🛡" : "") +
            (this.hidden ? " 👁" : "");
    }
}

/**
 * @callback ModuleCommandCallback
 * @param {discord.Message} message The message that was sent.
 * @memberof CommandInterface
 */

/**
 * @typedef ModuleCommandInformation
 * @property {String} name The name of the command.
 * @property {String} description The description of the command.
 * @property {String} emoji The emoji of the command.
 * @property {Boolean} [admin] Whether or not the command can only be used by bot admins.
 * @property {Boolean} [beta] Whether or not the command can only be used in beta-activated servers.
 * @property {Boolean} [hidden] Whether or not the command is hidden.
 * @property {Array<CommandArgument>} versions The different command versions.
 * @property {Number} [delay] The delay in miliseconds that the user must wait between each command.
 * @property {ModuleCommandCallback} callback The callback for the command when called.
 * @property {String} example An example of the command being used.
 */

/**
 * @typedef JSONModuleCommandObject
 * @property {String} name The name of the command.
 * @property {String} description The description of the command.
 * @property {String} emoji The emoji of the command.
 * @property {Boolean} [admin] Whether or not the command can only be used by bot admins.
 * @property {Boolean} [beta] Whether or not the command can only be used in beta-activated servers.
 * @property {Boolean} [hidden] Whether or not the command is hidden.
 * @property {Array<JSONCommandArgumentObject>} versions The different command versions.
 * @property {Number} delay The delay in miliseconds that the user must wait between each command.
 * @property {String} example An example of the command being used.
 */

/**
 * @typedef ParsedCommand
 * @property {Number} version_id The ID of the version that was used.
 * @property { { [key: string]: ParsedArgument }} parsed_args The arguments that were parsed.
 */

/**
 * Represents a command in a bot module.
 */
export class ModuleCommand {
    /**
     * Instantiate a ModuleCommand object.
     * @param {ModuleCommandInformation} cmd Information for the command.
     */
    constructor(cmd) {
        /**
         * The callback for when the command is called.
         * @type {ModuleCommandCallback}
         * @private
         */
        this._callback = cmd.callback;

        /**
         * The name of the command.
         * @type {String}
         */
        this.name = cmd.name;

        /**
         * The description of the command.
         * @type {String}
         */
        this.description = cmd.description;

        /**
         * The emoji of the command.
         * @type {String}
         */
        this.emoji = cmd.emoji;

        /**
         * Whether or not the command can only be used by bot admins.
         * @type {Boolean}
         */
        this.admin = cmd.admin ?? false;
        
        /**
         * Whether or not the command can only be used in beta-activated servers.
         * @type {Boolean}
         */
        this.beta = cmd.beta ?? false;
        
        /**
         * Whether or not the command is hidden.
         * @type {Boolean}
         */
        this.hidden = cmd.hidden ?? false;

        /**
         * An array of argument sets for the command.
         * @type {Array<CommandVersion>}
         */
        this.versions = cmd.versions;

        /**
         * An example of the command being used.
         * @type {String}
         */
        this.example = cmd.example;

        /**
         * The delay in miliseconds that the user must wait between each command.
         * @property {Number}
         */
        this.delay = cmd.delay || 250;

        /**
         * When the users who have used the command can use it again.
         * @type {discord.Collection<String,Number>}
         */
        this.timeouts = new discord.Collection;
    }

    /**
     * Covert the complex object into a pure JSON object.
     * @returns {JSONModuleCommandObject}
     */
    toJSON() {
        return {
            name: this.name,
            description: this.description,
            emoji: this.emoji,
            admin: this.admin,
            beta: this.beta,
            hidden: this.hidden,
            versions: this.versions,
            delay: this.delay,
            example: this.example
        }
    }

    /**
     * The command name as it would be shown in an embed.
     * @type {String}
     */
    get display() {
        return this.name +
            (this.emoji ? " " + this.emoji : "") +
            (this.beta ? " 🚧": "") +
            (this.admin ? " 🛡" : "");
    }

    /**
     * Validate a command call.
     * @param {discord.Message} message The message that was sent.
     * @param {String} text The string to check.
     * @returns {Promise<ParsedCommand|null>}
     */
    async validate(message) {
        const parsed = {
            version_id: 0,
            parsed_args: {}
        };

        for (let i = 0; i < this.versions.length; i++) {
            let parts = message.content.split(" ");

            parsed.version_id = i;
            parsed.parsed_args = await this.versions[i].validate(message, parts);

            if (parsed.parsed_args) {
                return parsed;
            }
        }

        return null;
    }
    
    /**
     * Clear all timeouts for the command.
     */
    clearTimeouts() {
        this.timeouts.clear();
    }

    /**
     * Execute the command callback with the command call context.
     * @param {discord.Message} message The original message that was sent.
     * @param {ParsedCommand} args The parsed arguments to pass.
     * @returns {Promise<CommandInterface>}
     */
    async callback(message, args) {
        /** @type {SwagClan} */
        const client = message.client;

        const interact = new CommandInterface(client, {
            message,
            command: this,
            args: args.parsed_args,
            version_id: args.version_id
        });

        const sweeper = client.SweeperService.getSweeper(message.channel);

        sweeper.pushInterface(message, interact);

        const admins = client.PrivilegeService.admins;
        const beta = client.PrivilegeService.beta;

        const timeout = this.timeouts.get(message.author.id) || 0;

        if (Date.now() < timeout && !admins.test(message.member)) {
            return interact.message.react("⏰");
        }

        if (this.admin && !admins.test(message.member)) {
            return interact.reply("error", "Only bot administrators can use this command.");
        }

        if (this.beta && !beta.test(message.member) && !admins.test(message.member)) {
            return interact.reply("error", "Only beta users and servers can use this command.");
        }

        this.timeouts.set(message.author.id, Date.now() + this.delay);

        try {
            if (this._callback) {
                await this._callback.call(interact, message);
            }
        } catch (e) {
            const error_id = console.error(e);

            await interact.edit("error", "An internal error occured. Ask the bot administrator to check the logs for more details.\n`LOG_ID=" + error_id + "`");
        }

        return CommandInterface;
    }
}

/**
 * @typedef MessageMatcherInformation
 * @property {String} name The name of the message matcher.
 * @property {String} description The description of the message matcher.
 * @property {String} emoji The emoji of the message matcher.
 * @property {Array<MessageMatcherTestFunction|RegExp|String>} matches What to match in a message.
 * @property {MessageMatcherCallback} callback The callback function for when a message is matched.
 */

/**
 * @typedef JSONMessageMatcherObject
 * @property {String} name The name of the message matcher.
 * @property {String} description The description of the message matcher.
 * @property {String} emoji The emoji of the message matcher.
 */

/**
 * @callback MessageMatcherTestFunction
 * @param {discord.Message} message The message to test.
 * @returns {Promise<Boolean>}
 */

/**
 * @callback MessageMatcherCallback
 * @param {discord.Message} message The message to test.
 */

/**
 * Represents a message matcher in a bot module.
 */
export class MessageMatcher {
    /**
     * Instantiate a message matcher object.
     * @param {MessageMatcherInformation} info The information for the message matcher.
     */
    constructor(info) {
        /**
         * The callback function for when a message is matched.
         * @type {MessageMatcherCallback}
         * @private
         */
        this._callback = info.callback;

        /**
         * The time until the message matcher can be used again.
         * @type {Number}
         * @private
         */
        this._timeout = 0;

        /**
         * The name of the message matcher.
         * @type {String}
         */
        this.name = info.name;

        /**
         * The description of the message matcher.
         * @type {String}
         */
        this.description = info.description;

        /**
         * The emoji of the message matcher.
         * @type {String}
         */
        this.emoji = info.emoji;

        /**
         * What to match in the message.
         * @type {Array<RegExp|MessageMatcherTestFunction>}
         */
        this.matches = info.matches;
    }

    /**
     * Covert the complex object into a pure JSON object.
     * @returns {JSONMessageMatcherObject}
     */
    toJSON() {
        return {
            name: this.name,
            description: this.description,
            emoji: this.emoji
        }
    }

    /**
     * The matcher as in embeds.
     * @type {String}
     */
    get display() {
        return (this.emoji ? this.emoji + " " :  "") +
            this.name;
    }

    /**
     * Timeout the message matcher until it can be used again.
     * @param {Number} ms The miliseconds to timeout for.
     * @returns {Number}
     */
    timeout(ms) {
        this._timeout = Date.now() + ms;

        return this._timeout;
    }

    /**
     * Test a message for the message matcher.
     * @param {discord.Message} message The message to test.
     * @type {Promise<Boolean>}
     */
    async test(message) {
        if (Date.now() < this._timeout) {
            return false;
        }

        for (let i = 0; i < this.matches.length; i++) {
            if (typeof this.matches[i] === "function") {
                if (await this.matches[i](message)) {
                    return true;
                }
            } else if (this.matches[i] === RegExp(this.matches[i])) {
                if (this.matches[i].test(message.content)) {
                    return true;
                }
            } else if (typeof this.matches[i] === "string") {
                if (message.content === this.matches[i]) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Call the message matcher callback.
     * @param {discord.Message} message The message that was matched.
     */
    async callback(message) {
        if (this._callback) {
            const interact = new MessageMatcherInterface(message.client, {
                message,
                matcher: this
            });

            this._callback.call(interact, message);
        }
    }
}

/**
 * @typedef JSONCommandVersionObject
 * @property {Array<JSONCommandArgumentObject>} arguments An array of arguments for the command.
 */

/**
 * Represents a version of a command.
 */
export class CommandVersion {
    /**
     * Instantiate a command version object.
     * @param {Array<String>} triggers An array of triggers for the command.
     * @param {Array<CommandArgument>} args An array of possible arguments for the command.
     */
    constructor(triggers, args) {
        /**
         * An array of triggers for the command.
         * @type {Array<String>}
         */
        this.triggers = triggers;

        /**
         * An array of arguments for the command.
         * @type {Array<CommandArgument>}
         */
        this.arguments = args;
    }

    /**
     * Covert the complex object into a pure JSON object.
     * @returns {JSONCommandVersionObject}
     */
    toJSON() {
        return {
            triggers: this.triggers,
            arguments: this.arguments,
            usage: this.usage
        }
    }

    /**
     * Validate a command trigger.
     * @param {discord.Message} message The message that was sent.
     * @returns {String}
     */
    async validateCmd(message) {
        const guild_settings = await message.client.SettingsService.getSettings(message.guild.id);

        for (let i = 0; i < this.triggers.length; i++) {
            const prefix = guild_settings.settings.get("Prefix").value;
            const cmd_pref = prefix + this.triggers[i];

            if (message.content === cmd_pref) {
                return "";
            }

            if (message.content.startsWith(cmd_pref + " ")) {
                return message.content.substr(cmd_pref.length + 1);
            }
        }

        return null;
    }

    /**
     * Validate command call arguments against the arguments in the set.
     * @param {discord.Message} message The message that was sent.
     * @param {Array<String>} parts The arguments for the command call provided.
     * @returns {Promise<{ [key: string]: ParsedArgument }>}
     */
    async validate(message) {
        /**
         * @type { { [key: string]: ParsedArgument } } 
         */
        const parsed_args = {};

        for (let arg of this.arguments) {
            if (arg.default) {
                parsed_args[arg.name] = await arg.parse(message, arg.default);
            } else {
                parsed_args[arg.name] = null;
            }
        }

        const msg = await this.validateCmd(message);

        if (msg === null) {
            return false;
        }

        const parts = msg.split(" ").filter(_ => _);

        let arg_i = 0;
        let just_found = false;
        let found_start = 0;
        let i = 0;

        for (; arg_i < this.arguments.length && i < parts.length; i++) {
            const arg = this.arguments[arg_i];

            if (just_found) {
                const lookahead = this.arguments[arg_i + 1];

                if (lookahead && await lookahead.validate(message, parts[i])) {
                    just_found = false;
                    i--;
                    arg_i++;
                } else {
                    if (await arg.validate(message, parts.slice(found_start, i + 1).join(" "))) {
                        just_found = true;

                        if (arg.name) {
                            parsed_args[arg.name] = await arg.parse(message, parts.slice(found_start, i + 1).join(" "));
                        }
                    } else {
                        just_found = false;
                        i--;
                        arg_i++;
                    }
                }
            } else {
                if (await arg.validate(message, parts[i])) {
                    just_found = true;
                    found_start = i;

                    if (arg.name) {
                        parsed_args[arg.name] = await arg.parse(message, parts[i]);
                    }
                } else {
                    if (arg.optional) {
                        i--;
                        arg_i++;
                    } else {
                        return null;
                    }
                }
            }
        }

        if (i < parts.length) {
            return null;
        }

        if (this.arguments.length) {
            if (!i) {
                for (arg_i = 0; arg_i < this.arguments.length; arg_i++) {
                    if (!this.arguments[arg_i].optional) {
                        return null;
                    }
                }
            } else {
                while (++arg_i < this.arguments.length) {
                    if (!this.arguments[arg_i].optional) {
                        return null;
                    }
                }
            }
        }

        return parsed_args;
    }

    /**
     * Get a formatted version of the arguments.
     * @type {String}
     */
    get usage() {
        let usage = this.triggers[0];

        for (let i = 0; i < this.arguments.length; i++) {
            if (this.arguments[i].optional) {
                usage += " [" + this.arguments[i].name + "]";
            } else {
                if (this.arguments[i].syntax) {
                    usage += " " + this.arguments[i].name;
                } else {
                    usage += " <" + this.arguments[i].name + ">";
                }
            }
        }

        return usage;
    }
}

/**
 * @typedef CommandArgumentInformation
 * @property {String} name The name of the argument.
 * @property {String} description The description of the argument.
 * @property {String} emoji The emoji for the argument.
 * @property {Array<ArgumentType>} types An array of types that the argument should match.
 * @property {Boolean} optional Whether or not the argument is optional.
 * @property {Boolean} syntax Whether or not the argument is part of the syntax and should not be parsed.
 * @property {any} default The default value of the argument if not given.
 */

/**
 * @typedef JSONCommandArgumentObject
 * @property {String} name The name of the argument.
 * @property {String} description The description of the argument.
 * @property {String} emoji The emoji for the argument.
 * @property {Array<JSONArgumentTypeObject>} types An array of types that the argument should match.
 * @property {Boolean} optional Whether or not the argument is optional.
 * @property {Boolean} syntax Whether or not the argument is part of the syntax and should not be parsed.
 * @property {any} default The default value of the argument if not given.
 */

/**
 * @typedef ParsedArgument
 * @property {ArgumentType} type The type of argument that was parsed.
 * @property {any} value The value that was parsed.
 */

/**
 * Represents an argument for a command.
 */
export class CommandArgument {
    /**
     * Instantiate a command argument object.
     * @param {CommandArgumentInformation} info The information for the argument.
     */
    constructor(info) {
        /**
         * The name of the argument.
         * @type {String}
         */
        this.name = info.name;
        
        /**
         * The description of the argument.
         * @type {String}
         */
        this.description = info.description;

        /**
         * The emoji of the argument.
         * @type {String}
         */
        this.emoji = info.emoji;

        /**
         * An array of types that the argument should match.
         * @type {Array<ArgumentType>}
         */
        this.types = info.types || [ArgumentType.Any];

        /**
         * Whether or not the argument is optional.
         * @type {Boolean}
         */
        this.optional = info.optional;

        /**
         * Whether or not the argument is part of the syntax and should not be parsed.
         * @type {Boolean}
         */
        this.syntax = info.syntax;

        /**
         * The default value of the argument if not given.
         * @type {any}
         */
        this.default = info.default;

        if (this.default && typeof this.optional === "undefined") {
            this.optional = true;
        }
    }
    
    /**
     * Covert the complex object into a pure JSON object.
     * @returns {JSONCommandArgumentObject}
     */
    toJSON() {
        return this;
    }

    /**
     * Get a formatted display version of the argument.
     * @type {String}
     */
    get display() {
        return (this.emoji ? this.emoji + " " : "") +
            "**" + this.name + "** (" +
            [...(this.optional ? ["Optional"] : []),
                ...this.types.map(type => type.name)
            ].join(", ") + ")";
    }
    
    /**
     * Parse an argument in a command call.
     * @param {discord.Message} message The message that was sent.
     * @param {String} text The text to parse.
     * @returns {Promise<ParsedArgument>}
     */
    async parse(message, text) {
        for (let i = 0; i < this.types.length; i++) {
            if (await this.types[i].validate(message, text)) {
                return {
                    type: this.types[i],
                    value: await this.types[i].parse(message, text)
                }
            }
        }

        return {
            type: ArgumentType.Text,
            value: text
        }
    }

    /**
     * Validate an argument in a command call.
     * @param {discord.Message} message The message that was sent.
     * @param {String} text The text to validate.
     * @returns {Promise<Boolean>}
     */
    async validate(message, text) {
        if (this.syntax) {
            return this.name === text;
        } else {
            for (let i = 0; i < this.types.length; i++) {
                if (await this.types[i].validate(message, text)) {
                    return true;
                }
            }
        }

        return false;
    }
}

/**
 * Represents a syntax argument for a command.
 */
export class CommandSyntax extends CommandArgument {
    /**
     * Instantiate a command syntax object.
     * @param {String} name The exact syntax to match.
     * @param {Boolean} optional Whether or not the syntax is optional.
     */
    constructor(name, optional) {
        super({
            name,
            optional,
            syntax: true
        });
    }
}

/**
 * @typedef ArgumentType
 * @param {String} name The name of the type.
 * @param {String} description The description of the type.
 * @param {Array<String>} examples Examples of inputs.
 * @param {ArgumentTypeValidate|RegExp|String} validate The arguments to match;
*  @param {ArgumentTypeParse} [parse] How to parse the argument type.
 */

/**
 * @callback ArgumentTypeValidate
 * @param {discord.Message} message The message that was sent.
 * @param {String} text The argument to validate.
 */

/**
 * @callback ArgumentTypeParse
 * @param {discord.Message} message The message that was sent.
 * @param {String} text The argument to parse.
 */

/**
 * @typedef JSONArgumentTypeObject
 * @property {String} name The name of the type.
 * @property {any} example An example of an input for the type.
 */

/**
 * Represents a type of argument.
 */
export class ArgumentType {
    static Rest = new ArgumentType({
        name: "Rest",
        description: "The rest of the message.",
        examples: [],
        validate: /^(\s|\S)+$/
    });

    /**
     * Any characters except newlines.
     * @type {ArgumentType}
     */
    static Text = new ArgumentType({
        name: "Text",
        description: "Any characters except newlines.",
        examples: [],
        validate: /^.+$/
    });

    /**
     * Any characters except whitespace.
     * @type {ArgumentType}
     */
    static Any = new ArgumentType({
        name: "Any",
        description: "Any characters except whitespace.",
        examples: [],
        validate: /^\S+$/
    });

    /**
     * A fully alphabetic word.
     * @type {ArgumentType}
     */
    static Word = new ArgumentType({
        name: "Word",
        description: "A fully alphabetic word.",
        examples: ["zooweemama"],
        validate: /^[a-zA-Z]+$/
    });

    /**
     * A character.
     * @type {ArgumentType}
     */
    static Char = new ArgumentType({
        name: "Char",
        description: "A character.",
        examples: ["h"],
        validate: /^.$/
    });

    /**
     * A mention of a member on a server.
     * @type {ArgumentType}
     */
    static Mention = new ArgumentType({
        name: "Mention",
        description: "A mention of a member on a server.",
        examples: ["@jesus#1111"],
        validate: async function (message, text) {
            const matches = /^<@!?\d{17,19}>$/.test(text);
            const id = (text.match(/\d{17,19}/) || [])[0];

            return matches && message.mentions.members.get(id);
        },
        parse: async function (message, text) {
            const id = text.match(/\d{17,19}/)[0];

            return message.mentions.members.get(id);
        }
    });

    /**
     * A mention of a channel on a server.
     * @type {ArgumentType}
     */
    static Channel = new ArgumentType({
        name: "Channel",
        description: "A mention of a channel on a server.",
        examples: ["#lounge"],
        validate: async function (message, text) {
            const matches = /^<#\d{17,19}>$/.test(text);
            const id = (text.match(/\d{17,19}/) || [])[0];

            return matches && message.mentions.channels.get(id);
        },
        parse: async function (message, text) {
            const id = text.match(/\d{17,19}/)[0];

            return message.mentions.channels.get(id);
        }
    });

    /**
     * An integer.
     * @type {ArgumentType}
     */
    static Integer = new ArgumentType({
        name: "Integer",
        description: "A whole number.",
        examples: ["50"],
        validate: /^\d+$/,
        parse: async function (message, text) {
            return parseInt(text);
        }
    });
    
    /**
     * An image url.
     * @type {ArgumentType}
     */
    static ImageURL = new ArgumentType({
        name: "Image URL",
        description: "An image url.",
        examples: ["i.imgur.com"],
        validate: /^https?:\/\/.*\.(?:png|jpg)$/i
    });

    /**
     * A boolean.
     * @type {ArgumentType}
     */
    static Boolean = new ArgumentType({
        name: "Boolean",
        description: "A true or false value.",
        examples: ["true"],
        validate: /^(true|false)$/i,
        parse: async function (message, text) {
            if (text.toLowerCase() === "true") {
                return true;
            } else if (text.toLowerCase() === "false") {
                return false;
            }

            return null;
        }
    });

    /**
     * A snowflake.
     * @type {ArgumentType}
     */
    static Snowflake = new ArgumentType({
        name: "Snowflake",
        description: "An ID on discord.",
        examples: "165358687974719488",
        validate: /^\d{17,19}$/
    });

    /**
     * A fixed percentage from 0-100.
     * @type {ArgumentType}
     */
    static PercentageFixed = new ArgumentType({
        name: "0-100 Percentage",
        description: "An ID on discord. https://discord.com/developers/docs/reference#snowflakes",
        examples: ["25%"],
        validate: /^((100)|([0-9]?[0-9]%))$/,
        parse: async function (message, text) {
            const n = parseInt(text.match(/\d+/)[0]);

            return n / 100;
        }
    });

    /**
     * A percentage.
     * @type {ArgumentType}
     */
    static Percentage = new ArgumentType({
        name: "Percentage",
        description: "A percentage of a total.",
        examples: ["75%"],
        validate: /^-?\d+\%$/,
        parse: async function (message, text) {
            const n = parseInt(text.match(/-?\d+/)[0]);

            return n / 100;
        }
    });

    /**
     * A standard discord API image format.
     * @type {ArgumentType}
     */
    static ImageFormat = new ArgumentType({
        name: "Image Format",
        description: "A discord-supported image format (webp, jpeg, png and gif).",
        examples: ["jpeg"],
        validate: /^(webp)|((jpe?)|(pn)g)|(gif)$/i
    });

    /**
     * A domain on the internet.
     * @type {ArgumentType}
     */
    static Domain = new ArgumentType({
        name: "Domain",
        description: "A domain name.",
        examples: ["google.com"],
        validate: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/
    });


    /**
     * An IP address.
     * @type {ArgumentType}
     */
    static IPAddress = new ArgumentType({
        name: "IP",
        description: "An IPv4 or IPv6 IP address.",
        examples: ["127.0.0.1"],
        validate: /^((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/
    });

    /**
     * A negative or positive number.
     * @type {ArgumentType}
     */
    static SignedInteger = new ArgumentType({
        name: "Integer",
        description: "A whole number.",
        examples: ["95"], 
        validate: /^-?\d+$/,
        parse: async function (message, text) {
            return parseInt(text);
        }
    });

    /**
     * A version 4 universal unique identifier.
     * @type {ArgumentType}
     */
    static UUIDv4 = new ArgumentType({
        name: "UUIDv4",
        description: "A version 4 universal unique identifier.",
        examples: ["82509529-9c19-4428-a7aa-ee557f550eff"],
        validate: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    });

    /**
     * The platform of a player.
     * @type {ArgumentType}
     */
    static Platform = new ArgumentType({
        name: "Platform",
        description: "The platform of a player.",
        examples: ["pc", "xbox", "psn"],
        validate: /^((uplay)|(p(c|(sn?)))|xbl|(ox))$/
    });

    /**
     * Instantiate an ArgumentType object.
     * @param {ArgumentType} type The information for the type.
     */
    constructor(type) {
        /**
         * The name of the type.
         * @type {String}
         */
        this.name = type.name;

        /**
         * The description of the type.
         * @type {String}
         */
        this.description = type.description;

        /**
         * An example input for the type.
         * @type {Array<String>}
         */
        this.examples = type.examples;

        /**
         * The arguments to match.
         * @type {ArgumentTypeValidate|RegExp|String}
         */
        this._validate = type.validate;

        /**
         * How to parse the argument.
         * @type {ArgumentTypeParse}
         */
        this._parse = type.parse;
    }
    
    /**
     * Covert the complex object into a pure JSON object.
     * @returns {JSONArgumentTypeObject}
     */
    toJSON() {
        return {
            name: this.name,
            description: this.description,
            examples: this.examples,
            validate: this._validate === RegExp(this._validate) ? this._validate.toString() : ""
        }
    }

    /**
     * Validate an argument in a command call.
     * @param {discord.Message} message The message that was sent.
     * @param {String} text The argument to validate.
     * @returns {Promise<Boolean>}
     */
    async validate(message, text) {
        if (typeof this._validate === "function") {
            return !!(await this._validate(message, text));
        } else if (this._validate === RegExp(this._validate)) {
            return this._validate.test(text);
        } else if (typeof this._validate === "string") {
            return this._validate === text;
        }

        return false;
    }

    /**
     * Parse an argument in a command call.
     * @param {discord.Message} message The message that was sent.
     * @param {String} text The argument to validate.
     * @returns {Promise<any>}
     */
    async parse(message, text) {
        if (this._parse) {
            return await this._parse(message, text);
        } else {
            return text;
        }
    }
}

/**
 * Represents a service for loading and interacting with bot modules.
 * @extends {Service}
 */
export class ModuleService extends Service {
    /**
     * Instantiate the module service.
     * @param {SwagClan} client The bot client that instantiated this service
     * @param {String} path The path of the modules.
     */
    constructor(client, path) {
        super(client);

        /**
         * The loaded modules.
         * @type {discord.Collection<String,BotModule>}
         */
        this.modules = new discord.Collection;

        /**
         * The path of the modules.
         * @type {String}
         */
        this.path = path;
    }

    /**
     * Get a module by it's name.
     * @param {String} name The name of the module to get.
     * @returns {BotModule}
     */
    get(name) {
        return this.modules.get(name);
    }

    /**
     * Load a module to the module service.
     * @param {String} name The filename of the module to load.
     * @returns {BotModule} The module that was loaded.
     */
    async load(name) {
        const filename = path.resolve(this.path, name, "mod.js");

        if (this.get(name)) {
            throw "Module already loaded";
        }

        const refresh_id = Math.random().toString(36).substr(2);

        /** @type { { default: BotModule } } */
        const { default: loaded_module } = await import("file:///" + filename + "?" + refresh_id);

        loaded_module.loaded_at = Date.now();
        loaded_module.refresh_id = refresh_id;

        this.modules.set(loaded_module.name.toLowerCase(), loaded_module);

        return loaded_module;
    }

    /**
     * Load all modules from a directory
     * @returns {discord.Collection<String,BotModule>} The modules that were loaded.
     */
    async loadFromDirectory() {
        const files = await fs.readdir(this.path);

        /** @type {discord.Collection<String,BotModule>} */
        const loaded = new discord.Collection;

        for (let i = 0; i < files.length; i++) {
            try {
                const module = await this.load(files[i]);

                loaded.set(module.name.toLowerCase(), module);
            } catch (e) {
                console.error(e);
            }
        }

        return loaded;
    }


    /**
     * Reload a module.
     * @param {BotModuleResolvable} module_resolvable The module to reload.
     * @returns {BotModule} The module that was unloaded.
     */
    async reload(module_resolvable) {
        const module_name = typeof module_resolvable === "string" ? module_resolvable : module_resolvable.name;

        if (!this.get(module_name.toLowerCase())) {
            throw "Module not loaded";
        }

        await this.unload(module_name.toLowerCase());

        return await this.load(module_name.toLowerCase())
    }

    /**
     * Unload a module from the module service.
     * @param {BotModuleResolvable} module_resolvable The module to unload.
     * @returns {BotModule}
     */
    async unload(module_resolvable) {
        const module_name = typeof module_resolvable === "string" ? module_resolvable : module_resolvable.name;
        const module = this.get(module_name.toLowerCase());

        if (!module) {
            throw "Module not loaded";
        }

        if (module.shutdown) {
            await module.shutdown("MODULE_UNLOAD");
        }

        this.modules.delete(module_name.toLowerCase());

        return module;
    }
}