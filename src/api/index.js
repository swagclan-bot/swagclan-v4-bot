// Imports
import express from "express"
import dynamic from "express-dynamic-middleware"
import ratelimit from "express-rate-limit"
import discord from "discord.js"
import bodyParser from "body-parser"
import cors from "cors"
import url from "url"
import path from "path"
import randomstring from "randomstring"
import sys from "systeminformation"
import joi from "joi"
import cookieParser from "cookie-parser"
import oauth2 from "client-oauth2"

import client from "../client/index.js"

import config from "../../.config.js"

import { rule_manager, CustomCommand } from "../service/CustomCommandService.js"

import credentials from "../../.credentials.js"

const dynBodyParser = dynamic.create(bodyParser.json());

/**
 * @typedef AuthorisedRequestInherit
 * @property {import("../service/AuthorisationService.js").JSONUserObject} user The authorised user.
 * 
 * @typedef {express.Request & AuthorisedRequestInherit} AuthorisedRequest
 */

/** The maximum length of an input. */
const MAX_INPUT = 2000;

/** The minimum name length allowed for a custom command */
const MIN_NAME = 3;

/** The maxmimum name length allowed for a custom command */
const MAX_NAME = 20;

/** The maxmimum description length allowed for a custom command */
const MAX_DESCRIPTION = 200;

/** The maxmimum number of triggers allowed for a custom command */
const MAX_TRIGGERS = 5;

/** The manimum name length allowed for a trigger */
const MAX_TRIGGER = 20;

/** The maxmimum number of parameters allowed for a custom command */
const MAX_PARAMETERS = 3;

/** The maximum number of variables allowed for a custom command */
const MAX_VARIABLES = 3;

/** The maximum number of actions allowed for a custom command */
const MAX_ACTIONS = 10;

/** The maximum value allowed for a custom command delay */
const MAX_TIMEOUT = 86400000;

const parameter_schema = joi.object().keys({
    type: joi.string().required(),
    name: joi.string().required()
});

const variable_schema = joi.object().keys({
    type: joi.string().required(),
    name: joi.string().required()
});

const expression_schema = joi.any().allow(
    joi.object().keys({
        type: joi.string().required().allow("input"),
        value: joi.string().max(MAX_INPUT).required()
    }),
    joi.object().keys({
        type: joi.string().required().allow("ctx_var"),
        name: joi.string().required()
    }),
    joi.object().keys({
        type: joi.string().required().allow("action"),
        rule: joi.object().keys({
            group: joi.string().required(),
            id: joi.string().required()
        }),
        arguments: joi.array().required().items(joi.link(".."), joi.allow(null))
    })
);

const post_command_schema = joi.object().keys({
    name: joi.string().required().min(MIN_NAME).max(MAX_NAME),
    description: joi.string().min(0).allow("").max(MAX_DESCRIPTION),
    triggers: joi.array().required().items(joi.object().keys({
		type: joi.string().allow("command").allow("startsWith").allow("contains").allow("exact").allow("matches"),
		name: joi.string().max(MAX_TRIGGER)
	})).max(MAX_TRIGGERS),
    parameters: joi.object().pattern(/^/, parameter_schema).max(MAX_PARAMETERS),
    variables: joi.object().pattern(/^/, variable_schema).max(MAX_VARIABLES),
    actions: joi.array().required().items(expression_schema).max(MAX_ACTIONS),
    timeout: joi.number().positive().integer().allow(0).max(MAX_TIMEOUT),
    enabled: joi.boolean(),
    hidden: joi.boolean(),
    sweepable: joi.boolean()
});

const command_schema = post_command_schema.keys({
    id: joi.string().required().pattern(/^[0-9]+$/)
});

const oauthDiscord = new oauth2({
    clientId: credentials.client_id,
    clientSecret: credentials.client_secret,
    accessTokenUri: "https://discord.com/api/v6/oauth2/token",
    authorizationUri: "https://discord.com/oauth2/authorize",
    redirectUri: process.env.BASE_API + "/auth/discord/callback",
    scopes: ["identify", "email", "guilds"]
});

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versions = await sys.versions();

const server = express();

server.use("/asset", express.static(path.resolve(__dirname, "../../asset/")));

/**
 * Create a could not get resource error.
 * @param {express.Request} req The request body.
 * @param {express.Response} res The response body.
 */
async function couldNotGet(req, res) {
    res.status(500).json({
        error: {
            code: 500,
            message: "Could not get resource."
        }
    });
}

