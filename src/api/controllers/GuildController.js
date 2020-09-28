import express from "express"

import { Permissions } from "discord.js"

import { CustomCommand } from "../../service/CustomCommandService.js"

import Errors from "../schema/Errors.js"

import client from "../../client/index.js"

import command_schemas from "../schema/commands.js"
import create_stream from "./Streams.js"

import { user_object } from "./UserController.js"

/**
 * Resolve a complex channel structure to a JSON client channel object.
 * @param {discord.Channel} channel The channel to resolve.
 */
export function channel_object(channel) {
    return {
        type: channel.type,
        id: channel.id,
        name: channel.name,
        position: channel.rawPosition,
        createdTimestamp: channel.createdTimestamp,
        parent: channel.parentID
    }
}

/**
 * Resolve an incomplete guild structure to a complete JSON client guild object.
 * @param {any} guild The guild to resolve.
 */
export function api_guild_object(guild) {
    const cache_guild = client.guilds.resolve(guild.id);

    const iconURL = guild.icon ? ("https://cdn.discordapp.com/icons/" + 
        guild.id + "/" +
        guild.icon + (guild.icon.startsWith("a_") ? ".gif" : ".png")) : "https://api.thechimp.store/asset/other/noicon.png";

    return {
        id: guild.id,
        name: guild.name,
        iconURL,
        icon: guild.icon,
        is_owner: guild.owner,
        permissions: guild.permissions,
        dashboard_available: !!cache_guild,
        premium: {
            active: true,
            until: 1595821348733
        },
        ...(cache_guild ? {
            created: cache_guild.createdTimestamp,
            count: {
                members: cache_guild.memberCount,
                bots: cache_guild.members.cache.filter(member => member.user?.bot).size,
                channels: cache_guild.channels.cache.size,
                rooms: cache_guild.channels.cache.filter(channel => channel.type === "voice").size,
                categories: cache_guild.channels.cache.filter(channel => channel.type === "category").size,
                roles: cache_guild.channels.cache.size
            }
        } : {})
    }
}

