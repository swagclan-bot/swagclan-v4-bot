// Imports
import { BotModule, ModuleCommand, MessageMatcher, CommandVersion, CommandArgument, CommandSyntax, ArgumentType } from "../../../service/ModuleService.js"
import dns from "dns"
import numeral from "numeral"
import fetch from "node-fetch"
import path from "path"
import randomstring from "randomstring"
import child_process from "child_process"
import chess from "chess.js"
import Fuse from "fuse.js"
import discord from "discord.js"
import { promises as fs } from "fs"

import { promisify } from "util"

import diabotical from "../../../../lib/diabotical/index.js"
import hyperscape from "../../../../lib/hyperscape/index.js"
import lichess from "../../../../lib/lichess/index.js"
import urban from "../../../../lib/urban/index.js"

import { p, is } from "../../../util/plural.js"
import ChunkArr from "../../../util/chunk.js"

import credentials from "../../../../.credentials.js"
import config from "../../../../.config.js"

import client from "../../index.js"

const dnslookup = promisify(dns.lookup);
const fmt = num => numeral(num).format("0,0");

const ddos = {};

const evals = {};

export default new BotModule({
    name: "Utils",
    description: "Information commands and other utilities.",
    emoji: "🗃",
    commands: [new ModuleCommand({
        name: "User Info",
        description: "Get information about a user and their member status.",
        emoji: "👥",
        versions: [
            new CommandVersion(["userinfo", "user"], [
                new CommandArgument({
                    name: "user",
                    description: "The user to get information about.",
                    emoji: "👥",
                    types: [ArgumentType.User],
                    optional: true
                })
            ])
        ],
        example: "https://i.imgur.com/iEB12aR.gif",
        callback: async function GetUserInformation(message) {
            /** @type {discord.User} */
            const user = this.args.user?.value || message.author;
            const member = message.guild.members.resolve(user.id);

            const colour = 
                user.presence?.status === "online" ? "0x43b581" :
                user.presence?.status === "idle" ? "0xfaa61a" : 
                user.presence?.status === "offline" ? "0x747f8d" :
                user.presence?.status === "dnd" ? "0xf04747" : "success";

            return await this.reply(colour, "User " + user.tag + " (" + user.id + ")", {
                fields: [
                    ...(user.createdAt ? [{
                        title: "Created At",
                        body: user.createdAt.toISOString()
                    }] : []),
                    ...(message.guild.members.resolve(user) ? [{
                        title: "Join Date",
                        body: member.joinedAt.toISOString()
                    }] : [])
                ],
                image: {
                    url: user.avatarURL({ format: "png", dynamic: true })
                }
            }); 
        }
    }), new ModuleCommand({
        name: "Server Info",
        description: "Get information about the server.",
        emoji: "🖥",
        versions: [
            new CommandVersion(["serverinfo", "server"], [])
        ],
        example: "https://i.imgur.com/2FSFkr3.gif",
        callback: async function GetServerInformation(message) {
            await message.guild.fetch();

            return await this.reply("success", "Server information for `" + message.guild.name + "`", {
                fields: [
                    {
                        title: "Created At",
                        body: message.guild.createdAt.toISOString(),
                        inline: true
                    },
                    {
                        title: "Region",
                        body: message.guild.region,
                        inline: true
                    },
                    {
                        title: "Stats",
                        body: `
**Members**: \`${fmt(message.guild.memberCount)}\`
**Roles**: \`${fmt(message.guild.roles.cache.size - 1)}\`
**Categories**: \`${fmt(message.guild.channels.cache.filter(channel => channel.type === "category").size)}\`
**Channels**: \`${fmt(message.guild.channels.cache.filter(channel => channel.type !== "category").size)}\`
**Emojis**: \`${fmt(message.guild.emojis.cache.size)}\`
**Boosts**: \`${fmt(message.guild.premiumSubscriptionCount)}\``.trim()
                    },
                    {
                        title: "ID",
                        body: "`" + message.guild.id + "`"
                    }
                ],
                thumbnail: {
                    url: message.guild.iconURL({ format: "png", dynamic: true })
                }
            })
        }
    }), new ModuleCommand({
        name: "Avatar", 
        description: "Get a user's avatar in a specified format.",
        emoji: "🖼",
        versions: [
            new CommandVersion(["avatar", "av"], [
                new CommandArgument({
                    name: "user",
                    description: "The user of whom to get the avatar.",
                    emoji: "👥",
                    types: [ArgumentType.User],
                    optional: true
                }),
                new CommandArgument({
                    name: "format",
                    description: "The image format to get the avatar in",
                    emoji: "🖼",
                    types: [ArgumentType.ImageFormat],
                    optional: true
                })
            ])
        ],
        example: "https://i.imgur.com/0NTIIuu.gif",
        callback: async function GetUserAvatar(message) {
            try {
                return await this.reply("success", "User avatar for <@" + this.args.user.value.id + ">.", {
                    image: {
                        url: this.args.user.value.displayAvatarURL({
                            format: this.args.format?.value || undefined,
                            dynamic: !this.args.format,
                            size: 1024
                        })
                    }
                });
            } catch (e) {
                return await this.reply("error", "Could not get user avatar in that format.");
            }
        }
    }), new ModuleCommand({
        name: "Minecraft Server",
        description: "Get minecraft server information.",
        emoji: "<:minecraft:" + config.emoji.minecraft + ">",
        versions: [
            new CommandVersion(["mcserver"], [
                new CommandArgument({
                    name: "ip",
                    description: "The IP of the minecraft server to get.",
                    emoji: "🌐",
                    types: [ArgumentType.Domain]
                })
            ])
        ],
        example: "https://i.imgur.com/lrwVDxW.gif",
        callback: async function GetMinecraftServerInformation(message) {
            await this.reply("success", "Loading information for server with ip `" + this.args.ip.value + "`");

            const res = await fetch("https://mcapi.xdefcon.com/server/" + encodeURIComponent(this.args.ip.value) + "/full/json");
            const json = await res.json();

            if (json.serverStatus === "online") {
                return await this.edit("success", "Server information for `" + this.args.ip.value + "`", {
                    fields: [
                        {
                            title: "IP",
                            body: "Resolved IP: `" + json.serverip + "`",
                            inline: true
                        },
                        {
                            title: "Players",
                            body: numeral(json.players).format("0,0") + "/" + numeral(json.maxplayers).format("0,0"),
                            inline: true
                        },
                        {
                            title: "Version",
                            body: json.version
                        },
                        {
                            title: "MOTD",
                            body: this.escape(json.motd.text.replace(/[^\u0000-\u007F][a-z]?/g, "").trim()),
                            inline: true
                        }
                    ],
                    thumbnail: {
                        url: "https://eu.mc-api.net/v3/server/favicon/" + this.args.ip.value
                    },
                    footer: "Provided by mcapi.xdefcon.com and mc-api.net"
                });
            } else {
                return await this.edit("error", "Server not found or is offline.");
            }
        }
    }), new ModuleCommand({
        name: "Minecraft User",
        description: "Get information on a minecraft user.",
        emoji: "<:minecraft:" + config.emoji.minecraft + ">",
        versions: [
            new CommandVersion(["mcuser"], [
                new CommandArgument({
                    name: "username",
                    description: "The name of the user to get.",
                    emoji: "🏷",
                    types: [new ArgumentType({
                        name: "Username",
                        description: "A username of a minecraft user.",
                        examples: ["ChimpStoreWorker"],
                        validate: /^\S+$/i
                    })]
                })
            ])
        ],
        example: "https://i.imgur.com/9g9MLpV.gif",
        callback: async function GetMinecraftUserInformation(message) {
            await this.reply("success", "Loading user information for `" + this.escape_c(this.args.username.value) + "`..");

            const res = await fetch("https://api.mojang.com/users/profiles/minecraft/" + encodeURIComponent(this.args.username.value));

            try {
                const user = await res.json();

                const res2 = await fetch("https://api.mojang.com/user/profiles/" + encodeURIComponent(user.id) + "/names");
                const usernames = await res2.json();

                return await this.edit("success", "User `" + this.escape_c(user.name) + "`", {
                    fields: [
                        {
                            title: "UUID",
                            body: "`" + user.id + "`"
                        },
                        {
                            title: "Username History",
                            body: usernames.map((username, i) => {
                                const name = this.escape(username.name);
                                const date = new Date(username.changedToAt || 0).toISOString().split("T")[0];
                                
                                return (++i) + ". " + name + (username.changedToAt ? " (" + date + ")" : "");
                            })
                        }
                    ],
                    thumbnail: {
                        url: "https://crafatar.com/renders/body/" + user.id + "?overlay=true"
                    },
                    image: {
                        url: "https://crafatar.com/skins/" + user.id
                    },
                    footer: "Provided by mojang.com and crafatar.com"
                });
            } catch (e) {
                return await this.edit("error", "Could not get user information.");
            }
        }
    }), new ModuleCommand({
        name: "Resolve Domain",
        description: "Resolve a domain name to an IP address.",
        emoji: "🌐",
        versions: [
            new CommandVersion(["resolve", "domain"], [
                new CommandArgument({
                    name: "domain",
                    description: "The domain name to resolve.",
                    emoji: "🌐",
                    types: [ArgumentType.Domain]
                })
            ])
        ],
        example: "https://i.imgur.com/3KWMiIC.gif",
        callback: async function ResolveDomain(message) {
            try {
                const dnsres = await dnslookup(this.args.domain.value);

                return await this.reply("success", "Resolved IP for `" + this.args.domain.value + "`.", {
                    fields: [
                        {
                            title: "Address",
                            body: dnsres.address + " (IPv" + dnsres.family + ")"
                        }
                    ]
                })
            } catch (e) {
                return await this.reply("error", "Could not resolve domain.");
            }
        }
    }), new ModuleCommand({
        name: "Locate IP",
        description: "Geo-locate an IP address or domain name.",
        emoji: "🌍",
        versions: [
            new CommandVersion(["geolocate", "iplocate"], [
                new CommandArgument({
                    name: "ip",
                    description: "The IP address or domain name to locate.",
                    emoji: "🌐",
                    types: [ArgumentType.IPAddress, ArgumentType.Domain]
                })
            ])
        ],
        example: "https://i.imgur.com/qTWAl4k.gif",
        callback: async function GeolocateIP(message) {
            if (credentials.ipinfo) {
                await this.reply("success", "Loading IP location information..");

                let ip = this.args.ip.value;

                if (this.args.ip.type.name === "Domain") {
                    try {
                        const dnsres = await dnslookup(ip);
                        
                        ip = dnsres.address;
                    } catch (e) {
                        if (e.code === "ENOTFOUND") {
                            return await this.edit("error", "Could not resolve domain.");
                        }

                        throw e;
                    }
                }
            
                const locate = await fetch("http://ipinfo.io/" + encodeURIComponent(ip) + "?token=" + credentials.ipinfo);

                if (locate.status === 200) {
                    const json = await locate.json();

                    if (!json.bogon) {
                        return await this.edit("success", "Location information for `" + json.ip + "`.", {
                            fields: [
                                {
                                    title: "Location",
                                    body: [json.postal, json.city, json.region, json.country].filter(_ => _).join(", ")
                                },
                                {
                                    title: "Latitude/Longitude",
                                    body: "`" + json.loc + "`"
                                },
                                {
                                    title: "Organisation",
                                    body: json.org
                                }
                            ],
                            footer: "Provided by ipinfo.io"
                        });
                    } else {
                        return await this.edit("error", "Could not locate ip.");
                    }
                } else {
                    return await this.edit("error", "Could not locate ip.");
                }
            } else {
                console.error("ipinfo API key isn't set up for this bot.");
                return await this.reply("error", "IP locate isn't set up for this bot, ask the bot administrator to set it up.");
            }
        }
    }), new ModuleCommand({
        name: "Steam User",
        description: "Get steam user information by their id.",
        emoji: "<:steam:" + config.emoji.steam + ">",
        versions: [
            new CommandVersion(["steam"], [
                new CommandArgument({
                    name: "id",
                    description: "The Steam ID to get.",
                    emoji: "🏷",
                    types: [new ArgumentType({
                        name: "Steam ID",
                        description: "A steam ID of a user.",
                        examples: ["ChimpStoreWorker"],
                        validate: /^\S+$/i
                    })]
                })
            ])
        ],
        example: "https://i.imgur.com/K27oU5B.gif",
        callback: async function GetSteamUser(message) {
            await this.reply("success", "Loading steam user information..");

            const steam = await fetch("https://playerdb.co/api/player/steam/" + encodeURIComponent(this.args.id.value));
            const json = await steam.json();

            if (json.code === "player.found") {
                if (json.data.player.meta.timecreated) { 
                    await this.edit("success", "Found user [" + json.data.player.meta.personaname  + "](" + json.data.player.meta.profileurl + ").", {
                        fields: [
                            {
                                title: "Steam ID",
                                body: `**Steam ID2:** ${json.data.player.meta.steam2id_new}
**Steam ID3:** ${json.data.player.meta.steam3id}
**Steam ID64:** ${json.data.player.meta.steam64id}`
                            },
                            {
                                title: "Joined",
                                body: new Date(json.data.player.meta.timecreated * 1000).toISOString()
                            },
                            ...(json.data.player.meta.realname ? [{
                                title: "Real Name",
                                body: json.data.player.meta.realname
                            }] : [])
                        ],
                        thumbnail: {
                            url: json.data.player.meta.avatarfull
                        }
                    });
                } else {
                    await this.edit("success", "Found user [" + json.data.player.meta.personaname  + "](" + json.data.player.meta.profileurl + ") (private).", {
                        fields: [
                            {
                                title: "Steam ID",
                                body: `**Steam ID2:** ${json.data.player.meta.steam2id_new}
**Steam ID3:** ${json.data.player.meta.steam3id}
**Steam ID64:** ${json.data.player.meta.steam64id}`
                            }
                        ],
                        thumbnail: {
                            url: json.data.player.meta.avatarfull
                        }
                    });
                }
            } else {
                return await this.edit("error", "Could not find steam account.");
            }
        }
    }),
    new ModuleCommand({
        name: "DDoS",
        description: "Send a DDoS attack to a user on the server.",
        emoji: "📡",
        versions: [
            new CommandVersion(["ddos"], [
                new CommandArgument({
                    name: "user",
                    description: "The user to DDoS.",
                    emoji: "👥",
                    types: [ArgumentType.Mention]
                })
            ])
        ],
        example: "https://i.imgur.com/ZHfsYfx.gif",
        callback: async function SendFakeDDoS(message) {
            if (ddos[message.guild.id]) {
                return await this.reply("error", "Please wait for the current attack to finish.");
            }

            ddos[message.guild.id] = true;
            
            const timeout = _=>new Promise($=>setTimeout($,_));
            const ran_ms = (a,b)=>Math.round(Math.random()*(b-a)+a);

            const orig_msg = await this.reply("success", "Configurating DDoS settings..");

            await timeout(ran_ms(750, 1000));

            await this.edit("success", "Resolving IP from last voice connection `(REGION=" + message.guild.region + ")`..", {
                fields: [
                    {
                        title: "User",
                        body: "<@" + this.args.user.value.user.id + ">",
                        inline: true
                    },
                    {
                        title: "ID",
                        body: this.args.user.value.user.id,
                        inline: true
                    }
                ]
            });

            await timeout(ran_ms(2000,6000));

            const random_ip = `${ran_ms(1,255)}.${ran_ms(1,255)}.${ran_ms(1,255)}.${ran_ms(1,255)}`;
            await this.edit("success", "Found IP address of user at `" + random_ip + "` (IPv4).", {
                fields: [
                    {
                        title: "User",
                        body: "<@" + this.args.user.value.user.id + ">",
                        inline: true
                    },
                    {
                        title: "ID",
                        body: this.args.user.value.user.id,
                        inline: true
                    },
                    {
                        title: "Resolved IP",
                        body: random_ip + "@" + message.guild.region + " (IPv4)"
                    }
                ]
            });

            await timeout(ran_ms(2000, 3000));

            const max_clients = 9500;

            const will_reach = ran_ms(7000, 9000);
            const num_stops = ran_ms(4, 6);
            let found = 0;

            for (let i = 0; i < num_stops; i++) {
                found += Math.round(will_reach / (num_stops + 1)) + ran_ms(-100, 100);
                
                await timeout(ran_ms(500, 2000));

                await this.edit("success", "Contacting botnet clients.. `(" + found + "/" + max_clients + ")`.", {
                    fields: [
                        {
                            title: "User",
                            body: "<@" + this.args.user.value.user.id + ">",
                            inline: true
                        },
                        {
                            title: "ID",
                            body: this.args.user.value.user.id,
                            inline: true
                        },
                        {
                            title: "Resolved IP",
                            body: random_ip + "@" + message.guild.region + " (IPv4)"
                        }
                    ]
                });
            }
            
            await timeout(ran_ms(500, 2000));

            await this.edit("success", "Contacted botnet clients. `(" + will_reach + "/" + max_clients + ")`.", {
                fields: [
                    {
                        title: "User",
                        body: "<@" + this.args.user.value.user.id + ">",
                        inline: true
                    },
                    {
                        title: "ID",
                        body: this.args.user.value.user.id,
                        inline: true
                    },
                    {
                        title: "Resolved IP",
                        body: random_ip + "@" + message.guild.region + " (IPv4)"
                    },
                    {
                        title: "Botnet Clients",
                        body: "Available: `" + will_reach + "`\nUnavailable: `" + (max_clients - will_reach) + "`"
                    }
                ]
            });
            
            await timeout(ran_ms(500, 2000));

            await this.edit("success", "Creating worker processes..", {
                fields: [
                    {
                        title: "User",
                        body: "<@" + this.args.user.value.user.id + ">",
                        inline: true
                    },
                    {
                        title: "ID",
                        body: this.args.user.value.user.id,
                        inline: true
                    },
                    {
                        title: "Resolved IP",
                        body: random_ip + "@" + message.guild.region + " (IPv4)"
                    },
                    {
                        title: "Botnet Clients",
                        body: "Available: `" + will_reach + "`\nUnavailable: `" + (max_clients - will_reach) + "`"
                    }
                ]
            });
            
            await timeout(ran_ms(750, 1000));

            const id = ran_ms(100, 999);
            
            await this.edit("success", "Establishing secure WebSocket (rfc6455) connection tunnel to botnet clients.. (Allow up to a minute)\n`(wss://" + message.guild.region + id + ".*.v1.weakeyes.dev)`", {
                fields: [
                    {
                        title: "User",
                        body: "<@" + this.args.user.value.user.id + ">",
                        inline: true
                    },
                    {
                        title: "ID",
                        body: this.args.user.value.user.id,
                        inline: true
                    },
                    {
                        title: "Resolved IP",
                        body: random_ip + "@" + message.guild.region + " (IPv4)"
                    },
                    {
                        title: "Botnet Clients",
                        body: "Available: `" + will_reach + "`\nUnavailable: `" + (max_clients - will_reach) + "`"
                    }
                ]
            });

            await timeout(ran_ms(15000, 65000));

            await this.edit("success", "Preparing for attack..", {
                fields: [
                    {
                        title: "User",
                        body: "<@" + this.args.user.value.user.id + ">",
                        inline: true
                    },
                    {
                        title: "ID",
                        body: this.args.user.value.user.id,
                        inline: true
                    },
                    {
                        title: "Resolved IP",
                        body: random_ip + "@" + message.guild.region + " (IPv4)"
                    },
                    {
                        title: "Botnet Clients",
                        body: "Available: `" + will_reach + "`\nUnavailable: `" + (max_clients - will_reach) + "`"
                    }
                ]
            });

            await timeout(ran_ms(2000, 5000));

            await this.edit("success", "Click the below reaction to initiate the attack. (30s)", {
                fields: [
                    {
                        title: "User",
                        body: "<@" + this.args.user.value.user.id + ">",
                        inline: true
                    },
                    {
                        title: "ID",
                        body: this.args.user.value.user.id,
                        inline: true
                    },
                    {
                        title: "Resolved IP",
                        body: random_ip + "@" + message.guild.region + " (IPv4)"
                    },
                    {
                        title: "Botnet Clients",
                        body: "Available: `" + will_reach + "`\nUnavailable: `" + (max_clients - will_reach) + "`"
                    }
                ]
            });            

            await this.replies[this.replies.length - 1].react("👍");

            const filter = (reaction, user) => reaction.emoji.name === "👍" && user.id === message.author.id
            const react = await this.replies[this.replies.length - 1].awaitReactions(filter, { max: 1, time: 30000 });
            
            await this.replies[this.replies.length - 1].reactions.removeAll();

            if (react.size) {
                await this.edit("success", "Begun DDoS attack successfully. Please allow up to 30 seconds to see noticable effects. Cleaning up..", {
                    fields: [
                        {
                            title: "User",
                            body: "<@" + this.args.user.value.user.id + ">",
                            inline: true
                        },
                        {
                            title: "ID",
                            body: this.args.user.value.user.id,
                            inline: true
                        },
                        {
                            title: "Resolved IP",
                            body: random_ip + "@" + message.guild.region + " (IPv4)"
                        },
                        {
                            title: "Botnet Clients",
                            body: "Available: `" + will_reach + "`\nUnavailable: `" + (max_clients - will_reach) + "`"
                        }
                    ]
                });
    
                await timeout(ran_ms(3000, 6000));
                
                await this.edit("success", "Begun DDoS attack successfully. Please allow up to 30 seconds to see noticable effects.");
            } else {
                await this.edit("error", "Attack was not confirmed. Cleaning up..", {
                    fields: [
                        {
                            title: "User",
                            body: "<@" + this.args.user.value.user.id + ">",
                            inline: true
                        },
                        {
                            title: "ID",
                            body: this.args.user.value.user.id,
                            inline: true
                        },
                        {
                            title: "Resolved IP",
                            body: random_ip + "@" + message.guild.region + " (IPv4)"
                        },
                        {
                            title: "Botnet Clients",
                            body: "Available: `" + will_reach + "`\nUnavailable: `" + (max_clients - will_reach) + "`"
                        }
                    ]
                });
                
                await timeout(ran_ms(3000, 6000));
                
                await this.edit("success", "Attack was not confirmed.");
            }
            
            ddos[message.guild.id] = false;
        }
    }), 
    new ModuleCommand({
        name: "Lichess User",
        description: "Get information about a user on lichess.",
        emoji: "<:lichess:" + config.emoji.lichess + ">",
        versions: [
            new CommandVersion(["liuser"], [
                new CommandArgument({
                    name: "user",
                    description: "The lichess user to get.",
                    emoji: "🏷",
                    types: [ArgumentType.Mention]
                })
            ]),
            new CommandVersion(["liuser"], [
                new CommandArgument({
                    name: "user",
                    description: "The lichess user to get.",
                    emoji: "🏷",
                    types: [ArgumentType.Any],
                    optional: true,
                    default: ""
                })
            ])
        ],
        example: "https://i.imgur.com/P1GEO5b.gif",
        callback: async function GetLichessUser(message) {
            const service = client.AccountService;

            const account = this.args.user?.type === ArgumentType.Mention ?
                await service.getAccount(this.args.user.value.user) :
                await service.getAccount(message.author);

            const username = this.args.user?.type === ArgumentType.Any ? this.args.user.value : null;

            if (!username && !account.connections.lichess) {
                if (!this.args.user) {
                    return await this.reply("error", "You do not have a lichess account connected. [Click here to link your account](" + process.env.BASE_API + "/account/connections/lichess)");
                } else {
                    return await this.reply("error", "That user does not have a lichess account connected.");
                }
            }

            try {
                const client = new lichess.Client(await account.connections.lichess?.token());
                const user = await client.getUser(username);

                return await this.reply("success", "User profile for [@" + user.username + "](" + lichess.Client.BASE_URL + "/@/" + user.id + ").", {
                    fields: [
                        {
                            title: "Join Date",
                            body: new Date(user.createdAt).toISOString(),
                            inline: true
                        },
                        {
                            title: p(user.followers, "follower"),
                            body: "Following: " + user.following,
                            inline: true
                        },
                        {
                            title: "Ratings",
                            body: `
**Blitz:** ${user.perfs.blitz.rating}
**Bullet:** ${user.perfs.bullet.rating}
**Correspondence:** ${user.perfs.correspondence.rating}
**Classical:** ${user.perfs.classical.rating}
**Rapid:** ${user.perfs.rapid.rating}
`.trim()
                        },
                        ...(user.profile?.links ? [{
                            title: "Social links",
                            body: user.profile.links.map(link => /^https?\:\/\//.test(link) ? link : "https://" + link).join("\n"),
                            inline: true
                        }] : []),
                        ...(user.profile?.country ? [{
                            title: "Country",
                            body: user.profile.country,
                            inline: true
                        }] : [])
                    ]
                });
            } catch (e) {
                if (e.status === 429) {
                    return await this.reply("error", "Could not get user, please wait a few minutes.");
                } else if (e.status === 404 || e.status === 401) {
                    if (!username && !this.args.user) {
                        delete account.connections.lichess;

                        await account.save();
                    } else {
                        return await this.reply("error", "Could not find user.");
                    }
                } else {
                    console.log(e);

                    return await this.reply("error", "Could not get user, please try again later");
                }
            }
        }
    }),
    new ModuleCommand({
        name: "Chess Opening",
        description: "Get a chess opening, moves to play and it's setup.",
        emoji: "<:horsey:" + config.emoji.horsey + ">",
        versions: [
            new CommandVersion(["opening"], [
                new CommandSyntax("random")
            ]),
            new CommandVersion(["opening"], [
                new CommandArgument({
                    name: "opening",
                    description:" The name of the opening to get.",
                    emoji: "<:pawn:" + config.emoji.pawn + ">",
                    types: [ArgumentType.Text]
                })
            ])
        ],
        example: "https://i.imgur.com/H6OzEPp.gif",
        callback: async function GetChessOpening(message) {
            const openings = JSON.parse(await fs.readFile("lib/openings.json"));

            const next = async item => {
                const complete_game = new chess.Chess;
                const cgame = new chess.Chess;
                const sloppy_moves = item.moves.split(" ");

                for (let i = 0; i < sloppy_moves.length; i++) {
                    complete_game.move(sloppy_moves[i], { sloppy: true });
                }

                const moves = complete_game.history();

                let cur_move = 0;

                // https://github.com/jhlywa/chess.js/issues/174
                const get_piece_position = (type, color) => {
                    return [].concat(...cgame.board()).map((p, index) => {
                        if (p !== null && p.type === type && p.color === color) {
                            return index;
                        }
                    }).filter(Number.isInteger).map((piece_index) => {
                        const row = "abcdefgh"[piece_index % 8];
                        const column = Math.ceil((64 - piece_index) / 8);

                        return row + column;
                    })[0] || null;
                }

                const display_board = async nextmove => {
                    const history = cgame.history({ verbose: true });
                    const last = history[history.length - 1];
                    const lastmove = last ? last.from + last.to : null;

                    return await this.edit("success", "[" + item.eco + "](https://chessopenings.com/eco/" + item.eco + ") [" + item.name + "](https://lichess.org/analysis/standard/" + encodeURIComponent(complete_game.fen()) + "/white)", {
                        fields: [
                            {
                                title: "Moves",
                                body: "`" + ChunkArr(moves.map((move, i) => (i + 1) === cur_move ? "*" + move + "*" : "" || move), 2).map((turn, i) => ++i + ". " + turn.join(" ")).join(", ") + "`"
                            },
                            {
                                title: "FEN",
                                body: "`" + complete_game.fen() + "`"
                            }
                        ],
                        image: {
                            url: "https://backscattering.de/web-boardimage/board.png?fen=" + encodeURIComponent(cgame.fen()) +
                                (lastmove ? "&lastMove=" + lastmove : "") +
                                (nextmove ? "&arrows=" + nextmove : "") +
                                (cgame.in_check() ? "&check=" + (last.color === "w" ? get_piece_position("k", "b") :  get_piece_position("k", "w")) : "") +
                                "&orientation=" + (moves.length % 2 ? "white" : "black")
                        }
                    });
                }

                function update_move(reaction) {
                    let success = false;

                    if (reaction.emoji.name === "◀") {
                        success = cgame.undo();

                        cur_move = --cur_move >= 0 ? cur_move : 0; // Clamp the page number.
                    } else if (reaction.emoji.name === "▶") {
                        success = cgame.move(moves[cur_move], { sloppy: true });

                        cur_move = ++cur_move <= moves.length ? cur_move : moves.length;
                    } else if (reaction.emoji.name === "⏪") {
                        while (cur_move > 0) {
                            success = cgame.undo();

                            --cur_move;
                        }
                    } else if (reaction.emoji.name === "⏩") {
                        for (; cur_move < moves.length; cur_move++) {
                            success = cgame.move(moves[cur_move], { sloppy: true });
                        }
                    }
                    
                    if (success) {
                        display_board(sloppy_moves[cur_move]);
                    }
                }

                const msg = await display_board(sloppy_moves[0]);

                msg.react("⏪");
                msg.react("◀");
                msg.react("▶");
                msg.react("⏩");

                const collector = msg.createReactionCollector((reaction, user) => { // Wait for ◀ and ▶ emoji reactions to change page.
                    return (reaction.emoji.name === "◀" ||
                        reaction.emoji.name === "▶" ||
                        reaction.emoji.name === "⏪" ||
                        reaction.emoji.name === "⏩") && user.id === this.message.author.id;
                }, { idle: 60000, dispose: true });

                collector.on("collect", update_move);
                collector.on("remove", update_move);

                collector.on("end", async () => {
                    await msg.reactions.removeAll();
                });
            }

            if (this.args.random) {
                return await next(openings[Math.floor(Math.random() * openings.length - 1)]);
            } else {
                const search_term = this.args.opening.value;

                const fuse = new Fuse(openings, {
                    keys: ["eco", "name"],
                    threshold: 0.4
                });

                const items = fuse.search(search_term);

                if (items.length) {
                    const { item } = items[0];

                    if (item) {
                        return await next(item);
                    }
                } else {
                    return await this.reply("error", "Could not find an opening by that name.");
                }
            }
        }
    }),
    new ModuleCommand({
        name: "Search openings",
        description: "Search chess openings by it's ECO or by it's name.",
        emoji: "<:horsey:" + config.emoji.horsey + ">",
        versions: [
            new CommandVersion(["openings"], [
                new CommandArgument({
                    name: "opening",
                    description:" The name of the opening to get.",
                    emoji: "<:pawn:" + config.emoji.pawn + ">",
                    types: [ArgumentType.Text]
                })
            ])
        ],
        example: "https://i.imgur.com/SjmgyPs.gif",
        callback: async function GetChessOpening(message) {
            const openings = JSON.parse(await fs.readFile("lib/openings.json"));
            const search_term = this.args.opening.value;

            const fuse = new Fuse(openings, {
                keys: ["eco", "name"],
                threshold: 0.4
            });

            const items = fuse.search(search_term);

            if (items.length) {
                const top_25 = items.map(i => i.item).slice(0, 25);

                return await this.createPages("success", "Found " + p(top_25.length + (items.length > 25 ? "+" : 0), "opening") + " by that name" + (items.length > 25 ? ", here are the top 25" : "") + ".", top_25.map(opening => {
                    const complete_game = new chess.Chess;
                    const sloppy_moves = opening.moves.split(" ");

                    for (let i = 0; i < sloppy_moves.length; i++) {
                        complete_game.move(sloppy_moves[i], { sloppy: true });
                    }

                    const moves = complete_game.history();

                    return {
                        title: opening.eco + " " + opening.name,
                        body: "`" + ChunkArr(moves, 2).map((turn, i) => ++i + ". " + turn.join(" ")).join(", ") + "`"
                    }
                }));
            } else {
                return await this.reply("error", "Could not find any openings by that name.");
            }
        }
    }),
    new ModuleCommand({
        name: "Dictionary",
        description: "Get dictionary definitions and synonyms.",
        emoji: "📚",
        versions: [
            new CommandVersion(["dictionary", "define", "dict"], [
                new CommandArgument({
                    name: "word",
                    description: "The word to get the definition of.",
                    emoji: "✒",
                    types: [ArgumentType.Text]
                })
            ])
        ],
        example: "https://i.imgur.com/IEE5RsU.gif",
        callback: async function DictionaryDefinition(message) {
            const res = await fetch("https://api.dictionaryapi.dev/api/v1/entries/en/" + encodeURIComponent(this.args.word.value));

            if (res.status === 200) {
                const json = await res.json();

                if (json.title !== "No Definitions Found" && Object.entries(json[0].meaning).length) {
                    const meanings = Object.entries(json[0].meaning).map(([partofspeech, meanings]) => {
                        return meanings.map(definition => {
                            return {
                                partofspeech,
                                definition: definition.definition,
                                example: definition.example,
                                synonyms: definition.synonyms
                            }
                        })
                    }).flat();

                    await this.createPages("success", "There " + is(meanings.length) + " " + p(meanings.length, "definition") + " for `" + this.escape_c(this.args.word.value) + (json[0].phonetics.some(phonetic => phonetic.text) ? "` (`" + json[0].phonetics.filter(phonetic => phonetic.text).map(phonetic => {
                        return phonetic.text;
                    }).join(", ") + "`)" : "`"),
                        meanings.map(meaning => {
                            return {
                                title: "As a" + (/[aeiou]/.test(meaning.partofspeech[0]) ? "n " : " ") + meaning.partofspeech,
                                body: this.escape(meaning.definition) + (meaning.synonyms ? "\n**Synonyms: **`" + meaning.synonyms.join(", ") + "`" : "")
                            }
                        }), {
                            footer: "Definitions provided by dictionaryapi.dev"
                        });
                } else {
                    return await this.reply("error", "There are no definitions for `" + this.escape_c(this.args.word.value) + "`.");
                }
            } else {
                return await this.reply("error", "Could not get definition.");
            }
        }
    }),
    new ModuleCommand({
        name: "Urban Dictionary",
        description: "Get an urban dictionary definition.",
        emoji: "📚",
        versions: [
            new CommandVersion(["urban", "udict"], [
                new CommandArgument({
                    name: "word",
                    description: "The word to get the definition of. Omit to get a random definition.",
                    emoji: "✒",
                    types: [ArgumentType.Text],
                    optional: true
                })
            ])
        ],
        example: "https://i.imgur.com/8QYUEFG.gif",
        callback: async function UrbanDictionaryDefinition(message) {
            if (this.args.word) {
                try {
                    const definitions = await urban.getDefinitions(this.args.word.value);

                    await this.createPages("success", "Here " + is(definitions.length) + " the top " + p(definitions.length, "definition") + " for `" + this.escape_c(this.args.word.value) + "` ",
                        definitions.map(item => {
                            const definition = this.escape(item.definition).replace(/\[.+?\]/g, word => {
                                const term = word.substring(1, word.length - 1);

                                return "[**" + term + "**](https://www.urbandictionary.com/define.php?term=" + encodeURIComponent(term) + ")"
                            });

                            const example = ("_" + this.escape(item.example) + "_").replace(/\[.+?\]/g, word => {
                                const term = word.substring(1, word.length - 1);

                                return "[**" + term + "**](https://www.urbandictionary.com/define.php?term=" + encodeURIComponent(term) + ")"
                            });

                            let def = definition + "\n\n" + example;

                            if (def.length > 900) {
                                def = def.substr(0, 900);
                                
                                if (def.length > definition.length + 4) {
                                    def += "_";
                                }

                                def += "...";

                                def = def.replace(/ ?\[[^\]]+\]\([^\)_]+_(?=(\.\.\.))/, "_");
                                def = def.replace(/ ?\[[^\]]+\]\([^\)_]+(?=(\.\.\.))/, "");
                            }
                            
                            def += "\n\n[Read on Urban Dictionary](" + item.permalink + ")";

                            return {
                                title: "\"" + item.word + "\" - " + item.author + " (" + new Date(item.written_on).toLocaleDateString() + ")",
                                body: def + "\n\n" + "👍 `" + item.thumbs_up + "`  👎 `" + item.thumbs_down + "`"
                            }
                    }), {
                        per: 1
                    });
                } catch (e) {
                    if (e.code === 404) {
                        return await this.reply("error", "Could not find any definitions for `" + this.escape_c(this.args.word.value) + "`.");
                    } else {
                        return await this.reply("error", "Could not get definitions. Please try again later.");
                    }
                }
            } else {
                try {
                    const item = await urban.getRandom();

                    const definition = this.escape(item.definition).replace(/\[.+?\]/g, word => {
                        const term = word.substring(1, word.length - 1);

                        return "[**" + term + "**](https://www.urbandictionary.com/define.php?term=" + encodeURIComponent(term) + ")"
                    });

                    const example = ("_" + this.escape(item.example) + "_").replace(/\[.+?\]/g, word => {
                        const term = word.substring(1, word.length - 1);

                        return "[**" + term + "**](https://www.urbandictionary.com/define.php?term=" + encodeURIComponent(term) + ")"
                    });

                    let def = definition + "\n\n" + example;

                    if (def.length > 900) {
                        def = def.substr(0, 900);
                        
                        if (def.length > definition.length + 4) {
                            def += "_";
                        }

                        def += "...";

                        def = def.replace(/ ?\[[^\]]+\]\([^\)_]+_(?=(\.\.\.))/, "_");
                        def = def.replace(/ ?\[[^\]]+\]\([^\)_]+(?=(\.\.\.))/, "");
                    }
                    
                    def += "\n\n[Read on Urban Dictionary](" + item.permalink + ")";


                    await this.reply("success", "", {
                        fields: [{
                            title: "\"" + item.word + "\" - " + item.author + " (" + new Date(item.written_on).toLocaleDateString() + ")",
                            body: def + "\n\n" + "👍 `" + item.thumbs_up + "`  👎 `" + item.thumbs_down + "`"
                        }]
                    });
                } catch (e) {
                    if (e.status === 404) {
                        return await this.reply("error", "Could not find any definitions for `" + this.escape_c(this.args.word.value) + "`.");
                    } else {
                        return await this.reply("error", "Could not get definitions. Please try again later.");
                    }
                }
            }
        }
    }),
    new ModuleCommand({
        name: "Diabotical stats",
        description: "Get stats for a player on diabotical.",
        emoji: "<:diabotical:" + config.emoji.diabotical + ">",
        versions: [
            new CommandVersion(["diabotical", "diab", "dbt"], [
                new CommandArgument({
                    name: "player",
                    description: "The player to get the stats of.",
                    emoji: "🏷",
                    types: [ArgumentType.Text],
                    optional: false
                }),
                new CommandSyntax("matches", true)
            ])
        ],
        callback: async function DiaboticalStats(message) {
            this.reply("info", "Loading stats..");

            if (this.args.player) {
                if (this.args.matches) {
                    
                } else {
                    try {
                        const player = await diabotical.getPlayer(this.args.player.value);
                        const stats = await diabotical.getStats(this.args.player.value);

                        const alltime = stats.alltime.overview.all;

                        return await this.edit("success", "Found player **" + this.escape(player.name) + "** " + (player.country ? ":flag_" + player.country + ":" : "") + ".", {
                            fields: [
                                {
                                    title: "All time",
                                    body: `
**Frags**: \`${fmt(alltime.frags)}\`
**Assists**:  \`${fmt(alltime.assists)}\`
**Deaths**:  \`${fmt(alltime.deaths)}\`
**Matches played**: \`${fmt(alltime.match_count)}\`
**Winrate**: \`${(alltime.match_lost / alltime.match_count * 100).toFixed(2)}%\`
**Most played mode**:
`.trim(),
                                }
                            ],
                            thumbnail: {
                                url: player.avatarURL
                            }
                        });
                    } catch (e) {
                        if (e.code === 404) {
                            this.edit("error", "Couldn't find stats for **" + this.args.player.value + "**.");
                        } else {
                            this.edit("error", "Couldn't get stats for **" + this.args.player.value + "**, please try again later.");
                        }
                    }
                }
            }
        }
    }),
    new ModuleCommand({
        name: "Hyperscape",
        description: "Get stats for a player on hyperscape.",
        emoji: "<:hyperscape:" + config.emoji.hyperscape + ">",
        example: "https://i.imgur.com/RcunoVk.gif",
        versions: [
            new CommandVersion(["hyperscape", "hsstats", "hs"], [
                new CommandArgument({
                    name: "platform",
                    description: "The platform of the player.",
                    emoji: "🖥",
                    types: [ArgumentType.Platform],
                    optional: true,
                    default: "pc"
                }),
                new CommandArgument({
                    name: "name",
                    description: "The name or ID of the player.",
                    emoji: "🏷",
                    types: [ArgumentType.Text]
                }),
                new CommandSyntax("compare"),
                new CommandArgument({
                    name: "platform2",
                    description: "The platform of the second player.",
                    emoji: "🖥",
                    types: [ArgumentType.Platform],
                    optional: true,
                    default: "pc"
                }),
                new CommandArgument({
                    name: "name2",
                    description: "The name or ID of the second player.",
                    emoji: "🏷",
                    types: [ArgumentType.Text]
                }),
                new CommandSyntax("lifetime", true)
            ]),
            new CommandVersion(["hyperscape", "hsstats", "hs"], [
                new CommandArgument({
                    name: "platform",
                    description: "The platform of the player.",
                    emoji: "🖥",
                    types: [ArgumentType.Platform],
                    optional: true,
                    default: "pc"
                }),
                new CommandArgument({
                    name: "name",
                    description: "The name or ID of the player.",
                    emoji: "🏷",
                    types: [ArgumentType.Text]
                })
            ])
        ],
        callback: async function HyperscapeStats(message) {
            if (this.args.compare) {
                try {
                    await this.reply("info", "Comparing stats for **" + this.args.name.value + "** and **" + this.args.name2.value + "**");

                    const next = async (id1, id2) => {
                        const player1 = await hyperscape.getStats(id1);
                        const player2 = await hyperscape.getStats(id2);

                        const stats1 = player1.stats;
                        const stats2 = player2.stats;

                        function format_compare_stat(stat, name, rev, nofmt) {
                            /*if (stat === "damage_per_match") {
                                one[stat] = one.damage_done / one.matches;
                                two[stat] = two.damage_done / two.matches;
                                
                                const is_bold = one[stat] > two[stat];

                                const diff = parseFloat(one[stat]) - parseFloat(two[stat]);

                                return (is_bold ? "**" : "") + name + (is_bold ? "**: " : ": ") +
                                    `\`${parseFloat(one[stat]).toFixed(2)}\` (\`${(diff < 0 ? "-" : "+") + Math.abs(diff).toFixed(2)}\`)`
                            }

                            if (stat === "kd") {
                                const is_bold = parseFloat(one[stat]) > parseFloat(two[stat]);

                                const diff = parseFloat(one[stat]) - parseFloat(two[stat]);

                                return (is_bold ? "**" : "") + name + (is_bold ? "**: " : ": ") +
                                    `\`${parseFloat(one[stat]).toFixed(2)}\` (\`${(diff < 0 ? "-" : "+") + Math.abs(diff).toFixed(2)}\`)`
                            }
                            
                            const is_bold = one[stat] > two[stat];

                            const diff = one[stat] - two[stat];

                            return (is_bold ? "**" : "") + name + (is_bold ? "**: " : ": ") +
                                `\`${fmt(one[stat])}\` (\`${(diff < 0 ? "-" : "+") + fmt(Math.abs(diff).toFixed(2))}\`)`*/

                            if (stat === "kd") {
                                const is_bold = parseFloat(rev ? stats2[stat] : stats1[stat]) > parseFloat(rev ? stats1[stat] : stats2[stat]);

                                const diff = (parseFloat(stats2[stat] > stats1[stat] ? stats2[stat] : stats1[stat]) / parseFloat(stats2[stat] > stats1[stat] ? stats1[stat] : stats2[stat])) * 100 - 100;

                                return (is_bold ? "**" : "") + name + (is_bold ? "**: " : ": ") +
                                    `\`${parseFloat(rev ? stats2[stat] :  stats1[stat]).toFixed(2)}\`${rev ? " (`" + (is_bold ? "+" : "-") + Math.abs(diff).toFixed(2) + "%`)" : ""}`
                            }
                            
                            const is_bold = rev ? stats2[stat] > stats1[stat] : stats1[stat] > stats2[stat];

                            const diff = (stats2[stat] > stats1[stat] ? stats2[stat] / stats1[stat] : stats1[stat] / stats2[stat]) * 100 - 100;

                            return (is_bold ? "**" : "") + name + (is_bold ? "**: " : ": ") +
                                `\`${nofmt ? (rev ? stats2[stat] : stats1[stat]).toFixed(2) : fmt(rev ? stats2[stat] : stats1[stat])}\`${rev ? " (`" + (is_bold ? "+" : "-") + Math.abs(diff).toFixed(2) + "%`)" : ""}`
                        }

                        if (this.args.lifetime) {
                            return await this.edit("success", "Stats for **" + player1.profile.name + "** compared to **" + player2.profile.name + "**", {
                                fields: [
                                    {
                                        title: player1.profile.name,
                                        body: `
${format_compare_stat("wins", "Wins")}
${format_compare_stat("solo_wins", "Solo wins")}
${format_compare_stat("squad_wins", "Squad wins")}
${format_compare_stat("matches", "Matches played")}
${format_compare_stat("solo_matches", "Solo matches played")}
${format_compare_stat("squad_matches", "Squad matches played")}
${format_compare_stat("kills", "Kills")}
${format_compare_stat("assists", "Assists")}
${format_compare_stat("revives", "Revives")}
${format_compare_stat("damage_done", "Damage dealt")}
${format_compare_stat("chests_broken", "Chests opened")}
${format_compare_stat("fusions", "Fusions")}
`.trim(),
                                        inline: true
                                    },
                                    {
                                        title: player2.profile.name,
                                        body: `
${format_compare_stat("wins", "Wins", true)}
${format_compare_stat("solo_wins", "Solo wins", true)}
${format_compare_stat("squad_wins", "Squad wins", true)}
${format_compare_stat("matches", "Matches played", true)}
${format_compare_stat("solo_matches", "Solo matches played", true)}
${format_compare_stat("squad_matches", "Squad matches played", true)}
${format_compare_stat("kills", "Kills", true)}
${format_compare_stat("assists", "Assists", true)}
${format_compare_stat("revives", "Revives", true)}
${format_compare_stat("damage_done", "Damage dealt", true)}
${format_compare_stat("chests_broken", "Chests opened", true)}
${format_compare_stat("fusions", "Fusions", true)}
    `.trim(),
                                        inline: true
                                    }
                                ]
                            });
                        } else {
                            return await this.edit("success", "Per-match stats for **" + player1.profile.name + "** compared to **" + player2.profile.name + "**", {
                                fields: [
                                    {
                                        title: player1.profile.name + " (" + p(player1.stats.matches, "match", "matches") + ", " + p(player1.stats.wins, "win") + ")",
                                        body: `
${format_compare_stat("kills_per_match", "Kills per match", false, true)}
${format_compare_stat("assists_per_match", "Assists per match", false, true)}
${format_compare_stat("damage_per_match", "Damage per match", false, true)}
${format_compare_stat("headshot_damage_per_match", "Headshot damage per match", false, true)}
${format_compare_stat("chests_per_match", "Chests per match", false, true)}
${format_compare_stat("fusions_per_match", "Fusions per match", false, true)}
`.trim(),
                                        inline: true
                                    },
                                    {
                                        title: player2.profile.name + " (" + p(player2.stats.matches, "match", "matches") + ", " + p(player2.stats.wins, "win") + ")",
                                        body: `
${format_compare_stat("kills_per_match", "Kills per match", true, true)}
${format_compare_stat("assists_per_match", "Assists per match", true, true)}
${format_compare_stat("damage_per_match", "Damage per match", true, true)}
${format_compare_stat("headshot_damage_per_match", "Headshot damage per match", true, true)}
${format_compare_stat("chests_per_match", "Chests per match", true, true)}
${format_compare_stat("fusions_per_match", "Fusions per match", true, true)}
    `.trim(),
                                        inline: true
                                    }
                                ]
                            });
                        }
                    }

                    let id1 = "";
                    if (await ArgumentType.UUIDv4.validate(message, this.args.name.value)) {
                        id1 = this.args.name.value;
                    } else {
                        try {
                            const platform = this.args.platform.value;
                            const parsed_platform = platform === "pc" || platform === "uplay" ? "uplay" : platform === "xbl" || platform === "xbox" ? "xbl" : platform === "psn" || platform === "ps" ? "psn" : "uplay";

                            const profile = await hyperscape.getUser(parsed_platform, this.args.name.value);

                            id1 = profile.id;
                        } catch (e) {
                            if (e === 404) {
                                return await this.edit("error", "Could not find profile of player 1.");
                            } else {
                                return await this.edit("error", "Could not get profile of player 1, please try again later.");
                            }
                        }
                    }
                    
                    let id2 = "";
                    if (await ArgumentType.UUIDv4.validate(message, this.args.name2.value)) {
                        id2 = this.args.name2.value;
                    } else {
                        try {
                            const platform = this.args.platform.value;
                            const parsed_platform = platform === "pc" || platform === "uplay" ? "uplay" : platform === "xbl" || platform === "xbox" ? "xbl" : platform === "psn" || platform === "ps" ? "psn" : "uplay";

                            const profile = await hyperscape.getUser(parsed_platform, this.args.name2.value);

                            id2 = profile.id;
                        } catch (e) {
                            if (e === 404) {
                                return await this.edit("error", "Could not find profile of player 2.");
                            } else {
                                return await this.edit("error", "Could not get profile of player 2, please try again later.");
                            }
                        }
                    }

                    return await next(id1, id2);
                } catch (e) {
                    if (e === 404) {
                        return await this.edit("error", "Could not get stats.");
                    } else {
                        console.log(e);
                        return await this.edit("error", "Could not get stats, please try again later.");
                    }
                }
            } else {
                await this.reply("info", "Loading stats for **" + (this.args.id?.value || this.args.name.value) + "**");

                const next = async id => {
                    try {
                        const user = await hyperscape.getStats(id);

                        const stats = user.stats;

                        const best_weapon = Object.values(stats.weapons).sort((a, b) => (b.kills * b.damage) - (a.kills * a.damage))[0].name;
                        const most_used_weapon = Object.values(stats.weapons).sort((a, b) => b.fusions - a.fusions)[0].name;
                        const most_used_hack = Object.values(stats.hacks).sort((a, b) => b.fusions - a.fusions)[0].name;

                        return await this.edit("success", "Stats for **" + user.profile.name + "** on " + user.profile.platform + ".", {
                            fields: [
                                {
                                    title: "ID",
                                    body: "`" + user.profile.id + "`"
                                },
                                {
                                    title: "Time Played",
                                    body: "**Total**: `" + stats.time_played + "`\n**Solo**: `" + stats.solo_time_played + "`\n**Squads**: `" + stats.squad_time_played + "`",
                                    inline: true
                                },
                                {
                                    title: "Overview",
                                    body: `
**Wins**: \`${fmt(stats.wins)}\` (${(stats.winrate * 100).toFixed(2)}%)
**Solo wins**: \`${fmt(stats.solo_wins)}\` (${(stats.solo_winrate * 100).toFixed(2)}%)
**Squad wins**: \`${fmt(stats.squad_wins)}\` (${(stats.squad_winrate * 100).toFixed(2)}%)
**Games played**: \`${fmt(stats.matches)}\`
**Kills**: \`${fmt(stats.kills)}\` (KD \`${stats.kd}\`)
**Assists**: \`${fmt(stats.assists)}\`
**Revives**: \`${fmt(stats.revives)}\`
**Damage dealt**: \`${fmt(stats.damage_done)}\`
**Chests opened**: \`${fmt(stats.chests_broken)}\`
**Fusions**: \`${fmt(stats.fusions)}\`
**Best weapon**: ${best_weapon}
**Most used weapon**: ${most_used_weapon}
**Most used hack**: ${most_used_hack}
`.trim(),
                                    inline: true
                                },
                                {
                                    title: "Career Bests",
                                    body: `
**Kills**: \`${fmt(stats.career_bests.kills)}\`
**Assists**: \`${fmt(stats.career_bests.assists)}\`
**Revives**: \`${fmt(stats.career_bests.revives)}\`
**Chests**: \`${fmt(stats.career_bests.chests)}\`
**Damage**: \`${fmt(stats.career_bests.damage_done)}\`
**Fusions**: \`${fmt(stats.career_bests.item_fused)}\`
**Max Fusions**: \`${fmt(stats.career_bests.fused_to_max)}\`
**Survival Time**: \`${fmt(stats.career_bests.survival_time)} mins\`
`.trim(),
                                    inline: true
                                }
                            ],
                            footer: "Stats provided by tabstats.com"
                        })
                    } catch (e) {
                        if (e === 404) {
                            return await this.edit("error", "Could not get stats of that player.");
                        } else {
                            console.log(e);
                            return await this.edit("error", "Could not get stats, please try again later.");
                        }
                    }
                }

                if (await ArgumentType.UUIDv4.validate(message, this.args.name.value)) {
                    return next(this.args.name.value);
                } else {
                    try {
                        const platform = this.args.platform.value;
                        const parsed_platform = platform === "pc" || platform === "uplay" ? "uplay" : platform === "xbl" || platform === "xbox" ? "xbl" : platform === "psn" || platform === "ps" ? "psn" : "uplay";

                        const profile = await hyperscape.getUser(parsed_platform, this.args.name.value);

                        return await next(profile.id);
                    } catch (e) {
                        if (e === 404) {
                            return await this.edit("error", "Could not find profile of that player.");
                        } else {
                            return await this.edit("error", "Could not get profile, please try again later.");
                        }
                    }
                }
            }
        }
    }),
    new ModuleCommand({
        name: "Javascript",
        description: "Run Javascript in a secure Deno environment limited to 30s of runtime.",
        emoji: "<:javascript:" + config.emoji.javascript + ">",
        versions: [
            new CommandVersion(["js", "eval", "exec"], [
                new CommandArgument({
                    name: "code",
                    description: "The code to execute. Can be a code block (```) with any highlighting.",
                    emoji: "📝",
                    types: [ArgumentType.Rest]
                })
            ])
        ],
        delay: 15000,
        example: "https://i.imgur.com/mqdubgi.gif",
        callback: async function SecureJavascript(message) {
            try {
                if (evals[message.guild.id]) {
                    return await this.reply("error", "Process already running in this server.");
                }
                
                evals[message.guild.id] = true;

                const code = this.args.code.value.replace(/^```.+\s*\n/, "").replace(/\n?```$/, "").replace(/import .+ *(;|\n?)/mgi, "");
                
                const r = await this.reply("info", "Preparing process...");
    
                const id = randomstring.generate({
                    length: 6,
                    charset: "alphabet",
                    capitalization: "uppercase"
                });

                await fs.writeFile(path.resolve("tmp", id + ".js"), code, "utf-8");

                const proc = child_process.spawn("deno", ["run", path.resolve("tmp", id + ".js")], {
                    env: {
                        ...process.env,
                        NO_COLOR: 1
                    }
                });

                r.react("❌");
                r.awaitReactions((reaction, user) => reaction.emoji.name === "❌" && user.id === message.author.id, { max: 1 }).then(() => proc.kill());

                let has_ended = false;
                let out = "$ Process started\n";
                let last_time = 0;
                let last_timeout = null;

                const update = () => {
                    return new Promise(resolve => {
                        const now = Date.now();

                        if (now > last_time + 1000) {
                            const lines = out.replace(new RegExp("file\:\/\/\/.+?/" + id, "g"), id).split("\n");
                            
                            last_time = now;
        
                            this.edit("success", "Code: **" + id + "**\n```\n" + lines.slice(lines.length - 25).join("\n") + "```", {
                                footer: has_ended ? "Process has ended." : ""
                            }).then(resolve);
                        } else {
                            if (last_timeout) {
                                clearTimeout(last_timeout);

                                last_timeout = setTimeout(async () => {
                                    await update();

                                    resolve();
                                }, (last_time + 1000) - now);
                            } else {
                                last_timeout = setTimeout(async () => {
                                    await update();

                                    resolve();
                                }, (last_time + 1000) - now);
                            }
                        }
                    });
                }

                update();

                proc.stdout.on("data", chunk => {
                    out += chunk.toString();

                    if (out.length > 1024) {
                        out = out.substr(out.length - 1024);
                    }

                    update();
                });

                proc.stderr.on("data", chunk => {
                    // out += chunk.toString().replace(/(?<=\")(([A-Z]\:(\\|\/))|\/)([^/\\:*?"<>|\n](\\|\/)?)*/g, id + ".js");
                    out += chunk.toString().replace(/read access to \".+?\"/g, "read access");

                    if (out.length > 1024) {
                        out = out.substr(out.length - 1024);
                    }

                    update();
                });

                proc.on("error", async err => {
                    evals[message.guild.id] = false;

                    proc.kill(1);

                    return await this.edit("error", "An error occurred during runtime. " + (err.code ? "`" + err.code + "`" : ""));
                });

                proc.on("exit", async code => {
                    has_ended = true;

                    out = out.trim();
                    out += "\n\n$ Process exited (code " + (code || 0) + ")";

                    r.reactions.removeAll();

                    await update(out);
                    await fs.unlink(path.resolve("tmp", id + ".js"));
                    
                    evals[message.guild.id] = false;
                });

                setTimeout(async () => {
                    if (!has_ended) {
                        proc.kill(0);
                    }
                }, 30000);
            } catch (e) {
                evals[message.guild.id] = false;

                console.log(e);

                return await this.edit("error", "Could not create sandbox file.");
            }
        },
        beta: true
    }), 
    new ModuleCommand({
        name: "Wikipedia",
        description: "Get the first 2 sentences from an article on wikipedia.",
        emoji: "<:wikipedia:" + config.emoji.wikipedia + ">",
        versions: [
            new CommandVersion(["wikipedia", "wiki", "wp"], [
                new CommandArgument({
                    name: "article",
                    description: "The name of the article to get.",
                    emoji: "📜",
                    types: [ArgumentType.Text]
                })
            ])
        ],
        callback: async function Wikipedia(message) {
            const pageres = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(this.args.article.value));
            const mediares = await fetch("https://en.wikipedia.org/api/rest_v1/page/media-list/" + encodeURIComponent(this.args.article.value));

            const pagejson = pageres.status === 200 ?  await pageres.json() : null;
            const mediajson = mediares.status === 200 ? await mediares.json() : null;

            if (pagejson) {
                const image = mediajson.items?.[0]?.srcset?.[0]?.src ?
                    "https:" + mediajson.items?.[0]?.srcset?.[0]?.src
                    : null;

                const extract = pagejson.extract.length > 800 ? pagejson.extract.substr(0, 800) + "..." : pagejson.extract;

                return await this.reply("success", "", {
                    fields: [
                        {
                            title: pagejson.titles.normalized,
                            body: extract ? (extract + "\n[View on Wikipedia](" + pagejson.content_urls.desktop.page + ")") : "No summary found."
                        }
                    ],
                    ...(image ? { thumbnail: {
                        url: image
                    } } : {})
                });
            } else {
                return await this.reply("error", "Could not wikipedia article.");
            }
        }
    }), 
    new ModuleCommand({
        name: "GitHub",
        description: "Get information about a user or repository on GitHub.",
        emoji: "<:github:" + config.emoji.github + ">",
        versions: [
            new CommandVersion(["github", "gh"], [
                new CommandArgument({
                    name: "repo",
                    description: "The repository to get information about.",
                    emoji: "🗃",
                    types: [new ArgumentType({
                        name: "Repository",
                        description: "A repository identifer on GitHub.",
                        examples: ["swagclan-bot/swagclan-v4-bot"],
                        validate: /^.+?\/.+$/
                    })]
                })
            ]),
            new CommandVersion(["github", "gh"], [
                new CommandArgument({
                    name: "user",
                    description: "The user to get information about.",
                    emoji: "🏷",
                    types: [ArgumentType.Any],
                    optional: true
                }),
            ]),
        ],
        callback: async function GitHub(message) {
            if (this.args.repo) {
                const parts = this.args.repo.value.split("/");
                const res = await fetch("https://api.github.com/repos/" + parts.map(encodeURIComponent).join("/"));

                const json = res.status === 200 ? await res.json() : null;
    
                if (json) {
                    const image = json.owner.avatar_url;    
    
                    return await this.reply("success", "", {
                        fields: [
                            {
                                title: json.full_name,
                                body: `
${json.fork && json.parent ? "_Forked from [" + json.parent.full_name + "](" + json.parent.html_url + ")_\n" : ""}
${json.description ? json.description : ""}
**Language:** ${json.language || "None"}
**License:** ${json.license ? "[" + json.license.name + "](http://choosealicense.com/licenses/" + json.license.key + ")" + (json.license.spdx_id !== "NOASSERTION" ? " (" + json.license.spdx_id + ")" : "") : "None"}
${json.homepage ? "**Homepage:** " + json.homepage : ""}
[View on GitHub](${json.html_url})
                            `.split("\n").filter(_=>_).join("\n").trim()
                            },
                            {
                                title: "Stats",
                                body: `
**Created:** ${json.created_at}
**Stargazers:** \`${fmt(json.stargazers_count)}\`
**Watchers:** \`${fmt(json.subscribers_count)}\`
**Forks:** \`${fmt(json.forks_count)}\`
                                `.split("\n").filter(_=>_).join("\n").trim()
                            }
                        ],
                        ...(image ? { thumbnail: {
                            url: image
                        } } : {})
                    });
                } else {
                    return await this.reply("error", "Couldn't get GitHub repo (" + res.status + ")");
                }
            } else {
                const account = await client.AccountService.getAccount(message.author);

                console.log(account.connections);

                const username = this.args.user ?
                    this.args.user.value :
                    account.connections.github?.username;

                if (!username) {
                    return await this.reply("error", "You haven't linked your account with GitHub, [Click here to link your account](" + process.env.BASE_API + "/account/connections/github)");
                }

                const res = await fetch("https://api.github.com/users/" + encodeURIComponent(username));

                const json = res.status === 200 ? await res.json() : null;

                if (json) {
                    const image = json.avatar_url;    
    
                    return await this.reply("success", "", {
                        fields: [
                            {
                                title: (json.name  ? json.name + " (" + json.login + ")" : json.login) + (json.site_admin ? " 🛡" : ""),
                                body: `
${json.bio ? json.bio : ""}
${json.twitter_username ? "**Twitter:** [@" + json.twitter_username + "](https://twitter.com/" + json.twitter_username + ")" : ""}
${json.location ? "**Location**: " + json.location : ""}
${json.blog ? "**Blog**: " + json.blog : ""}
[View on GitHub](${json.html_url})
                                `.split("\n").filter(_=>_).join("\n").trim()
                            },
                            {
                                title: "Stats",
                                body: `
**Created:** ${json.created_at}
**Repositories:** \`${fmt(json.public_repos)}\`
**Followers:** \`${fmt(json.followers)}\`
**Following:** \`${fmt(json.following)}\`
                                `.split("\n").filter(_=>_).join("\n").trim()
                            }
                        ],
                        ...(image ? { thumbnail: {
                            url: image
                        } } : {})
                    });
                } else {
                    return await this.reply("error", "Couldn't get GitHub user (" + res.status + ")");
                }
            }
        }
    })],
    matches: []
});
