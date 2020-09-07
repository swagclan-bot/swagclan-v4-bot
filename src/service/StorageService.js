// Imports
import discord from "discord.js"
import path from "path"
import EventEmitter from "events"

import { promises as fs } from "fs"

import { Service } from "./Service.js"
import { SwagClan } from "../class/SwagClan.js"

/**
 * @typedef JSONCollectionItem
 * @property {String} name The name of the item.
 * @property {String} value The value of the item.
 * @property {Number} created When the item was first created.
 * @property {Number} [modified] When the item was last modified.
 */

/**
 * @typedef JSONStorageCollection
 * @property {String} name The name of the collection.
 * @property { { [key: string]: JSONCollectionItem } } items The items in the collection.
 */

/**
 * @typedef JSONGuildStorage
 * @property { { [key: string]: JSONStorageCollection } } collections The collections in storage.
 */

/**
 * Calculate the size of a JSON object in bytes.
 * @param {any} obj The object to calculate the size of.
 * @returns {Number}
 */
function obj_size(obj) {
    const str = JSON.stringify(obj);

    return Buffer.byteLength(str) - 2;
}

/**
 * Represents an item of a collection for a guild storage.
 */
class CollectionItem {
    /**
     * Instantiate a collection item object.
     * @param {StorageCollection} collection The collection that the collection item belongs to.
     * @param {JSONCollectionItem} raw The raw object to construct the collection item.
     */
    constructor(collection, raw) {
        /**
         * The collection that the collection item belongs to.
         * @param {StorageCollection}
         */
        this.collection = collection;

        /**
         * The name of the item.
         * @type {String}
         */
        this.name = raw.name;

        /**
         * The value of the item.
         * @type {String}
         */
        this.value = raw.value;

        /**
         * When the item was first created.
         * @type {Number}
         */
        this.created = raw.created;

        /**
         * When the item was last modified.
         * @type {Number}
         */
        this.modified = raw.modified || raw.created;
    }


    /**
     * Convert the complex object to a pure JSON object.
     * @returns {JSONCollectionItem}
     */
    toJSON() {
        return {
            name: this.name,
            value: this.value,
            created: this.created,
            modified: this.modified
        }
    }

    /**
     * Get the size of the item in bytes.
     * @type {Number}
     */
    get size() {
        return obj_size(this);
    }

    /**
     * Set the value of the item.
     * @param {String} val The value to set the item to.
     */
    set(val) {
        this.collection.set(this.name, val);
    }

    /**
     * Delete the item from the collection.
     */
    delete() {
        this.collection.deleteItem(this.name);
    }
}

/**
 * Represents a collection of items for a guild storage.
 * @extends {EventEmitter}
 */
class StorageCollection extends EventEmitter {
    /**
     * Instantiate a storage collection object.
     * @param {GuildStorage} storage The guild storage that the collection belongs to.
     * @param {JSONStorageCollection} raw The items in the collection.
     */
    constructor(storage, raw) {
        super();

        /**
         * The guild storage that the collection belongs to.
         * @type {GuildStorage}
         */
        this.storage = storage;

        /**
         * @type {String}
         */
        this.name = raw.name;

        /**
         * The items in the collection.
         * @type {discord.Collection<String,CollectionItem>}
         */
        this.items = new discord.Collection(Object.entries(raw.items).map(([name, item]) => [name, new CollectionItem(this, item)]));
    }

    /**
     * Convert the complex object to a pure JSON object.
     */
    toJSON() {
        return {
            items: Object.fromEntries(this.items.entries()),
            name: this.name
        }
    }

    /**
     * Get the size of the collection in bytes.
     * @type {Number}
     */
    get size() {
        return obj_size(this);
    }

    /**
     * Update an item of the collection.
     * @param {String} key The key of the item to set.
     * @param {String} val The value of the item to set.
     * @returns {CollectionItem}
     */
    set(key, val) {
        const item = this.items.get(key);

        if (item) {
            const new_value = new CollectionItem(this, {
                name: key,
                value: val,
                created: item.created,
                modified: Date.now()
            });

            const byte_diff = obj_size({ [key]: new_value }) - obj_size({ [key]: item.value });

            if (this.storage.size + byte_diff > this.storage.max) {
                throw new Error("Max length of storage reached.");
            }

            const old_value = new CollectionItem(this, {
                name: key,
                value: item.value,
                created: item.created,
                modified: item.modified
            });

            this.items.set(key, new_value);

            this.storage.emit("itemUpdate", this.name, key, old_value, new_value);
        } else {
            const new_item = new CollectionItem(this, {
                name: key,
                value: val,
                created: Date.now(),
                modified: Date.now()
            });

            const byte_diff = obj_size({ [key]: new_item }) + (!!this.items.size);
            
            if (this.storage.size + byte_diff > this.storage.max) {
                throw new Error("Max length of storage reached.");
            }
            
            this.items.set(key, new_item);

            this.storage.emit("itemCreate", this.name, key, new_item);
        }

        return this.items.get(key);
    }

    /**
     * Delete an item from the collection.
     * @param {String} key The key of the item to set.
     */
    deleteItem(key) {
        if (this.items.delete(key)) {
            this.storage.emit("itemDelete", this.name, key);
        }
    }

    /**
     * Clear the collection's items.
     */
    clear() {
        this.items.clear();

        this.storage.emit("collectionClear", this.name);
    }

    /**
     * Delete the storage collection.
     */
    delete() {
        this.storage.deleteCollection(this.name);
    }
}

