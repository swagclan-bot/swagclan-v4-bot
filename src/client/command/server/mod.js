// Imports
import { CommandInterface, BotModule, ModuleCommand, MessageMatcher, CommandVersion, CommandArgument, CommandSyntax, ArgumentType } from "../../../service/ModuleService.js"
import discord from "discord.js"

import { p, is } from "../../../util/plural.js"

import client from "../../index.js"

export default new BotModule({
    name: "Server",
    description: "Commands for moderation and the server.",
    emoji: "🖥",
    commands: [
        new ModuleCommand({
            name: "Sweep",
            description: "Sweep bot messages and their uses.",
            emoji: "🧹",
            versions: [
                new CommandVersion(["sweep", "clean"], [])
            ],
			example: "https://i.imgur.com/tCRsoY0.gif",
            callback: async function SweepMessages(message) {
                const sweeper = client.SweeperService.getSweeper(message.channel);

                await sweeper.sweep();
            }
        }),
        new ModuleCommand({
            name: "Purge",
            description: "Purge messages that match certain conditions.",
            emoji: "☠",
            versions: [
                new CommandVersion(["purge", "destroy"], []),
                new CommandVersion(["purge", "destroy"], [
                    new CommandArgument({
                        name: "number",
                        description: "The number of messages to purge.",
                        emoji: "🔢",
                        types: [ArgumentType.UnsignedInteger]
                    })
                ]),
                new CommandVersion(["purge", "destroy"], [
                    new CommandArgument({
                        name: "number",
                        description: "The number of messages to purge.",
                        emoji: "🔢",
                        types: [ArgumentType.UnsignedInteger],
                        optional: true,
                        default: 100
                    }),
                    new CommandSyntax("by", true),
                    new CommandSyntax("from", true),
                    new CommandSyntax("mentions", true),
                    new CommandArgument({
                        name: "member",
                        description: "The member that messages to purge are by or mentions.",
                        emoji: "👤",
                        types: [ArgumentType.Mention]
                    })
                ]),
                new CommandVersion(["purge", "destroy"], [
                    new CommandArgument({
                        name: "number",
                        description: "The number of messages to purge.",
                        emoji: "🔢",
                        types: [ArgumentType.UnsignedInteger],
                        optional: true,
                        default: 100
                    }),
                    new CommandSyntax("bots", true)
                ]),
                new CommandVersion(["purge", "destroy"], [
                    new CommandArgument({
                        name: "number",
                        description: "The number of messages to purge.",
                        emoji: "🔢",
                        types: [ArgumentType.UnsignedInteger],
                        optional: true,
                        default: 100
                    }),
                    new CommandSyntax("has"),
                    new CommandArgument({
                        name: "item",
                        description: "The item that the messages to purge contain.",
                        emoji: "🏷",
                        types: [
                            new ArgumentType({
                                name: "Message Item",
                                description: "An item in a message.",
                                emoji: "🏷",
                                validate: /^((file|image|url|link|embed)(( |, ?)(file|image|url|link|embed))*)$/
                            })
                        ]
                    })
                ]),
                new CommandVersion(["purge", "destroy"], [
                    new CommandArgument({
                        name: "number",
                        description: "The number of messages to purge.",
                        emoji: "🔢",
                        types: [ArgumentType.UnsignedInteger],
                        optional: true,
                        default: 100
                    }),
                    new CommandSyntax("startsWith", true),
                    new CommandSyntax("endsWith", true),
                    new CommandSyntax("exact", true),
                    new CommandArgument({
                        name: "text",
                        description: "The text to purge.",
                        emoji: "💬",
                        types: [ArgumentType.Rest]
                    })
                ]),
            ],
            callback: async function PurgeMessages(message) {
                const ImageRegex = /[a-z](?:[-a-z0-9\+\.])*:(?:\/\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])*@)?(?:\[(?:(?:(?:[0-9a-f]{1,4}:){6}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|::(?:[0-9a-f]{1,4}:){5}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4}:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+[-a-z0-9\._~!\$&'\(\)\*\+,;=:]+)\]|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}|(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])*)(?::[0-9]*)?(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))*)*|\/(?:(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))*)*)?|(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))*)*|(?!(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])))\.(png|jpe?g|gif|svg|webp|tiff)(?:\?(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\/\?\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E\uDB80-\uDBBE\uDBC0-\uDBFE][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDC00-\uDFFD])*)?(?:\#(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\/\?\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])*)?/;
                const URLRegex = /[a-z](?:[-a-z0-9\+\.])*:(?:\/\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])*@)?(?:\[(?:(?:(?:[0-9a-f]{1,4}:){6}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|::(?:[0-9a-f]{1,4}:){5}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4}:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+[-a-z0-9\._~!\$&'\(\)\*\+,;=:]+)\]|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}|(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])*)(?::[0-9]*)?(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))*)*|\/(?:(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))*)*)?|(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD]))*)*|(?!(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])))(?:\?(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\/\?\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E\uDB80-\uDBBE\uDBC0-\uDBFE][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDC00-\uDFFD])*)?(?:\#(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~!\$&'\(\)\*\+,;=:@\/\?\xA0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB44-\uDB7E][\uDC00-\uDFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F][\uDC00-\uDFFD])*)?/g;

                if (!message.member.hasPermission("MANAGE_CHANNELS")) {
                    return await this.reply("error", "You must have manage channel permission to use purge.");
                }

                if (!this.args.number) {
                    return await this.reply("error", "Specify some conditions or a number of messages to purge.");
                }

                if (this.args.number?.value > 100) {
                    return await this.reply("error", "You can only purge a max of 100 messages.");
                }

                const messages = await message.channel.messages.fetch({
                    limit: (this.args.number ? this.args.number.value : 100)
                });

                const purge_messages = messages.filter(msg => {
                    const _2wk = 2 * 7 * 24 * 60 * 60 * 1000; //  API Blocks bulk-delete if any message is over 2 weeks old.

                    if (msg.createdTimestamp < Date.now() - _2wk) {
                        return false;
                    }

                    const embedContent = msg.embeds.map(embed => {
                        const fieldContent = embed.fields.map(field => {
                            return field.name + field.value;
                        }).join(" ");

                        return fieldContent + embed.title + embed.description + embed.footer;
                    });

                    const fullContent = msg.content + embedContent;

                    if (this.args.text) {
                        if (this.args.startsWith) {
                            return fullContent.toLowerCase().startsWith(this.args.text.value.toLowerCase());
                        }
                        
                        if (this.args.endsWith) {
                            return fullContent.toLowerCase().endsWith(this.args.text.value.toLowerCase());
                        }
                        
                        if (this.args.exact) {
                            return fullContent.toLowerCase() === this.args.text.value.toLowerCase();
                        }

                        return ~fullContent.toLowerCase().indexOf(this.args.text.value.toLowerCase());
                    } else if (this.args.item) {
                        const items = this.args.item.value.split(",");

                        /** @param {discord.Message} message */
                        function message_has_images(message) {
                            return message.attachments.filter(attachment => {
                                return ImageRegex.test(attachment.url);
                            }).size || fullContent.match(ImageRegex._validate);
                        }

                        for (let i = 0; i < items.length; i++) {
                            const item = items[i];

                            if (item === "file" && msg.attachments.size > 0) {
                                return true;
                            }

                            if (item === "image" && message_has_images(msg)) {
                                return true;
                            }
    
                            if ((item === "url" || item === "link") && URLRegex.test(fullContent)) {
                                return true;
                            }
    
                            if (item === "embed" && msg.embeds.length) {
                                return true;
                            }
                        }

                        return false;
                    } else if (this.args.bots) {
                        return msg.author.bot;
                    } else if (this.args.member) {
                        if (this.args.by || this.args.from) {
                            return message.author.id === this.args.member.value.user.id;
                        }

                        if (this.args.mentions) {
                            return msg.mentions.members.get(this.args.member.value.user.id);
                        }

                        return false;
                    }

                    return true;
                });

                if (purge_messages.size >= 20) {
                    const reply = await this.reply("warn", "Are you sure you want to purge 20+ messages?");

                    reply.react("👍");

                    const reaction = await reply.awaitReactions((reaction, user) => {
                        return reaction.emoji.name === "👍" && user.id === message.author.id;
                    }, { max: 1, time: 30000 });

                    if (!reaction.size) {
                        return;
                    }

                    await reply.delete();
                }
                
                await message.delete();

                message.channel.bulkDelete(purge_messages);
            }
        }),
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