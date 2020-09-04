// Imports
import discord from "discord.js"
import path from "path"

import { promises as fs } from "fs"

import { Service } from "./Service.js"
import { SwagClan } from "../class/SwagClan.js"

/**
 * @callback SettingTypeValidate
 * @param {String} value The value to match.
 * @returns {Promise<Boolean>}
 */

/**
 * @callback SettingTypeParse
 * @param {String} value The value to parse.
 * @returns {Promise<any>}
 */

/**
 * @callback SettingTypeDisplay
 * @param {String} value The value to display.
 * @returns {Promise<String>}
 */

/**
 * Represents a type for the settings.
 */
export class SettingType {
    /**
     * A type to match prefixes.
     * @type {SettingType}
     */
    static Prefix = new SettingType("Prefix", /^\S+$/, prefix => "`" + prefix + "`");

    /**
     * A type to match booleans.
     * @type {SettingType}
     */
    static Boolean = new SettingType("Boolean", /^(on)|(off)|(true)|(false)$/, boolean => boolean ? "on" : "off", (guild, bool) => {
        if (bool === "true" || bool == "on") {
            return true;
        }

        return false;
    });

    /**
     * A type to match channels.
     * @type {SettingType}
     */
    static Channel = new SettingType("Channel", (guild, value) => {
        if (/^none$/i.test(value)) {
            return true;
        }

        if (/^(\d{17,19})|(<#\d{17,19}>)$/.test(value)) {
            return !!guild.channels.resolve(value.match(/\d{17,19}/g)[0])
        }

        return false;
    }, channelid => {
        return channelid === null ? "None" : "<#" + channelid + ">";
    }, (guild, channel) => {
        if (channel.toLowerCase() === "none") {
            return null;
        }
        
        return channel.match(/\d{17,19}/g)[0];
    });

    /**
     * 
     * @param {String} name The name of the type.
     * @param {SettingTypeValidate|RegExp|String} validate What values to match for the type.
     * @param {SettingTypeDisplay} [display] How to display the value.
     * @param {SettingTypeParse} [parse] How to parse the matched value.
     */
    constructor(name, validate, display, parse) {
        /**
         * The name of the type.
         * @type {String}
         */
        this.name = name;

        /**
         * How to validate the type.
         * @type {SettingTypeValidate|RegExp|String}
         */
        this._validate = validate;

        /**
         * How to display the value.
         * @type {SettingTypeDisplay}
         * @private
         */
        this._display = display;

        /**
         * How to parse the matched value.
         * @type {SettingTypeParse}
         * @private
         */
        this._parse = parse;
    }

    /**
     * Convert the complex object to a pure JSON object.
     * @returns {String}
     */
    toJSON() {
        return this.name;
    }

    /**
     * How to display the value.
     * @param {any} value The value to display.
     * @returns {String}
     */
    display(value) {
        if (this._display) {
            return this._display(value);
        }
        
        return value;
    }

    /**
     * Validate a value for the type.
     * @param {discord.Guild} guild The guild to validate the setting for.
     * @param {String} value The value to validate.
     * @returns {Promise<Boolean>}
     */
    async validate(guild, value) {
        if (typeof this._validate === "function") {
            return await this._validate(guild, value);
        } else if (this._validate === RegExp(this._validate)) {
            return this._validate.test(value);
        } else if (typeof this._validate === "string") {
            return value === this._validate;
        }

        return true;
    }

    /**
     * Parse a value for the type.
     * @param {discord.Guild} guild The guild to validate the setting for.
     * @param {String} value The value to parse.
     * @returns {any}
     */
    async parse(guild, value) {
        if (this._parse) {
            return this._parse(guild, value);
        }

        return value;
    }
}

/**
 * @typedef SettingDefinitionInfo
 * @property {String} name The name of the setting.
 * @property {String} description The description of the setting.
 * @property {String} emoji The emoji of the setting.
 * @property {SettingType} type The type of the setting.
 * @property {Number} permissions The permissions required to change the setting.
 * @property {any} default The default value of the setting.
 */

/**
 * @typedef JSONSettingDefinitionObject
 * @property {String} name The name of the setting.
 * @property {String} description The description of the setting.
 * @property {String} emoji The emoji of the setting.
 * @property {String} type The type of the setting.
 * @property {Number} permissions The permissions required to change the setting.
 * @property {any} default The default value of the setting.
 */

/**
 * Represents a definition for a setting.
 */
export class SettingDefinition {
    /**
     * Instantiate a settings definition object.
     * @param {SettingDefinitionInfo} info The information for the definition.
     */
    constructor(info) {
        /**
         * The name of the setting.
         * @type {String}
         */
        this.name = info.name;

        /**
         * The description of the setting.
         * @type {String}
         */
        this.description = info.description;

        /**
         * The moeji of the setting.
         * @type {String}
         */
        this.emoji = info.emoji;

        /**
         * The type of the setting.
         * @type {SettingType}
         */
        this.type = info.type;

        /**
         * The permissions required to change the setting.
         * @type {discord.Permissions}
         */
        this.permissions = new discord.Permissions(info.permissions);

        /**
         * The default value of the setting.
         * @type {any}
         */
        this.default = info.default;
    }
    