/**
 * Create a missing permissions error.
 * @param {express.Request} req The request body.
 * @param {express.Request} res The response body.
 */
async function missingPermissions(req, res) {
    res.status(403).json({
        error: {
            code: 403,
            message: "Missing permissions to view this resource."
        }
    });
}

/**
 * Create a resource not found error.
 * @param {express.Request} req The request body.
 * @param {express.Request} res The response body.
 */
async function notFound(req, res) {
    res.status(404).json({
        error: {
            code: 404,
            message: "Resource not found."
        }
    });
}

/**
 * Create a bad request body error.
 * @param {express.Request} req The request body.
 * @param {express.Response} res The response body.
 */
async function badRequest(req, res) {
    res.status(400).json({
        error: {
            code: 400,
            message: "Malformed request body."
        }
    });
}

server.use(dynBodyParser.handle());
server.use(cors({
    origin: process.env.BASE_WEB,
    credentials: true
}));

server.use(cookieParser());

server.use(async (req, res, next) => {
    if (!req.cookies.sid) {
        const sid = randomstring.generate({
            length: 35,
            charset: "hex",
            capitalization: "lowercase"
        });

        res.cookie("sid", sid, {
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        req.cookies.sid = sid;
    }

    next();
});

server.get("/invite", async (req, res) => {
    const permissionBits = discord.Permissions.resolve(config.permissions);

    res.redirect("https://discord.com/oauth2/authorize?client_id=" + credentials.client_id + "&scope=bot&permissions=" + permissionBits);
});

server.get("/auth/discord", async (req, res) => {
    res.redirect(oauthDiscord.code.getUri());
});

server.get("/auth/discord/callback", async (req, res) => {
    try {
        const user = await oauthDiscord.code.getToken(req.originalUrl);

        await client.SessionService.register(req.cookies.sid, user.data);

        res.redirect(process.env.BASE_WEB);
    } catch (e) {
        console.error(e);

        res.redirect(process.env.BASE_WEB + "?loginerror=true")
    }
});

if (process.env.ENVIRONMENT === "production") {
    server.use(ratelimit({
        windowMs: 60000,
        max: 60,
        message: {
            error: errors.APIError.E429
        }
    }));
}

if (process.env.ENVIRONMENT === "development") {
    server.use(async (req, res, next) => {
        setTimeout(next, (Math.random() + 1) * 150);
    });
}

server.get("/", async (req, res) => {
    res.status(200).json({
        environment: process.env.ENVIRONMENT,
        version: config.version,
        site: {
            web: process.env.BASE_WEB,
            api: process.env.BASE_API
        },
        versions: {
            node: versions.node,
            npm: versions.npm,
            discordjs: "12.2.0"
        },
        commit: await client.getCommit()
    });
});

server.get("/status", async (req, res) => {
    res.status(200).json({
        started: Date.now() - Math.floor(process.uptime() * 1000),
        status: client.user.presence.status,
        user: resolve_basic_user_object(client.user)
    })
});

server.get("/guilds/count", async (req, res) => {
    res.status(200).json({
        guilds: client.guilds.cache.size
    });
});

server.get("/definitions", async (req, res) => {
    const service = client.SettingsService;

    res.status(200).json(service.definitions);
});

server.get("/modules", async (req, res) => {
    const service = client.ModuleService;

    res.status(200).json(Object.fromEntries(service.modules.entries()));
});

server.get("/rules", async (req, res) => {
    res.status(200).json(rule_manager.rule_groups);
});

const dynAuth = dynamic.create(client.SessionService.handle());

server.use(dynAuth.handle());

server.post("/logout", async (req, res) => {
    try {
        await req.session.logout();

        res.status(200).json(true);
    } catch (e) {
        console.error(e);
        
        res.status(500).json(false);
    }
});

server.get("/me", async (req, res) => {
    res.status(200).json(req.session.user);
});

server.get("/account", async (req, res) => {
    const service = client.AccountService;
    const account = await service.getAccount(req.session.user.id);

    let json = account.toJSON();

    json.connections = Object.fromEntries(Object.entries(json.connections).map(([name, connection]) => {
        return {
            created_at: connection.created_at,
            id: connection.id,
            name: connection.name,
            url: connection.url,
            username: connection.username
        };
    }));

    res.status(200).json(account);
});

server.get("/account/connections/:connection", async (req, res) => {
    const service = client.AccountService;
    const account = await service.getAccount(req.session.user.id);

    const uri = account.getURI(req.params.connection);

    if (uri) {
        res.redirect(uri);
    } else {
        res.redirect(BASE_WEB + "/account?linkerror=true");
    }
});

server.delete("/account/connections/:connection", async (req, res) => {
    const service = client.AccountService;
    const account = await service.getAccount(req.session.user.id);

    delete account.connections[req.params.connection];

    await account.save();

    res.status(200).json(true);
});

server.get("/account/connections/:connection/callback", async (req, res) => {
    const service = client.AccountService;
    const account = await service.getAccount(req.session.user.id);

    if (await account.authorise(req.params.connection, req.originalUrl)) {
        res.redirect(process.env.BASE_WEB + "/account");
    } else {
        res.redirect(process.env.BASE_WEB + "/account?linkerror=true");
    }
});

/**
 * Resolve an incomplete guild structure to a complete JSON client guild object.
 * @param {any} guild The guild to resolve.
 */
function resolve_basic_guild_object(guild) {
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
        created: guild.createdTimestamp,
        dashboard_available: !!cache_guild,
        premium: {
            active: true,
            until: 1595821348733
        },
        ...(cache_guild ? {
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

/**
 * Resolve a complex user structure to a JSON user object.
 * @param {discord.User} user The user to resolve.
 */
function resolve_basic_user_object(user) {
    return {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar
    }
}

/**
 * Resolve a complex channel structure to a JSON client channel object.
 * @param {discord.Channel} channel The channel to resolve.
 */
function resolve_basic_channel_object(channel) {
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
 * Resolve a complex message structure to a JSON client message object.
 * @param {discord.Message} message The message to resolve.
 */
function resolve_basic_message_object(message) {
    return {
        id: message.id,
        channel: message.channel.id,
        author: message.author,
        content: message.content,
        embeds: message.embeds
    }
}

/**
 * Resolve a guild ID to a JSON client guild object.
 * @param {discord.Guild} guild The guild to resolve.
 * @param {discord.GuildMember} member The member requesting the object.
 */
function resolve_guild_object(guild, member) {
    return {
        id: guild.id,
        name: guild.name,
        iconURL: guild.iconURL({ format: "png", dynamic: true }),
        is_owner: guild.ownerID === member.user.id,
        permissions: member.permissions.bitfield,
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
 * Check if a guild is manageable.
 * @param {discord.Guild} guild The guild to check if manageable.
 * @param {discord.GuildMember} member The member to check.
 * @returns {Boolean}
 */
function is_manageable(req, res, next) {
    const cache_guild = client.guilds.resolve(req.params.id);

    if (cache_guild) {
        const member = cache_guild.members.resolve(req.session.user.id);

        if (member && member.hasPermission("MANAGE_GUILD")) {
            next();
        } else {
            missingPermissions(req, res);
        }
    } else {
        notFound(req, res);
    }
}

server.get("/guilds", async (req, res) => {
    try {
        const guilds = (await req.session.getGuilds()).filter(guild => {
            const cache_guild = client.guilds.resolve(guild.id);

            return req.query.manageable !== "true" || cache_guild && (guild.permissions & 0x20) === 0x20 // MANAGE_GUILD
        }).map(resolve_basic_guild_object);

        res.status(200).json(guilds);
    } catch (e) {
        console.log(e);

        couldNotGet(req, res);
    }
});

server.get("/guilds/:id", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);
    const member = cache_guild.members.resolve(req.session.user.id);

    res.status(200).json(resolve_guild_object(cache_guild, member));
});

server.get("/guilds/:id/channels", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const channels = [...cache_guild.channels.cache.values()].filter(channel => {
        return !channel.deleted;
    }).map(resolve_basic_channel_object);

    res.status(200).json(channels);
});

server.get("/guilds/:id/channels/:channel_id", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const channel = cache_guild.channels.resolve(req.params.channel_id)

    res.status(200).json(resolve_basic_channel_object(channel));
});

server.get("/guilds/:id/commands", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.CustomCommandService;
    let guild_commands = await service.getCustomCommands(cache_guild);
    
    res.status(200).json(guild_commands);
});

server.post("/guilds/:id/commands", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    if (!post_command_schema.validate(req.body).error) {
        const service = client.CustomCommandService;
        let guild_commands = await service.getCustomCommands(cache_guild);

        req.body.id = guild_commands.meta.count.toString();
        req.body.created_at = Date.now();

        const command = new CustomCommand(guild_commands, req.body);

        guild_commands.commands.set(guild_commands.meta.count.toString(), command);
        guild_commands.meta.count++;

        await guild_commands.save();

        res.status(200).json(command);
    } else {
        badRequest(req, res);
    }
});

server.get("/guilds/:id/commands/:command_id", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.CustomCommandService;
    let guild_commands = await service.getCustomCommands(cache_guild);

    const command = guild_commands.commands.get(req.params.command_id);

    if (command) {
        res.status(200).json(command);
    } else {
        notFound(req, res);
    }
});

server.delete("/guilds/:id/commands/:command_id", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.CustomCommandService;
    let guild_commands = await service.getCustomCommands(cache_guild);

    const command = guild_commands.commands.get(req.params.command_id);

    if (command) {
        guild_commands.commands.delete(req.params.command_id);

        await guild_commands.save();

        res.status(200).json(guild_commands);
    } else {
        notFound(req, res);
    }
});