/**
 * Represents chat settings for a guild.
 * @extends {EventEmitter}
 */
class GuildStorage extends EventEmitter {
    /**
     * Instantiate a guild storage object.
     * @param {SettingsService} service The storage service that the guild settings is loaded into.
     * @param {String} id The ID of the guild.
     * @param {JSONGuildStorage} raw The raw json object to construct the guild storage from.
     */
    constructor(service, id, raw) {
        super();

        /**
         * The storage service that the guild settings is loaded into.
         * @type {StorageService}
         */
        this.service = service;
        
        /**
         * The ID of the guild.
         * @type {String}
         */
        this.id = id;

        /**
         * The storage collections.
         * @type {discord.Collection<String,StorageCollection>}
         */
        this.collections = new discord.Collection(Object.entries(raw.collections).map(entry => {
            return [entry[0], new StorageCollection(this, entry[1])];
        }));

        /**
         * The max amount of bytes allowed to be stored.
         * @type {Number}
         */
        this.max = 65536; // 64kb
    }

    /**
     * Convert the complex object to a pure JSON object.
     */
    toJSON() {
        return {
            collections: Object.fromEntries(this.collections.entries())
        }
    }

    /**
     * Get the size of the storage in bytes.
     * @type {Number}
     */
    get size() {
        return obj_size(this);
    }

    /**
     * Create a storage collection.
     * @param {String} name The name of the collection to create.
     * @returns {StorageCollection|false}
     */
    createCollection(name) {
        if (!this.collections.get(name)) {
            this.collections.set(name, new StorageCollection(this, {
                name,
                items: {}
            }));

            this.emit("collectionCreate", name, this.collections.get(name));

            return this.collections.get(name);
        } else {
            return false;
        }
    }

    /**
     * Delete a storage collection.
     * @param {String} name The name of the collection to delete.
     */
    deleteCollection(name) {
        const collection = this.collections.get(name);

        if (this.collections.delete(name)) {
            this.emit("collectionDelete", name);
        }
    }

    /**
     * Clear all of the storage.
     */
    clear() {
        this.collections.clear();

        this.emit("clear");
    }

    async save() {
        if (this.prevent_save) return;

        await fs.writeFile(path.resolve(this.service.path, this.id + ".json"), JSON.stringify(this));
    }
}

/**
 * Represents a service for interacting with guild storage.
 * @extends {Service}
 */
export class StorageService extends Service {
    /**
     * Instantiate the storage service.
     * @param {SwagClan} client The bot client that instantiated this service
     * @param {String} path Directory of where guild storages are stored.
     */
    constructor(client, path) {
        super(client);

        /**
         * The guild storages by the guild ID.
         * @type {discord.Collection<String,GuildStorage>}
         */
        this.guilds = new discord.Collection;

        /**
         * Directory of where guild storages are stored.
         * @type {String}
         */
        this.path = path;
    }

    /**
     * Get a guild's storage by it's ID.
     * @param {discord.GuildResolvable} guild_resolvable The guild to get the storage for.
     * @returns {GuildStorage}
     */
    async getStorage(guild_resolvable) {
        const guild = this.client.guilds.resolve(guild_resolvable);

        if (guild && this.guilds.get(guild.id)) {
            return this.guilds.get(guild.id);
        } else {
            try {
                await this.loadStorage(guild.id);
            } catch (e) {
                if (e.code === "ENOENT") {
                    const storage = await this.createStorage(guild_resolvable);
                    
                    await storage.save();

                    this.guilds.set(guild.id, storage);
                }
            }
            
            return await this.getStorage(guild_resolvable);
        }
    }

    /**
     * Save all storages.
     */
    async saveAll() {
        for (let entry of this.guilds) {
            const guild = entry[1];

            await guild.save();
        }
    }

    /**
     * Load storage for a guild.
     * @param {String} id The ID of the guild to load.
     * @returns {GuildStorage}
     */
    async loadStorage(id) {
        try {
            const data = await fs.readFile(path.resolve(this.path, id + ".json"));
            const json = JSON.parse(data.toString());

            const storage = new GuildStorage(this, id, json);

            this.guilds.set(id, storage);
            
            this.emit("load", storage);
            
            return storage;
        } catch (e) {
            if (e.code === "ENOENT") {
                throw e;
            }

            const storage = this.createStorage(id);

            storage.prevent_save = true;
            
            this.emit("error", id, e);

            return storage;
        }
    }

    /**
     * Load all guild storages from a directory.
     * @returns {discord.Collection<String,GuildStorage>} The storages that were loaded.
     */
    async loadFromDirectory() {
        const files = await fs.readdir(this.path);

        /** @type {discord.Collection<String,GuildStorage>} */
        const loaded = new discord.Collection;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const guild_id = file.split(".")[0]; // <snowflake>.json

            const storage = await this.loadStorage(guild_id);

            loaded.set(guild_id, storage);
        }

        return loaded;
    }

    /**
     * Create storage for a guild.
     * @param {discord.GuildResolvable} guild_resolvable The guild to create the settings for.
     * @returns {GuildStorage}
     */
    createStorage(guild_resolvable) {
        const guild = this.client.guilds.resolve(guild_resolvable);

        const settings = new GuildStorage(this, guild.id, {
            collections: {
                users: {
                    name: "users",
                    items: {}
                },
                guild: {
                    name: "guild",
                    items: {}
                }
            }
        });

        this.guilds.set(guild.id, settings);

        return settings;
    }
}