// Imports
import { BotModule, ModuleCommand, MessageMatcher, CommandVersion, CommandArgument, CommandSyntax, ArgumentType } from "../../../service/ModuleService.js"

export default new BotModule({
    name: "template",
    description: "A template module.",
    emoji: "🧩",
    hidden: true,
    commands: [
        new ModuleCommand({
            name: "template command",
            description: "A template command.",
            emoji: "🧩",
            versions: [
                new CommandVersion(["template"], [
                    new CommandArgument({
                        name: "arg",
                        description: "A template argument.",
                        emoji: "🧩",
                        types: [ArgumentType.Text]
                    })
                ])
            ],
            callback: async function TemplateCommand(message) {
                this.reply("success", "Template reply.");
            }
        })
    ]
});