server.put("/guilds/:id/commands/:command_id", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    if (!command_schema.validate(req.body).error) {
        const service = client.CustomCommandService;
        let guild_commands = await service.getCustomCommands(cache_guild)

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
            notFound(req, res);
        }
    } else { 
        badRequest(req, res);
    }
});

server.get("/guilds/:id/commands/:command_id/timeouts", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.CustomCommandService;
    let guild_commands = await service.getCustomCommands(cache_guild);

    const command = guild_commands.commands.get(req.params.command_id);

    if (command) {
        const timeouts = [...command.timeouts.entries()].map(([user_id, timeout]) => {
            const user = cache_guild.members.resolve(user_id).user;

            return {
                ...resolve_basic_user_object(user),
                timeout
            }
        }).filter(user_timeout => user_timeout.timeout > Date.now());

        res.status(200).json(timeouts);
    } else {
        notFound(req, res);
    }
});

function create_stream(req, object, events) {
    const entries = Object.entries(events);

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        object.on(entry[0], entry[1]);
    }

    req.on("close", () => {
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];

            object.off(entry[0], entry[1]);
        }
    });
}

server.get("/guilds/:id/commands/:command_id/timeouts/stream", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.CustomCommandService;
    let guild_commands = await service.getCustomCommands(cache_guild);

    const command = guild_commands.commands.get(req.params.command_id);

    if (command) {
        res.status(200);

        create_stream(req, command, {
            timeout(user, timeout) {
                res.write(JSON.stringify({
                    op: "timeout",
                    data: {
                        ...resolve_basic_user_object(user),
                        timeout
                    }
                }) + "\n");
            },
            timeoutClear(user_id) {
                const user = cache_guild.members.resolve(user_id).user;

                res.write(JSON.stringify({
                    op: "timeoutClear",
                    data: resolve_basic_user_object(user)
                }) + "\n");
            },
            allTimeoutsClear(user, timeout) {
                res.write(JSON.stringify({
                    op: "allTimeoutsClear"
                }) + "\n");
            }
        });
    } else {
        notFound(req, res);
    }
});

