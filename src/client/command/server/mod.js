// Imports
import { CommandInterface, BotModule, ModuleCommand, MessageMatcher, CommandVersion, CommandArgument, CommandSyntax, ArgumentType } from "../../../service/ModuleService.js"

import { p, is } from "../../../util/plural.js"

import client from "../../index.js"

export default new BotModule({
    name: "Server",
    description: "Commands for moderation and the server.",
    emoji: "🖥",
    commands: [
        new ModuleCommand({
            name: "Settings",
            description: "View and modify server settings.",
            emoji: "🛠",
            versions: [
                new CommandVersion(["settings", "setting"], []),
                new CommandVersion(["settings", "setting"], [
                    new CommandSyntax("set"),
                    new CommandArgument({
                        name: "setting",
                        description: "The setting to view.",
                        emoji: "🔨",
                        types: [ArgumentType.Text]
                    }),
                    new CommandSyntax("to"),
                    new CommandArgument({
                        name: "value",
                        description: "The value to change the setting to.",
                        emoji: "🔧",
                        types: [ArgumentType.Text]
                    })
                ]),
                new CommandVersion(["settings", "setting"], [
                    new CommandArgument({
                        name: "setting",
                        description: "The setting to view.",
                        emoji: "🔨",
                        types: [ArgumentType.Text]
                    }),
                    new CommandSyntax("history")
                ]),
                new CommandVersion(["settings", "setting"], [
                    new CommandArgument({
                        name: "setting",
                        description: "The setting to view.",
                        emoji: "🔨",
                        types: [ArgumentType.Text]
                    })
                ])
            ],
			example: "https://i.imgur.com/bA6Sil2.gif",
            callback: async function ModifyServerSettings(message) {
                const settings_service = client.SettingsService;

                const guild_settings = await settings_service.getSettings(message.guild);
                const definitions = settings_service.definitions;

                if (this.args.setting) {
                    const definition = Object.values(definitions).find(definition => {
                        return definition.name.toLowerCase().startsWith(this.args.setting.value.toLowerCase());
                    });

                    if (definition) {
                        const setting = guild_settings.settings.get(definition.name);

                        if (this.args.value) {
                            if (message.member.hasPermission(definition.permissions)) {
                                if (await setting.set(this.args.value.value)) {
                                    await guild_settings.save();

                                    const history = setting.history;

                                    return await this.reply("success", "", {
                                        fields: [
                                            {
                                                title: definition.display,
                                                body: definition.description
                                            },
                                            {
                                                title: "Current Value",
                                                body: setting.format,
                                                inline: true
                                            },
                                            {
                                                title: "Default Value",
                                                body: definition.format(definition.default),
                                                inline: true
                                            },
                                            {
                                                title: "History",
                                                body: history.reverse().slice(0, 5).map(change => {
                                                    return change.display
                                                }).join("\n") || "No setting history."
                                            },
                                            {
                                                title: "Permissions",
                                                body: "Requires permissions: `" + definition.permissions.toArray().join(", ") + "`."
                                            }
                                        ]
                                    });
                                } else {
                                    return await this.reply("error", "Invalid value for setting " + definition.name + ".");
                                }
                            } else {
                                return await this.reply("error", "You do not have permission to change setting " + definition.name + ".");
                            }
                        } else {
                            if (this.version_id === 2) {
                                const history = setting.history;

                                return await this.reply("success", "", {
                                    fields: [
                                        {
                                            title: definition.display,
                                            body: definition.description
                                        },
                                        {
                                            title: "History",
                                            body: history.reverse().map(change => {
                                                return change.display;
                                            }).join("\n") || "No setting history."
                                        }
                                    ]
                                });
                            } else {
                                const history = setting.history;

                                return await this.reply("success", "", {
                                    fields: [
                                        {
                                            title: definition.display,
                                            body: definition.description
                                        },
                                        {
                                            title: "Current Value",
                                            body: setting.format,
                                            inline: true
                                        },
                                        {
                                            title: "Default Value",
                                            body: definition.format(definition.default),
                                            inline: true
                                        },
                                        {
                                            title: "History",
                                            body: history.reverse().slice(0, 5).map(change => {
                                                return change.display;
                                            }).join("\n") || "No setting history."
                                        },
                                        {
                                            title: "Permissions",
                                            body: "Requires permissions: `" + definition.permissions.toArray().join(", ") + "`."
                                        }
                                    ]
                                });
                            }
                        }
                    } else {
                        return await this.reply("error", "Could not find setting with name `" + this.escape_c(this.args.setting.value) + "`.");
                    }
                } else {
                    const all_definitions = Object.values(definitions);
                    
                    const display = all_definitions.map(definition => {
                        const setting = guild_settings.settings.get(definition.name);

                        return {
                            title: definition.display,
                            body: definition.description + "\n**Value**: " + setting.format +
                                (setting.value !== definition.default ? "\n**Default**: " + definition.format(definition.default) : "")
                        }
                    });

                    this.createPages("success", "There " + is(all_definitions.length) + " currently " + p(all_definitions.length, "setting") + ".", display);
                }
            }
        })
    ]
})