    /**
     * Convert the complex object to a pure JSON object.
     * @returns {JSONSettingDefinitionObject}
     */
    toJSON() {
        return this;
    }

    /**
     * The name as shown in embed.
     * @type {String}
     */
    get display() {
        return (this.emoji ? this.emoji + " " : "") +
            this.name +
            " (" + this.type.name + ")";
    }

    /**
     * How to display the value.
     * @param {any} value The value to display.
     * @returns {String}
     */
    format(value) {
        return this.type.display(value);
    }

    /**
     * Validate an input and get the parsed value.
     * @param {discord.Guild} guild The guild to parse the value for.
     * @param {any} value The value to validate and parse.
     * @returns {any}
     */
    async validate(guild, value) {
        return this.type.validate(guild, value)
    }

    /**
     * Parse an input.
     * @param {discord.Guild} guild The guild to parse the value for.
     * @param {String} value The value to validate and parse.
     * @returns {any}
     */
    async parse(guild, value) {
        if (await this.type.validate(guild, value)) {
            return await this.type.parse(guild, value);
        }

        return null;
    }
}

/**
 * @typedef JSONSettingChange
 * @property {Number} timestamp When the change was committed.
 * @property {String} setting The setting that was changed.
 * @property {any} before The value before the setting was changed.
 * @property {any} after The value after the setting was changed.
 */

/**
 * @typedef JSONGuildSettings
 * @property { { [key: string]: any } } settings The settings for the guild.
 * @property {Array<JSONSettingChange>} history The setting change histories.
 */

/**
 * Represents a history to show a setting change.
 */
class GuildSettingChange {
    /**
     * Instantiate a setting change history object.
     * @param {GuildSettings} guild_settings All the settings in the guild.
     * @param {JSONSettingChange} change The setting change.
     */
    constructor(guild_settings, change) {
        /**
         * All the settings in the guild.
         * @type {GuildSettings}
         */
        this.guild_settings = guild_settings;

        /**
         * When the change was committed.
         * @type {Number}
         */
        this.timestamp = change.timestamp;

        /**
         * The setting that was changed.
         * @type {GuildSetting}
         */
        this.setting = guild_settings.settings.get(change.setting);

        /**
         * The value before the setting was changed.
         * @type {GuildSetting}
         */
        this.before = new GuildSetting(this.guild_settings, this.setting.definition, change.before);

        /**
         * The value after the setting was changed.
         * @type {GuildSetting}
         */
        this.after = new GuildSetting(this.guild_settings, this.setting.definition, change.after);
    }

    /**
     * Convert the complex object to a pure JSON object.
     * @returns {JSONSettingChange}
     */
    toJSON() {
        return {
            timestamp: this.timestamp,
            setting: this.setting.name,
            before: this.before.value,
            after: this.after.value
        }
    }

