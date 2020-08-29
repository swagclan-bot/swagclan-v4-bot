// Imports
import { SwagClan } from "../../../class/SwagClan.js"
import { BotModule, ModuleCommand, MessageMatcher, CommandVersion, CommandArgument, CommandSyntax, ArgumentType } from "../../../service/ModuleService.js"

import { p, is } from "../../../util/plural.js"

import sys from "systeminformation"
import numeral from "numeral"
import human_dur from "humanize-duration"
import superbytes from "superbytes"

import config from "../../../../.config.js"
import credentials from "../../../../.credentials.js"

import runtime_id from "../../../runtime.id.js"

const fmt = num => numeral(num).format("0,0");

export default new BotModule({
    name: "Bot",
    description: "Get bot information and handle core features.",
    emoji: "🤖",
    commands: [
		new ModuleCommand({
			name: "Source",
			description: "Get the source code of the bot.",
			emoji: "📝",
			versions: [
				new CommandVersion(["source", "src"], [])
			],
			example: "https://i.imgur.com/SlyV3yS.gif",
			callback: async function SourceCode(message) {
				return await this.reply("success", "The latest version source for the bot is hosted at https://github.com/swagclan-bot/swagclan-v4-bot");
			}
		}),
        new ModuleCommand({
            name: "Help",
            description: "Get help on modules and command usage.",
            emoji: "⁉",
            versions: [
                new CommandVersion(["help", "command"], [
                    new CommandArgument({
                        name: "command",
                        description: "The command to get help for.",
                        emoji: "❗",
                        types: [ArgumentType.Text]
                    }),
                    new CommandSyntax("in"),
                    new CommandArgument({
                        name: "module",
                        description: "The module in which the command is in.",
                        emoji: "📦",
                        types: [ArgumentType.Text]
                    }), 
                ]),
                new CommandVersion(["help", "commands"], [
                    new CommandArgument({
                        name: "module",
                        description: "The module to get help for.",
                        emoji: "📦",
                        types: [ArgumentType.Text]
                    })
                ]),
                new CommandVersion(["help", "commands"], [])
            ],
			example: "https://i.imgur.com/LRJr9BQ.gif",
            callback: async function DisplayHelp(message) {
                /** @type {SwagClan} */
                const client = message.client;

                const modules = client.ModuleService.modules;
                const privilege = client.PrivilegeService;

                const is_admin = privilege.admins.test(message.member);
                const is_beta = privilege.beta.test(message.member);

                if (this.args.module) {
                    /** @type {BotModule} */
                    const module = modules.get(this.args.module.value.toLowerCase());

                    if (module) {
                        if (this.args.command) {
                            const command = module.commands.find(command => command.name.toLowerCase().startsWith(this.args.command.value.toLowerCase()));

                            if (command) {
                                if (!command.admin || is_admin) {
                                    if (!command.beta || is_beta) {
                                        const guild_settings = await message.client.SettingsService.getSettings(message.guild);
                                        const prefix = guild_settings.settings.get("Prefix").value;
        
                                        const versions = command.versions;
                                        
                                        const display = versions.map(version => {
                                            const triggers = version.triggers.slice(1);
                                            const args = version.arguments.filter(argument => !argument.syntax);
        
                                            const display = args.map(arg => {
                                                return arg.display + "\n" + arg.description
                                            }).join("\n");
        
                                            return {
                                                title: "`" + prefix + version.usage + "`",
                                                body: (triggers.length ? "**Aliases**: `" + triggers.join(", ") + "`" : "") + "\n" + (args.length ? display : "No arguments.")
                                            }
                                        });
        
                                        return await this.createPages("success", "There " + is(versions.length) + " " + p(versions.length, "version") + " of `" + command.name + "` in `" + module.name + "`.", display);    
                                    } else {
                                        return await this.reply("error", "Could not find `" + this.escape_c(this.args.command.value) + "` in `" + module.name + "`.");
                                    }
                                } else {
                                    return await this.reply("error", "Could not find `" + this.escape_c(this.args.command.value) + "` in `" + module.name + "`.");
                                }
                            } else {
                                return await this.reply("error", "Could not find `" + this.escape_c(this.args.command.value) + "` in `" + module.name + "`.");
                            }
                        } else {
                            /** @type {Array<BotModule>} */
                            const commands = module.commands.filter(command => {
                                if (command.hidden) {
                                    return false;
                                }

                                if (command.admin && !privilege.admins.test(message.member)) {
                                    return false;
                                }

                                if (command.beta && !privilege.beta.test(message.member) && !privilege.admins.test(message.member)) {
                                    return false;
                                }

                                return true;
                            });

                            const display = commands.map(command => {
                                return {
                                    title: command.display,
                                    body: command.description
                                }
                            });

                            return await this.createPages("success", "There " + is(commands.length) + " " + p(commands.length, "command") + " in `" + this.escape_c(module.name) + "`.", display);
                        }
                    } else {
                        return await this.reply("error", "Could not find `" + this.escape_c(this.args.module.value) + "`.");
                    }
                } else {
                    /** @type {Array<BotModule>} */
                    const all_modules = [...modules.values()].filter(module => !module.hidden);

                    const display = all_modules.map(module => {
                        return {
                            title: module.display,
                            body: module.description
                        }
                    });

                    return await this.createPages("success", "There " + is(all_modules.length) + " " + p(all_modules.length, "module") + " loaded.", display);
                }
            }
        }),
        new ModuleCommand({
            name: "About",
            description: "Get information about the bot process.",
            emoji: "📆",
            versions: [
                new CommandVersion(["about"], [])
            ],
			example: "https://i.imgur.com/EuKxKAd.gif",
            callback: async function GetProcessInformation(message) {
                await this.reply("success", "Loading information..");
    
                const uptime = process.uptime();
                const formatted = human_dur(uptime * 1000, { round: true });
    
                const memory = await sys.mem();
                const os = await sys.osInfo();
                const versions = await sys.versions();
                
                const num_modules = message.client.ModuleService.modules.size;
    
                return await this.edit("success", "There " + is(num_modules) + " currently " + p(num_modules, "module") + " loaded.", {
                    fields: [
                        {
                            title: "Runtime ID",
                            body: "`" + runtime_id + "`"
                        },
                        {
                            title: "Version " + config.version,
                            body: "Last updated: " + config.last_update,
                            inline: true
                        },
                        {
                            title: "Author",
                            body: config.author.discord,
                            inline: true
                        },
                        {
                            title: "Uptime",
                            body: formatted
                        },
                        {
                            title: "Memory",
                            body: "Total: `" + superbytes(memory.total) + "`\nUsed: `" + superbytes(memory.used) + " (" + Math.round(memory.used / memory.total * 100) + "%)`\nFree: `" + superbytes(memory.free) + " (" + Math.round(memory.free / memory.total * 100) + "%)`",
                            inline: true
                        },
                        {
                            title: "System",
                            body: "Platform: `" + os.platform + "`\nDistro: " + os.distro + "\nArch: `" + os.arch + "`",
                            inline: true
                        },
                        {
                            title: "Versions",
                            body: "Node: `v" + versions.node + "`\nNPM: `v" + versions.npm + "`\nDiscord.js: `12.2.0`",
                            inline: true
                        }
                    ],
                    footer: "All dates are in ISO 8601 format (YYYY-MM-DD)."
                });
            }
        }),
        new ModuleCommand({
            name: "Sweep",
            description: "Sweep bot messages and their uses.",
            emoji: "🧹",
            versions: [
                new CommandVersion(["sweep"], [])
            ],
			example: "https://i.imgur.com/tCRsoY0.gif",
            callback: async function SweepMessages(message) {
                const sweeper = message.client.SweeperService.getSweeper(message.channel);

                await sweeper.sweep();
            }
        }),
        new ModuleCommand({
            name: "Throw",
            description: "Throw an exception to test error logging.",
            emoji: "🛑",
            versions: [
                new CommandVersion(["throw"], [])
            ],
            callback: async function ThrowException(message) {
                throw new Error("Exception thrown by " + message.author.tag + " (" + message.author.id + ")");
            },
            admin: true
        }),
        new ModuleCommand({
            name: "Invite",
            description: "Generate an invite link to invite the bot to another server.",
            emoji: "🔐",
            versions: [
                new CommandVersion(["invite"], [])
            ],
			example: "https://i.imgur.com/HLPCUPb.gif",
            callback: async function GenerateInvite(message) {
                this.reply("success", "`https://discord.com/oauth2/authorize?client_id=" + credentials.client_id + "&scope=bot&permissions=809639952`")
            }
        }),
        new ModuleCommand({
            name: "Modules",
            description: "View or modify modules.",
            emoji: "📦",
            versions: [
                new CommandVersion(["module"], [
                    new CommandArgument({
                        name: "action",
                        description: "What to do to the module.",
                        emoji: "🛠",
                        types: [
                            new ArgumentType({
                                name: "Module Action",
                                description: "What do to for a module, ",
                                validate: /((re)|(un))?load/
                            })
                        ],
                        optional: true
                    }),
                    new CommandArgument({
                        name: "module",
                        description: "The module to view or modify.",
                        emoji: "📦",
                        types: [ArgumentType.Any]
                    })
                ])
            ],
            callback: async function Modules(message) {
                /** @type {SwagClan} */
                const client = this.client;

                const service = client.ModuleService;
                const settings = client.SettingsService.guilds.get(message.guild.id).settings;

                if (this.args.action) {
                    if (this.args.action.value === "load") {
                        try {
                            const module = await service.load(this.args.module.value);

                            return await this.reply("success", "Module successfully loaded. Refresh ID: `" + module.refresh_id + "`", {
                                fields: [
                                    {
                                        title: "Details",
                                        body: "Commands: `" + fmt(module.commands.length) + "`\nMatchers: `" + fmt(module.matchers.length) + "`\nLast loaded: " + new Date(module.loaded_at).toISOString()
                                    }
                                ]
                            });
                        } catch (e) {
                            if (e === "Module already loaded") {
                                return await this.reply("error", "Module already loaded.");
                            } else {
                                console.error(e);

                                return await this.reply("error", "An error occurred while loading module.");
                            }
                        }
                    } else if (this.args.action.value === "reload") {
                        try {
                            const module = await service.reload(this.args.module.value);

                            return await this.reply("success", "Module successfully reloaded. Refresh ID: `" + module.refresh_id + "`", {
                                fields: [
                                    {
                                        title: "Details",
                                        body: "Commands: `" + fmt(module.commands.length) + "`\nMatchers: `" + fmt(module.matchers.length) + "`\nLast loaded: " + new Date(module.loaded_at).toISOString()
                                    }
                                ]
                            });
                        } catch (e) {
                            if (e === "Module not loaded") {
                                return await this.reply("error", "Module not loaded.");
                            } else {
                                console.error(e);

                                return await this.reply("error", "An error occurred while reloading module.");
                            }
                        }
                    } else if (this.args.action.value === "unload") {
                        try {
                            const module = await service.unload(this.args.module.value);

                            return await this.reply("success", "Module successfully unloaded. Refresh ID: `" + module.refresh_id + "`", {
                                fields: [
                                    {
                                        title: "Details",
                                        body: "Commands: `" + fmt(module.commands.length) + "`\nMatchers: `" + fmt(module.matchers.length) + "`"
                                    }
                                ]
                            });
                        } catch (e) {
                            if (e === "Module not loaded") {
                                return await this.reply("error", "Module not loaded.");
                            } else {
                                console.error(e);

                                return await this.reply("error", "An error occurred while unloading module.");
                            }
                        }
                    }
                } else {
                    const module = service.modules.get(this.args.module.value.toLowerCase());

                    if (module) {
                        const module = await service.reload(this.args.module.value);

                        return await this.reply("success", "Refresh ID: `" + module.refresh_id + "`", {
                            fields: [
                                {
                                    title: "Details",
                                    body: "Commands: `" + fmt(module.commands.length) + "`\nMatchers: `" + fmt(module.matchers.length) + "`\nLast loaded: " + new Date(module.loaded_at).toISOString()
                                }
                            ]
                        });
                    } else {
                        return await this.reply("error", "Module not loaded. (Use `" + settings.get("Prefix").value + "module load " + this.args.module.value + "`)");
                    }
                }
            },
            admin: true
		}),
		new ModuleCommand({
			name: "Admins",
			description: "View and manage bot administrators.",
			emoji: "👮‍♂️",
			versions: [
				new CommandVersion(["admins", "admin"], [
					new CommandSyntax("add"),
					new CommandArgument({
						name: "who",
						description: "The member to make administrator.",
						emoji: "🏷",
						types: [ArgumentType.Mention]
					})
				]),
				new CommandVersion(["admins", "admin"], [
					new CommandSyntax("remove"),
					new CommandArgument({
						name: "who",
						description: "The member to remove administrator from.",
						emoji: "🏷",
						types: [ArgumentType.Mention]
					})
				]),
				new CommandVersion(["admins"], [])
			],
			callback: async function ViewAdmins(message) {
				const service = message.client.PrivilegeService;
				const admins = service.admins.users;
				
				if (this.args.who) {
					const user = this.args.who.value.user;
					
					if (this.args.add) {
						if (admins.get(user.id)) {
							return await this.reply("error", "That user is already an admin.");
						} else {
							admins.set(user.id, {
								id: user.id,
								tag: user.tag,
								timestamp: Date.now()
							});
							
							await service.admins.save();
							
							return await this.reply("success", "<@" + user.id + "> is now an admin.");
						}
					} else if (this.args.remove) {
						if (admins.get(user.id)) {
							admins.delete(user.id);
							
							await service.admins.save();
							
							return await this.reply("success", "<@" + user.id + "> is no longer an admin.");
						} else {
							return await this.reply("error", "That user isn't an admin.");
						}
					}
				} else {
					return await this.reply("success", "There " + is(admins.size) + " " + p(admins.size, "admin") + "\n" + [...admins.values()].map(user => {
						return "\* **" + user.tag + "** (" + new Date(user.timestamp).toISOString().replace("T", " ").replace("Z", "").split(".")[0] + ")";
					}).join("\n"));
				}
			},
			admin: true
		}),
		new ModuleCommand({
			name: "Blacklist",
			description: "View and manage blacklisted users.",
			emoji: "📜",
			versions: [
				new CommandVersion(["blacklist"], [
					new CommandSyntax("add"),
					new CommandArgument({
						name: "who",
						description: "The member to add to the blacklist.",
						emoji: "🏷",
						types: [ArgumentType.Mention]
					})
				]),
				new CommandVersion(["blacklist"], [
					new CommandSyntax("remove"),
					new CommandArgument({
						name: "who",
						description: "The member to remove from the blacklist.",
						emoji: "🏷",
						types: [ArgumentType.Mention]
					})
				]),
				new CommandVersion(["blacklist"], [])
			],
			callback: async function ViewBlacklist(message) {
				const service = message.client.PrivilegeService;
				const blacklist = service.blacklist.users;
				
				if (this.args.who) {
					const user = this.args.who.value.user;
					
					if (this.args.add) {
						if (blacklist.get(user.id)) {
							return await this.reply("error", "That user is already blacklisted.");
						} else {
							blacklist.set(user.id, {
								id: user.id,
								tag: user.tag,
								timestamp: Date.now()
							});
							
							await service.blacklist.save();
							
							return await this.reply("success", "<@" + user.id + "> is now blacklisted.");
						}
					} else if (this.args.remove) {
						if (blacklist.get(user.id)) {
							blacklist.delete(user.id);
							
							await service.blacklist.save();
							
							return await this.reply("success", "<@" + user.id + "> is no longer blacklisted.");
						} else {
							return await this.reply("error", "That user isn't blacklisted");
						}
					}
				} else {
					return await this.reply("success", "There " + is(blacklist.size) + " " + p(blacklist.size, "blacklisted user") + "\n" + [...blacklist.values()].map(user => {
						return "\* **" + user.tag + "** (" + new Date(user.timestamp).toISOString().replace("T", " ").replace("Z", "").split(".")[0] + ")";
					}).join("\n"));
				}
			},
			admin: true
		})
    ],
    matchers: [
        new MessageMatcher({
            name: "Mention",
            description: "Returns basic information about the bot when mentioned.",
            emoji: "📩",
            matches: [
                async function MatchClientMention(message) {
                    const user_regex = new RegExp("^<@!?" + message.client.user.id + ">$");

                    return user_regex.test(message.content);
                }
            ],
            callback: async function ReplyBasicInformation(message) {
                const settings_service = message.client.SettingsService;
                const guild_settings = await settings_service.getSettings(message.guild);
                const definitions = settings_service.definitions;

                const def_prefix = definitions["Prefix"];
                const prefix = guild_settings.settings.get("Prefix").value;

                const prefix_fmt = def_prefix.format(prefix);

                this.reply("success", "My prefix in this server is " + prefix_fmt + "\nYou can use `" + prefix + "help Help in Bot` to get started on commands, or see " + process.env.BASE_WEB + "/help");
            }
        })
    ]
})