server.delete("/guilds/:id/commands/:command_id/timeouts", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.CustomCommandService;
    let guild_commands = await service.getCustomCommands(cache_guild);

    const command = guild_commands.commands.get(req.params.command_id);

    if (command) {
        command.clearTimeouts();
        
        res.status(200).json(true);
    } else {
        notFound(req, res);
    }
});

server.delete("/guilds/:id/commands/:command_id/timeouts/:user_id", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.CustomCommandService;
    let guild_commands = await service.getCustomCommands(cache_guild);

    const command = guild_commands.commands.get(req.params.command_id);

    if (command) {
        command.clearTimeout(req.params.user_id);
        
        res.status(200).json(true);
    } else {
        notFound(req, res);
    }
});

server.get("/guilds/:id/settings", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);
    let guild_settings = await client.SettingsService.getSettings(cache_guild);
    
    res.status(200).json(Object.fromEntries(guild_settings.settings.entries()));
});

server.patch("/guilds/:id/settings", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.SettingsService;
    const guild_settings = await service.getSettings(cache_guild);

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
});

server.get("/guilds/:id/settings/history", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.SettingsService;
    const guild_settings = await service.getSettings(cache_guild);

    res.status(200).json(guild_settings.history);
});

server.get("/guilds/:id/storage", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.StorageService;
    const guild_storage = await service.getStorage(cache_guild);

    if (guild_storage) {
        res.status(200).json({
            ...guild_storage.toJSON(),
            max: guild_storage.max
        });
    } else {
        notFound(req, res);
    }
});