    /**
     * The change as shown in embeds.
     * @type {String}
     */
    get display() {
        const date = new Date(this.timestamp).toISOString().split(".")[0].replace("T", " ");

        return this.before.format + " -> " + this.after.format + " (" + date + ")";
    }
}

/**
 * Represents history for guild setting changes.
 */
class GuildSettingsHistory {
    /**
     * Instantiate a guild settings history object.
     * @param {GuildSettings} guild_settings All the guild settings.
     * @param {Array<JSONSettingChange>} history The setting change history.
     */
    constructor(guild_settings, history) {
        /**
         * All the guild settings.
         * @type {GuildSettings}
         */
        this.guild_settings = guild_settings;

        /**
         * The setting change history.
         * @type {Array<GuildSettingChange>}
         */
        this.history = history.map(change => new GuildSettingChange(guild_settings, change));
    }

    /**
     * Convert the complex object to a pure JSON object.
     * @returns {Array<JSONSettingChange>}
     */
    toJSON() {
        return this.history;
    }

    /**
     * Mark a setting change.
     * @param {String} setting The setting that was changed.
     * @param {any} before The value before the setting was changed.
     * @param {any} after The value after the setting was changed.
     * @returns {GuildSettingChange}
     */
    mark(setting, before, after) {
        const change = new GuildSettingChange(this.guild_settings, {
            timestamp: Date.now(),
            setting: setting,
            before: before,
            after: after
        });

        if (before !== after) this.history.push(change);

        return change;
    }

    /**
     * Get history for a specific setting.
     * @param {String} setting The setting to get history for.
     * @returns {Array<GuildSettingChange>}
     */
    getHistory(setting) {
        return this.history.filter(change => {
            return change.setting.name === setting;
        }).sort((a, b) => a.timestamp - b.timestamp);
    }
}

/**
 * Represents a modifiable setting value for a guild.
 */
class GuildSetting {
    /**
     * Instantiate a guild setting.
     * @param {GuildSettings} guild_settings All the settings for the guild.
     * @param {SettingDefinition} definition The setting definition.
     * @param {any} value The value of the setting.
     */
    constructor(guild_settings, definition, value) {
        /**
         * All the settings for the guild.
         * @type {GuildSettings}
         */
        this.guild_settings = guild_settings;

        /**
         * The name of the setting.
         * @type {String}
         */
        this.name = definition.name;

        /**
         * The setting definition.
         * @type {SettingDefinition}
         */
        this.definition = definition;

        /**
         * The value of the setting.
         * @type {any}
         */
        this.value = value;
    }

    /**
     * The value as displayed in embeds.
     */
    get format() {
        return this.definition.format(this.value);
    }

    /**
     * Get an array of changes made to the setting.
     * @type {Array<GuildSettingChange>}
     */
    get history() {
        return this.guild_settings.history.getHistory(this.definition.name);
    }

    /**
     * Convert the complex object to a pure JSON object.
     * @returns {any}
     */
    toJSON() {
        return this.value;
    }

    /**
     * Change the value of the setting.
     * @param {any} value The value to set the setting to.
     * @returns {Promise<GuildSettingChange|Boolean>}
     */
    async set(value) {
        const guild = this.guild_settings.service.client.guilds.resolve(this.guild_settings.id);

        if (guild) {
            if (await this.definition.validate(guild, value)) {
                const before = this.value;

                this.value = await this.definition.parse(guild, value);

                return this.guild_settings.history.mark(this.definition.name, before, this.value);
            }
        }

        return false;
    }
}

/**
 * Represents chat settings for a guild.
 */
export class GuildSettings {
    /**
     * Instantiate a guild settings object.
     * @param {SettingsService} service The settings service that the guild settings is loaded into.
     * @param {String} id The ID of the guild.
     * @param {JSONGuildSettings} [json] The settings to copy.
     */
    constructor(service, id, json = {}) {
        /**
         * The settings service that the guild settings is loaded into.
         * @type {SettingsService}
         */
        this.service = service;

        /**
         * The ID of the guild.
         * @type {String}
         */
        this.id = id;

        /**
         * The settings for the guild.
         * @type {discord.Collection<String,GuildSetting>}
         */
        this.settings = new discord.Collection(Object.entries(this.removeUnused(json.settings)).map(([key, value]) => {
            return [key, new GuildSetting(this, this.service.definitions[key], value)]
        }));

        /**
         * The settings change history for the guild.
         * @type {GuildSettingsHistory}
         */
        this.history = new GuildSettingsHistory(this, json.history);

        /**
         * Whether or not to prevent saving to a file.
         * @type {Boolean}
         */
        this.prevent_save = false;
    }