export function perspective_guild_object(guild, perspective) {
    return {
        id: guild.id,
        name: guild.name,
        iconURL: guild.iconURL({ format: "png", dynamic: true }),
        is_owner: guild.ownerID === perspective.user.id,
        permissions: perspective.permissions.bitfield,
        dashboard_available: true,
        premium: {
            active: true,
            until: 1595821348733
        },
        ...(guild ? {
            count: {
                members: guild.memberCount,
                bots: guild.members.cache.filter(member => member.user?.bot).size,
                channels: guild.channels.cache.size,
                rooms: guild.channels.cache.filter(channel => channel.type === "voice").size,
                categories: guild.channels.cache.filter(channel => channel.type === "category").size,
                roles: guild.channels.cache.size
            }
        } : {})
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function GetGuild(req, res) {
    const member = req.guild.members.resolve(req.session.user.id);

    res.status(200).json(perspective_guild_object(req.guild, member));
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function GetChannels(req, res) {
    const member = req.guild.members.resolve(req.session.user.id);
    
    const channels = [...req.guild.channels.cache.values()].filter(channel => {
        return !channel.deleted &&
            channel.permissionsFor(member)
                .has(Permissions.FLAGS.VIEW_CHANNEL);
    });

    res.status(200).json(channels);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function GetChannel(req, res) {
    const member = req.guild.members.resolve(req.session.user.id);

    if (!channel.deleted && channel.permissionsFor(member).has(Permissions.FLAGS.VIEW_CHANNEL)) {
        const channel = req.guild.channels.resolve(req.params.channel_id);

        res.status(200).json(channel_object(channel));
    } else {
        Errors.Not_Found(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function GetCommands(req, res) {
    const guild_commands = await client.CustomCommandService.getCustomCommands(req.guild);

    res.status(200).json(guild_commands);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function CreateCommand(req, res) {
    if (!command_schemas.post_command_schema.validate(req.body).error) {
        const guild_commands = await client.CustomCommandService.getCustomCommands(req.guild);

        req.body.id = guild_commands.meta.count.toString();
        req.body.created_at = Date.now();

        const command = new CustomCommand(guild_commands, req.body);

        guild_commands.commands.set(guild_commands.meta.count.toString(), command);
        guild_commands.meta.count++;

        await guild_commands.save();

        res.status(200).json(command);
    } else {
        Errors.Bad_Request(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function GetCommand(req, res) {
    const guild_commands = await client.CustomCommandService.getCustomCommands(req.guild);

    const command = guild_commands.commands.get(req.params.command_id);

    if (command) {
        res.status(200).json(command);
    } else {
        Errors.Not_Found(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function DeleteCommand(req, res) {
    const guild_commands = await client.CustomCommandService.getCustomCommands(req.guild);

    const command = guild_commands.commands.get(req.params.command_id);

    if (command) {
        guild_commands.commands.delete(req.params.command_id);

        await guild_commands.save();

        res.status(200).json(guild_commands);
    } else {
        Errors.Not_Found(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function UpdateCommand(req, res) {
    if (!command_schemas.patch_command_schema.validate(req.body).error) {
        const guild_commands = await client.CustomCommandService.getCustomCommands(req.guild)

        const command = guild_commands.commands.get(req.params.command_id);

        if (command) {
            command.name = req.body.name;
            command.description = req.body.description;
            command.triggers = req.body.triggers;
            command.setParameters(req.body.parameters);
            command.setVariables(req.body.variables);
            command.setActions(req.body.actions);
            command.modified_at = Date.now();
            command.timeout = req.body.timeout;
            command.enabled = req.body.enabled;
            command.hidden = req.body.hidden;
            command.sweepable = req.body.sweepable;
            
            await guild_commands.save();

            res.status(200).json(command);
        } else {
            Errors.Not_Found(req, res);
        }
    } else { 
        Errors.Bad_request(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function GetCommandTimeouts(req, res) {
    const guild_commands = await client.CustomCommandService.getCustomCommands(req.guild);

    const command = guild_commands.commands.get(req.params.command_id);

    if (command) {
        const timeouts = [...command.timeouts.entries()].map(([user_id, timeout]) => {
            const user = req.guild.members.resolve(user_id).user;

            return {
                ...user_object(user),
                timeout
            }
        }).filter(user_timeout => user_timeout.timeout > Date.now());

        res.status(200).json(timeouts);
    } else {
        Errors.Not_Found(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function StreamTimeouts(req, res) {
    const guild_commands = await client.CustomCommandService.getCustomCommands(req.guild);

    const command = guild_commands.commands.get(req.params.command_id);

    if (command) {
        res.status(200)

        create_stream(req, res, command, {
            timeout(user, timeout) {
                return {
                    op: "timeout",
                    data: {
                        ...user_object(user),
                        timeout
                    }
                }
            },
            timeoutClear(user_id) {
                const user = req.guild.members.resolve(user_id).user;

                return {
                    op: "timeoutClear",
                    data: user_object(user)
                }
            },
            allTimeoutsClear(user, timeout) {
                return {
                    op: "allTimeoutsClear"
                }
            }
        })
    } else {
        Errors.Not_Found(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function ClearTimeouts(req, res) {
    const guild_commands = await client.CustomCommandService.getCustomCommands(req.guild);

    const command = guild_commands.commands.get(req.params.command_id);

    if (command) {
        command.clearTimeouts();

        res.status(200).json(true);
    } else {
        Errors.Not_Found(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function ClearTimeout(req, res) {
    const guild_commands = await client.CustomCommandService.getCustomCommands(req.guild);

    const command = guild_commands.commands.get(req.params.command_id);

    if (command) {
        command.clearTimeout(req.params.user_id);

        res.status(200).json(true);
    } else {
        Errors.Not_Found(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function GetSettings(req, res) {
    let guild_settings = await client.SettingsService.getSettings(req.guild);
    
    res.status(200).json(Object.fromEntries(guild_settings.settings.entries()));
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function UpdateSettings(req, res) {
    const guild_settings = await client.SettingsService.getSettings(req.guild);

    const errors = [];

    for (let key in req.body) {
        const setting = guild_settings.settings.get(key);

        if (setting) {
            if (!(await setting.set(req.body[key]))) {
                errors.push({
                    code: 422,
                    message: "Invalid value.",
                    setting: setting.name
                });
            }
        }
    }

    await guild_settings.save();

    res.status(200).json({
        ...(errors.length ? { errors } : {}),
        ...Object.fromEntries([...guild_settings.settings.entries()].filter(([key, value]) => req.body[key]))
    });
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function GetSettingsHistory(req, res) {
    const guild_settings = await client.SettingsService.getSettings(req.guild);

    res.status(200).json(guild_settings.history);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function GetStorage(req, res) {
    const guild_storage = await client.StorageService.getStorage(req.guild);

    if (guild_storage) {
        res.status(200).json({
            ...guild_storage.toJSON(),
            max: guild_storage.max
        });
    } else {
        notFound(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function StreamStorage(req, res) {
    const guild_storage = await client.StorageService.getStorage(req.guild);

    if (guild_storage) {
        res.status(200)

        create_stream(req, res, guild_storage, {
            clear() {
                return {
                    op: "clear"
                }
            },
            collectionDelete(name) {
                return {
                    op: "collectionDelete",
                    data: name
                }
            },
            collectionCreate(name, collection) {
                return {
                    op: "collectionCreate",
                    data: {
                        name,
                        collection
                    }
                }
            },
            collectionClear(collection) {
                return {
                    op: "collectionClear",
                    data: collection
                }
            },
            itemDelete(collection, key) {
                return {
                    op: "itemDelete",
                    data: {
                        collection: collection,
                        key
                    }
                }
            },
            itemCreate(collection, key, item) {
                return {
                    op: "itemCreate",
                    data: {
                        collection,
                        key,
                        item
                    }
                }
            },
            itemUpdate(collection, key, before, after) {
                return {
                    op: "itemUpdate",
                    data: {
                        collection,
                        key,
                        before,
                        after
                    }
                }
            }
        })
    } else {
        Errors.Not_Found(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function ClearStorage(req, res) {
    const guild_storage = await client.StorageService.getStorage(req.guild);

    if (guild_storage) {
        guild_storage.clear();
        
        await guild_storage.save();

        res.status(200).json(true);
    } else {
        notFound(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function CreateCollection(req, res) {
    const guild_storage = await client.StorageService.getStorage(req.guild);

    const not_enough_space = new Errors.APIError(413, "Not enough space in storage.");

    if (req.body.name) {
        if (req.body.name.length <= 20) {
            try {
                const collection = guild_storage.createCollection(req.body.name);
            
                if (collection) {
                    await guild_storage.save();

                    res.status(200).json(collection);
                } else {
                    res.status(409).json(false);
                }
            } catch (e) {
                console.error(e);

                not_enough_space.respond(req, res);
            }
        } else {
            not_enough_space.respond(req, res);
        }
    } else {
        Errors.Bad_request(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function GetCollection(req, res) {
    const guild_storage = await client.StorageService.getStorage(req.guild);

    if (guild_storage) {
        const collection = guild_storage.collections.get(req.params.collection_name);

        if (collection) {
            res.status(200).json(collection);
        } else {
            Errors.Not_Found(req, res);
        }
    } else {
        Errors.Not_Found(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function DeleteCollection(req, res) {
    const guild_storage = await client.StorageService.getStorage(req.guild);

    if (guild_storage) {
        const collection = guild_storage.collections.get(req.params.collection_name);

        if (collection) {
            collection.delete();
            
            await guild_storage.save();

            res.status(200).json(true);
        } else {
            notFound(req, res);
        }
    } else {
        notFound(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function ClearCollection(req, res) {
    const guild_storage = await client.StorageService.getStorage(req.guild);

    if (guild_storage) {
        const collection = guild_storage.collections.get(req.params.collection_name);

        if (collection) {
            collection.clear();
            
            await guild_storage.save();

            res.status(200).json(true);
        } else {
            Errors.Not_Found(req, res);
        }
    } else {
        Errors.Not_Found(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function SetItem(req, res) {
    const guild_storage = await client.StorageService.getStorage(req.guild);

    const item_name_too_long = new Errors.APIError(400, "Item name is too long.");
    const not_enough_space = new Errors.APIError(413, "Not enough space in storage.");

    if (req.params.item_name.length <= 20) {
        if (typeof req.body.value !== "undefined") {
            if (guild_storage) {
                const collection = guild_storage.collections.get(req.params.collection_name);

                if (collection) {
                    try {
                        const item = collection.set(req.params.item_name, req.body.value);

                        await guild_storage.save();

                        res.status(200).json(item);
                    } catch (e) {
                        console.error(e);

                        not_enough_space.respond(req, res);
                    }
                } else {
                    Errors.Not_Found(req, res);
                }
            } else {
                Errors.Not_Found(req, res);
            }
        } else {
            Errors.Bad_Request(req, res);
        }
    } else {
        item_name_too_long.respond(req, res);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export async function DeleteItem(req, res) {
    const guild_storage = await client.StorageService.getStorage(req.guild);

    if (guild_storage) {
        const collection = guild_storage.collections.get(req.params.collection_name);

        if (collection) {
            collection.deleteItem(req.params.item_name);
            
            await guild_storage.save();

            res.status(200).json(true);
        } else {
            Errors.Not_Found(req, res);
        }
    } else {
        Errors.Not_Found(req, res);
    }
}

export default {
    GetGuild,
    GetChannels,
    GetChannel,
    GetCommands,
    CreateCommand,
    GetCommand,
    DeleteCommand,
    UpdateCommand,
    GetCommandTimeouts,
    StreamTimeouts,
    ClearTimeouts,
    ClearTimeout,
    GetSettings,
    UpdateSettings,
    GetSettingsHistory,
    GetStorage,
    StreamStorage,
    ClearStorage,
    CreateCollection,
    GetCollection,
    DeleteCollection,
    ClearCollection,
    SetItem,
    DeleteItem
}