server.get("/guilds/:id/storage/stream", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.StorageService;
    const guild_storage = await service.getStorage(cache_guild);

    if (guild_storage) {
        create_stream(req, guild_storage, {
            clear() {
                res.write(JSON.stringify({
                    op: "clear"
                }) + "\n");
            },
            collectionDelete(name) {
                res.write(JSON.stringify({
                    op: "collectionDelete",
                    data: name
                }) + "\n");
            },
            collectionCreate(name, collection) {
                res.write(JSON.stringify({
                    op: "collectionCreate",
                    data: {
                        name,
                        collection
                    }
                }) + "\n");
            },
            collectionClear(collection) {
                res.write(JSON.stringify({
                    op: "collectionClear",
                    data: collection
                }) + "\n");
            },
            itemDelete(collection, key) {
                res.write(JSON.stringify({
                    op: "itemDelete",
                    data: {
                        collection: collection,
                        key
                    }
                }) + "\n");
            },
            itemCreate(collection, key, item) {
                res.write(JSON.stringify({
                    op: "itemCreate",
                    data: {
                        collection,
                        key,
                        item
                    }
                }) + "\n");
            },
            itemUpdate(collection, key, before, after) {
                res.write(JSON.stringify({
                    op: "itemUpdate",
                    data: {
                        collection,
                        key,
                        before,
                        after
                    }
                }) + "\n");
            }
        });
    } else {
        notFound(req, res);
    }
});

server.post("/guilds/:id/storage/collections", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.StorageService;
    const guild_storage = await service.getStorage(cache_guild);

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
                
                res.status(413).json({
                    error: {
                        code: 413,
                        message: "Not enough space in storage."
                    }
                });
            }
        } else {
            res.status(400).json({
                error: {
                    code: 400,
                    message: "Collection name is too long."
                }
            });
        }
    } else {
        badRequest(req, res);
    }
});

server.delete("/guilds/:id/storage/collections", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.StorageService;
    const guild_storage = await service.getStorage(cache_guild);

    if (guild_storage) {
        guild_storage.clear();
        
        await guild_storage.save();

        res.status(200).json(true);
    } else {
        notFound(req, res);
    }
});

server.get("/guilds/:id/storage/collections/:collection_name", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.StorageService;
    const guild_storage = await service.getStorage(cache_guild);

    if (guild_storage) {
        const collection = guild_storage.collections.get(req.params.collection_name);

        if (collection) {
            res.status(200).json(collection);
        } else {
            notFound(req, res);
        }
    } else {
        notFound(req, res);
    }
});

server.delete("/guilds/:id/storage/collections/:collection_name", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.StorageService;
    const guild_storage = await service.getStorage(cache_guild);

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
});

server.delete("/guilds/:id/storage/collections/:collection_name/items", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.StorageService;
    const guild_storage = await service.getStorage(cache_guild);

    if (guild_storage) {
        const collection = guild_storage.collections.get(req.params.collection_name);

        if (collection) {
            collection.clear();
            
            await guild_storage.save();

            res.status(200).json(true);
        } else {
            notFound(req, res);
        }
    } else {
        notFound(req, res);
    }
});

server.put("/guilds/:id/storage/collections/:collection_name/items/:item_name", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.StorageService;
    const guild_storage = await service.getStorage(cache_guild);

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

                        res.status(413).json({
                            error: {
                                code: 413,
                                message: "Not enough space in storage."
                            }
                        });
                    }
                } else {
                    notFound(req, res);
                }
            } else {
                notFound(req, res);
            }
        } else {
            badRequest(req, res);
        }
    } else {
        res.status(400).json({
            error: {
                code: 400,
                message: "Item name is too long."
            }
        });
    }
});

server.delete("/guilds/:id/storage/collections/:collection_name/items/:item_name", is_manageable, async (req, res) => {
    const cache_guild = client.guilds.resolve(req.params.id);

    const service = client.StorageService;
    const guild_storage = await service.getStorage(cache_guild);

    if (guild_storage) {
        const collection = guild_storage.collections.get(req.params.collection_name);

        if (collection) {
            collection.deleteItem(req.params.item_name);
            
            await guild_storage.save();

            res.status(200).json(true);
        } else {
            notFound(req, res);
        }
    } else {
        notFound(req, res);
    }
});

dynAuth.unuse();

dynBodyParser.unuse();

server.get("*", notFound);

server.listen(process.env.PORT, async () => {
    console.success("API server listening at *:" + process.env.PORT);
});

process.on("uncaughtException", async err => {
    if (err.code === "EADDRINUSE") {
        console.error("Unable to start API server, port in use.");
    } else {
        throw err;
    }
});