    /**
     * Convert the complex object to a pure JSON object.
     * @returns {JSONGuildSettings}
     */
    toJSON() {
        return {
            settings: Object.fromEntries(this.settings.entries()),
            history: this.history
        }
    }

    /**
     * Remove all settings that haven't been defined.
     * @param { { [key: string]: any } } settings The original guild settings.
     * @returns { { [key: string]: any } }
     */
    removeUnused(settings) {
        const entries = Object.entries(this.service.definitions).map(([key, value]) => {
            return [
                key,
                settings[key] || value.default
            ]
        });

        return Object.fromEntries(entries);
    }

    async save() {
        if (this.prevent_save) return;

        await fs.writeFile(path.resolve(this.service.path, this.id + ".json"), JSON.stringify(this));
    }
}

/**
 * Represents a service for interacting with guild settings.
 * @extends {Service}
 */
export class SettingsService extends Service {
    /**
     * Instantiate the settings service.
     * @param {SwagClan} client The bot client that instantiated this service
     * @param { { [key: string]: SettingDefinition } } definitions The definitions for the settings.
     * @param {String} path Directory of where guild settings are stored.
     */
    constructor(client, definitions, path) {
        super(client);

        /**
         * The guild settings by the guild ID.
         * @type {discord.Collection<String,GuildSettings>}
         */
        this.guilds = new discord.Collection;
        
        /**
         * The definitions for the settings.
         * @type { { [key: string]: SettingDefinition } }
         */
        this.definitions = definitions;

        /**
         * Directory of where guild settings are stored.
         * @type {String}
         */
        this.path = path;
    }

    /**
     * Get a guild's settings by it's ID.
     * @param {discord.GuildResolvable} guild_resolvable The guild to get the settings for.
     * @returns {GuildSettings}
     */
    async getSettings(guild_resolvable) {
        const guild = this.client.guilds.resolve(guild_resolvable);

        if (guild && this.guilds.get(guild.id)) {
            return this.guilds.get(guild.id);
        } else {
            try {
                await this.loadSettings(guild.id);
            } catch (e) {
                if (e.code === "ENOENT") {
                    const settings = await this.createSettings(guild_resolvable);
                    
                    await settings.save();

                    this.guilds.set(guild.id, settings);
                }
            }
            
            return await this.getSettings(guild_resolvable);
        }
    }

    /**
     * Save all settings.
     */
    async saveAll() {
        for (let entry of this.guilds) {
            const guild = entry[1];

            await guild.save();
        }
    }

    /**
     * Load settings for a guild.
     * @param {String} id The ID of the settings to load.
     * @returns {GuildSettings}
     */
    async loadSettings(id) {
        try {
            const data = await fs.readFile(path.resolve(this.path, id + ".json"));
            const json = JSON.parse(data.toString());

            const settings = new GuildSettings(this, id, json);

            this.guilds.set(id, settings);
            
            this.emit("load", settings);
            
            return settings;
        } catch (e) {
            if (e.code === "ENOENT") {
                throw e;
            }

            const settings = this.createSettings(id);

            settings.prevent_save = true;
            
            this.emit("error", id, e);

            return settings;
        }
    }

    /**
     * Load all settings from a directory.
     * @returns {discord.Collection<String,GuildSettings>} The settings that were loaded.
     */
    async loadFromDirectory() {
        const files = await fs.readdir(this.path);

        /** @type {discord.Collection<String,GuildSettings>} */
        const loaded = new discord.Collection;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const guild_id = file.split(".")[0]; // <snowflake>.json

            const settings = await this.loadSettings(guild_id);

            loaded.set(guild_id, settings);
        }

        return loaded;
    }

    /**
     * Create settings for a guild.
     * @param {discord.GuildResolvable} guild_resolvable The guild to create the settings for.
     * @returns {GuildSettings}
     */
    createSettings(guild_resolvable) {
        const guild = this.client.guilds.resolve(guild_resolvable);

        const settings = new GuildSettings(this, guild.id, {
            settings: Object.fromEntries(Object.entries(this.definitions).map(entry => {
                return [entry[0], entry[1].default];
            })),
            history: []
        });

        this.guilds.set(guild.id, settings);

        return settings;
    }
}