// Imports
import discord from "discord.js"
import randomstring from "randomstring"
import path from "path"
import EventEmitter from "events"

import { promises as fs } from "fs"

import { SwagClan } from "../class/SwagClan.js"
import { Service } from "./Service.js"

import { CustomCommandRuleGroup, CustomCommandRule } from "./rule/CustomCommandRule.js"

import RuleManager from "./rule/rules.js"

export const InvalidArg = Symbol("Invalid argument provided.");

export const rule_manager = new RuleManager;

/**
 * @typedef JSONCustomCommandInputObject
 * @property {"input"} type The type of expression.
 * @property {any} value The value of the input.
 */
 
/**
 * @typedef JSONCustomCommandTrigger
 * @property {"command"|"startsWith"|"contains"|"exact"|"matches"} type The type of trigger
 * @property {String} name The name or value to match for the trigger.
 */

/**
 * @typedef JSONCustomCommandContextVariableObject
 * @property {"ctx_var"} type The type of expression.
 * @property {String} name The name of the context variable.
 */

/**
 * @typedef JSONCustomCommandActionRuleIdentifierObject
 * @property {String} group The group of the rule.
 * @property {String} id The ID of the rule.
 */

/**
 * @typedef JSONCustomCommandActionObject
 * @property {"action"} type The type of expression.
 * @property {JSONCustomCommandActionRuleIdentifierObject} rule The ID of the rule to run.
 * @property {Array<JSONCustomCommandExpressionObject>} arguments The arguments of the rule.
 */

/**
 * @typedef JSONCustomCommandExpressionObject
 * @property {String} type The type of expression.
 */

/**
 * @typedef JSONCustomCommandParameterObject
 * @property {String} type The type of argument that should be passed.
 * @property {String} name The name of the parameter.
 */

/**
 * @typedef JSONCustomCommandVariableObject
 * @property {String} type The type of the variable.
 * @property {String} name The name of the variable.
 */

/**
 * @typedef JSONCustomCommandObject
 * @property {Number} id The ID of the command.
 * @property {String} name The name of the command.
 * @property {String} description The description of the command.
 * @property {Array<String>} triggers An array of triggers to activate the command.
 * @property {Array<JSONCustomCommandParameterObject>} parameters The parameters of the command.
 * @property {Array<JSONCustomCommandActionObject>} actions The actions of the command.
 */

/**
 * @typedef JSONGuildCustomCommandsMetaObject
 * @property {Number} count The ID count of the commands.
 */

/**
 * @typedef JSONGuildCustomCommandsObject
 * @property {Array<JSONCustomCommandObject>} commands An array of commands.
 * @property {JSONGuildCustomCommandsMetaObject} meta The meta information for the custom commands set.
 */

/**
 * @typedef {CustomCommandInputExpression|CustomCommandContextVariableExpression|CustomCommandActionExpression} ResolvedCustomCommandExpression
 */

/**
 * Represents a base expression in a custom command.
 */
class CustomCommandExpression {
    /**
     * Instantiate a custom command expression.
     * @param {String} type The type of expression.
     */
    constructor(type) {
        this.type = type;
    }

    /**
     * Evaluate the expression.
     * @param {CustomCommandContext} ctx The context of the expression.
     * @returns {any}
     */
    async evaluate() {

    }
}

/**
 * Represents an input expression.
 */
class CustomCommandInputExpression extends CustomCommandExpression {
    /**
     * Instantiate a custom command input object.
     * @param {JSONCustomCommandInputObject} input The input information.
     */
    constructor(input) {
        super("input");

        /**
         * The value of the input.
         * @type {any}
         */
        this.value = input.value;
    }

    /**
     * Evaluate the expression.
     * @param {CustomCommandContext} ctx The context of the expression.
     * @returns {any}
     */
    async evaluate(ctx) {
        return new CustomCommandContextVariable("string", this.value);
    }
}

/**
 * Represents a reference to a variable in the command context.
 */
class CustomCommandContextVariableExpression extends CustomCommandExpression {
    /**
     * Instantiate a custom command context variable object.
     * @param {JSONCustomCommandContextVariableObject} ctx_var The context variable information.
     */
    constructor(ctx_var) {
        super("ctx_var");
        
        /**
         * The name of the variable.
         * @type {String}
         */
        this.name = ctx_var.name;
    }

    /**
     * Evaluate the expression.
     * @param {CustomCommandContext} ctx The context of the expression.
     * @returns {String}
     */
    async evaluate(ctx) {
        if (ctx.vars[this.name] && ctx.vars[this.name].type === "void") {
            return await ctx.vars[this.name].value.evaluate(ctx);
        }

        return ctx.vars[this.name] || { type: "undefined", value: undefined };
    }
}

/**
 * Represents a rule identifier on a command action.
 */
class RuleIdentifier {
    /**
     * Resolve a rule ID without a group.
     * @param {String} id The ID to resolve the custom command rule by.
     * @returns {CustomCommandRule|null}
     */
    static resolveID(id) {
        for (let i = 0; i < rule_manager.rule_groups.length; i++) {
            for (let j = 0; j < rule_manager.rule_groups[i].rules.length; j++) {
                if (rule_manager.rule_groups[i].rules[j].id === id) {
                    return new RuleIdentifier(rule_manager.rule_groups[i].name, rule_manager.rule_groups[i].rules[j].id);
                }
            }
        }

        return null;
    }

    /**
     * Instantiate a rule identifier for a custom command action expression.
     * @param {String} group The name of the rule group.
     * @param {String} id The id of the rule.
     */
    constructor(group, id) {
        /**
         * The name of the rule group.
         * @type {String}
         */
        this.group = group;

        /**
         * The ID of the rule.
         * @type {String}
         */
        this.id = id;
    }

    /**
     * Resolve the identifier to a rule.
     * @returns {CustomCommandRule|null}
     */
    resolve() {
        for (let i = 0; i < rule_manager.rule_groups.length; i++) {
            for (let j = 0; j < rule_manager.rule_groups[i].rules.length; j++) {
                if (rule_manager.rule_groups[i].rules[j].id === this.id) {
                    return rule_manager.rule_groups[i].rules[j];
                }
            }
        }

        return null;
    }
}

/**
 * Represents a command action.
 */
class CustomCommandActionExpression extends CustomCommandExpression {
    /**
     * Instantiate a custom command action object.
     * @param {JSONCustomCommandActionObject} action The action information.
     */
    constructor(action) {
        super("action");

        if (action.rule_id) {
            /**
             * The ID of the rule that the action refers to.
             * @type {RuleIdentifier}
             */
            this.rule = RuleIdentifier.resolveID(this.rule_id);
        } else {
            /**
             * The ID of the rule that the action refers to.
             * @type {RuleIdentifier}
             */
            this.rule = new RuleIdentifier(action.rule.group, action.rule.id);
        }

        /**
         * An array of arguments to pass to the rule.
         * @type {Array<ResolvedCustomCommandExpression>}
         */
        this.arguments = action.arguments.map(resolve_expression);
    }
    
    /**
     * Evaluate the expression.
     * @param {CustomCommandContext} ctx The context of the expression.
     * @returns {any}
     */
    async evaluate(ctx) {
        const rule = this.rule.resolve();

        if (rule) {
            return await rule.callback(ctx, ...this.arguments);
        } else {
            return null;
        }
    }
}

/**
 * Resolve an expression to a constructed object by it's type.
 * @param {JSONCustomCommandExpressionObject} expr The expression to resolve.
 * @returns {ResolvedCustomCommandExpression}
 */
function resolve_expression(expr) {
    if (expr) {
        if (expr.type === "action") {
            return new CustomCommandActionExpression(expr);
        } else if (expr.type === "ctx_var") {
            return new CustomCommandContextVariableExpression(expr);
        } else if (expr.type === "input") {
            return new CustomCommandInputExpression(expr);
        }
    }

    return null;
}

/**
 * Represents a variable in a context for a custom command.
 */
export class CustomCommandContextVariable {
    /**
     * Instantiate the custom command context variable.
     * @param {String} type The type of variable.
     * @param {String} value The value of the variable.
     */
    constructor(type, value) {
        /**
         * The type of variable.
         * @type {String}
         */
        this.type = type;

        /**
         * The value of the variable.
         * @type {String}
         */
        this.value = value;
    }
}

/**
 * Represents a execution path for a custom command.
 */
class CustomCommandExecutionPath {
    /**
     * Instantiate a custom command execution path.
     * @param {discord.Message} message The message that was originally sent.
     * @param {CustomCommand} command The custom command that was called.
     * @param { { [key: string]: CustomCOmmandContextVariable }} args The arguments that were parsed.
     * @param { { [key: string]: CustomCOmmandContextVariable }} vars The variables in the custom command.
     */
    constructor(message, command, args, vars) {
        /**
         * The message that was originally sent.
         * @type {discord.Message}
         */
        this.message = message;

        /**
         * The custom command that was called.
         * @type {CustomCommand}
         */
        this.command = command;

        /**
         * The context for the execution path.
         * @type {CustomCommandContext}
         */
        this.context = new CustomCommandContext(message, this, args, vars);

        /**
         * When the execution path was last executed.
         * @type {Number}
         */
        this.started = 0;

        /**
         * Whether or not the execution path is stopped.
         * @type {Boolean}
         */
        this.is_stopped = false;

        /**
         * The reason for why the execution path was stopped.
         * @type {String}
         */
        this.stop_reason = "";
    }

    /**
     * Stop the execution path.
     * @type {String} reason The reason for why the execution path was stopped.
     */
    stop(reason) {
        this.is_stopped = true;
        this.stop_reason = reason;
    }
    
    /**
     * Run the execution path contextually.
     */
    async run() {
        this.started = Date.now();

        for (let i = 0; i < this.command.actions.length; i++) {
            if (!this.is_stopped) {
                await this.command.actions[i].evaluate(this.context);
            }
        }
    }
}

/**
 * Represents a context for a custom command.
 */
class CustomCommandContext {
    /**
     * Instantiate a custom command context.
     * @param {discord.Message} message The message that was originally sent.
     * @param {CustomCommandExecutionPath} script The execution path for the context.
     * @param { { [key: string]: CustomCommandContextVariable } } args The arguments that were parsed.
     * @param { { [key: string]: CustomCommandContextVariable } } vars The custom command variables.
     */
    constructor(message, script, args, vars) {
        /**
         * The message that was originally sent.
         * @type {discord.Message}
         */
        this.message = message;

        /**
         * The guild that the message is from.
         * @type {discord.Guild}
         */
        this.guild = message.guild;

        /**
         * The channel that the message is from.
         * @type {discord.TextChannel}
         */
        this.channel = message.channel;

        /**
         * The custom command that was called.
         * @type {CustomCommand}
         */
        this.command = script.command;

        /**
         * The execution path for the context.
         * @type {CustomCommandExecutionPath}
         */
        this.script = script;

        /**
         * An array of replies made to the original message.
         * @type {Array<discord.Message>}
         */
        this.replies = [];

        /**
         * The context variables of the rules.
         * @type { { [key: string]: CustomCommandContextVariable }}
         */
        this.vars = { ...args, ...Object.fromEntries(Object.entries(vars).map(([id, variable]) => {
            return [id, {
                name: variable,
                value: variable.inital
            }];
        })) };
    }
    
    /**
     * @typedef {discord.MessageOptions | (discord.MessageOptions & { split?: false; }) | discord.MessageEmbed | discord.MessageAttachment | (discord.MessageEmbed | discord.MessageAttachment)[] | discord.APIMessage} MessageContent
     */

    /**
     * Reply to the message.
     * @param {MessageContent} content The content of the message.
     * @returns {discord.Message}
     */
    async reply(content) {
        const msg = await this.message.channel.send(content);

        this.replies.push(msg);

        return msg;
    }
}

/**
 * Represents an parameter for a command.
 */
class CustomCommandParameter {
    /**
     * Instantiate a custom command parameter object.
     * @param {JSONCustomCommandParameterObject} info The parameter information.
     */
    constructor(info) {
        /**
         * The type that the parameter accepts.
         * @type {String}
         */
        this.type = info.type;

        /**
         * The name of the parameter.
         * @type {String}
         */
        this.name = info.name;
    }

    /**
     * Validate and parse a value for the parameter.
     * @param {discord.Message} message The original message that was sent.
     * @param {String} value The value to parse.
     * @returns {CustomCommandContextVariable}
     */
    async parse(message, value) {
        if (this.type === "number") {
            if (/^-?\d+(\.\d+)?$/.test(value)) {
                return new CustomCommandContextVariable("number", Number(value));
            }
        } else if (this.type === "string") {
            if (/^.+$/.test(value)) {
                return new CustomCommandContextVariable("string", value);
            }
        } else if (this.type === "boolean") {
            if (/^(true)|(false)+/.test(value)) {
                return new CustomCommandContextVariable("boolean", value === "true");
            }
        } else if (this.type === "member") {
            if (/^<@!?\d{17,19}>$/.test(value)) {
                const id = (value.match(/\d{17,19}/) || [])[0];

                const member = message.mentions.members.get(id);

                return new CustomCommandContextVariable("member", member);
            }
        } else if (this.type === "channel") {
            if (/^<#?\d{17,19}>$/.test(value)) {
                const id = (value.match(/\d{17,19}/) || [])[0];

                const channel = message.mentions.channels.get(id);

                return new CustomCommandContextVariable("channel", channel);
            }
        } else if (this.type === "role") {
            if (/^<@&?\d{17,19}>$/.test(value)) {
                const id = (value.match(/\d{17,19}/) || [])[0];

                const role = message.mentions.roles.get(id);

                return new CustomCommandContextVariable("role", role);
            }
        } else if (this.type === "exact") {
			if (value === this.name){ 
				return null;
			}
		}

        return InvalidArg;
    }
}

/**
 * Represents a variable for a custom command.
 */
export class CustomCommandVariable {
    /**
     * Instantiate a custom command variable object.
     * @param {JSONCustomCommandVariableObject} variable The vartiable information
     */
    constructor(variable) {
        /**
         * The type of the variable.
         * @type {String}
         */
        this.type = variable.type;

        /**
         * The name of the variable.
         * @type {String}
         */
        this.name = variable.name;
    }

    /**
     * The initial value of the variable.
     * @type {any}
     */
    get initial() {
        if (this.type === "number") return 0;
        
        if (this.type === "string") return "";

        if (this.type === "boolean") return false;

        return null;
    }
}

/**
 * @typedef { { [key: string]: String } } JSONCustomCommandStorageItemObject
 */

/**
 * Represents a guild custom command.
 * @extends {EventEmitter}
 */
export class CustomCommand extends EventEmitter {
    /**
     * Instantiate a custom command object.
     * @param {GuildCustomCommands} guild_set The guild's entire set of custom commands.
     * @param {JSONCustomCommandObject} command The command information.
     */
    constructor(guild_set, command) {
        super();
        
        /**
         * The guild's entire set of custom commands.
         * @type {GuildCustomCommands}
         */
        this.guild_set = guild_set;

        /**
         * The ID of the command.
         * @type {String}
         */
        this.id = command.id;

        /**
         * The name of the command.
         * @type {String}
         */
        this.name = command.name;

        /**
         * The description of the command.
         * @type {String}
         */
        this.description = command.description;

        if (typeof command.triggers[0] === "string") {
			/**
			 * An array of triggers to activate the command.
			 * @type {Array<JSONCustomCommandTrigger>}
			 */
			this.triggers = command.triggers.map(name => ({
				type: "command",
				name
			}));
		} else {
            if (command.triggers.some(trigger => trigger.trigger)) { // Cleans up bugs from transferring to new trigger system.
                /**
                 * An array of triggers to activate the command.
                 * @type {Array<JSONCustomCommandTrigger>}
                 */
                this.triggers = command.triggers.map(trigger => ({
                    type: trigger.type,
                    name: trigger.trigger || trigger.name
                }));
            } else {
                /**
                 * An array of triggers to activate the command.
                 * @type {Array<JSONCustomCommandTrigger>}
                 */
                this.triggers = command.triggers;
            }
		}

        if (Array.isArray(command.parameters)) {
            /**
             * The parameters that the command takes.
             * @type { { [key: string]: CustomCommandParameter } }
             */
            this.parameters = Object.fromEntries(command.parameters.map(parameter => {
                return [Math.random().toString(36).substr(2, 7), new CustomCommandParameter(parameter)];
            }));
        } else {
            /**
             * The parameters that the command takes.
             * @type { { [key: string]: CustomCommandParameter } }
             */
            this.parameters = Object.fromEntries(Object.entries(command.parameters).map(([id, parameter]) => {
                return [id, new CustomCommandParameter(parameter)];
            }));
        }

        /**
         * The variables in the command.
         * @type { { [key: string]: CustomCommandVariable } }
         */
        this.variables = command.variables ? Object.fromEntries(Object.entries(command.variables).map(([id, variable]) => {
            return [id, new CustomCommandVariable(variable)];
        })) : {};
            
        /**
         * The actions of the command.
         * @type {Array<CustomCommandActionExpression>}
         */
        this.actions = command.actions.map(action => {
            return resolve_expression(action);
        });

        /**
         * When the command was first created.
         * @type {Number}
         */
        this.created_at = command.created_at || Date.now();

        /**
         * When the command was last modified.
         * @type {Number}
         */
        this.modified_at = command.modified_at || command.created_at;

        /**
         * Whether or not the command is enabled.
         * @type {Boolean}
         */
        this.enabled = command.enabled ?? true;

        /**
         * Whether or not the command is hidden.
         * @type {Boolean}
         */
        this.hidden = command.hidden ?? false;

        /**
         * Whether or not the command can be cleaned by the bot.
         * @type {Boolean}
         */
        this.sweepable = command.sweepable ?? true;

        /**
         * The delay for users to wait between each use of the command.
         * @type {Number}
         */
        this.timeout = (command.delay || command.timeout) ?? 0;

        /**
         * The timeouts for individual users for using the command.
         * @type {discord.Collection<String,Number>}
         */
        this.timeouts = new discord.Collection;
    }
    
    /**
     * Set the variables for the command.
     * @param { { [key: string]: JSONCustomCommandVariableObject } >} variables The variables to change.
     */
    setVariables(variables) {
        this.variables = Object.fromEntries(Object.entries(variables).map(([id, variable]) => {
            return [id, new CustomCommandVariable(variable)];
        }));
    }
    
    /**
     * Set the parameters for the command.
     * @param { { [key: string]: JSONCustomCommandParameterObject } } parameters The parameters to change.
     */
    setParameters(parameters) {
		this.parameters = Object.fromEntries(Object.entries(parameters).map(([id, parameter]) => {
			return [id, new CustomCommandParameter(parameter)];
		}));
    }

    /**
     * Set the actions for the command.
     * @param {Array<CustomCommandActionExpression>} actions The actions to change.
     */
    setActions(actions) {
        this.actions = actions.map(action => {
            return resolve_expression(action);
        });
    }

    /**
     * Convert the object to a pure JSON to be saved.
     * @returns {JSONGuildCustomCommandsObject}
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            triggers: this.triggers,
            parameters: this.parameters,
            variables: this.variables,
            actions: this.actions,
            created_at: this.created_at,
            modified_at: this.modified_at,
            timeout: this.timeout,
            enabled: this.enabled,
            hidden: this.hidden,
            sweepable: this.sweepable
        }
    }

    /**
     * Validate a command trigger.
     * @param {discord.Message} message The original message that was sent.
     * @returns {Boolean|String}
     */
    async validateCmd(message) {
        const guild_settings = await message.client.SettingsService.getSettings(message.guild.id);

        for (let i = 0; i < this.triggers.length; i++) {
            const prefix = guild_settings.settings.get("Prefix").value;

			if (this.triggers[i].type === "command") {
                const trigger = prefix + this.triggers[i].name;

				if (message.content === trigger) {
					return [this.triggers[i], ""];
				}

				if (message.content.startsWith(trigger + " ")) {
					return [this.triggers[i], message.content.substr(trigger.length + 1)];
				}
			} else if (this.triggers[i].type === "startsWith") {
				const trigger = this.triggers[i].name;

				if (message.content === trigger) {
					return [this.triggers[i], ""];
				}

				if (message.content.startsWith(trigger + " ")) {
					return [this.triggers[i], message.content.substr(trigger.length + 1)];s
				}
			} else if (this.triggers[i].type === "contains") {
				const index = message.content.indexOf(this.triggers[i].name);
				
				if (~index) {
					return [this.triggers[i], ""];
				}
			} else if (this.triggers[i].type === "exact") {
				if (message.content === this.triggers[i].name) {
					return [this.triggers[i], ""];
				}
			} else if (this.triggers[i].type === "matches") {
				const trigger = this.triggers[i].name.replace(/(^\/)|(\/$)/g, "");
				const regex = new RegExp(trigger);
				
				const matches = regex.exec(message.content);
				
				if (matches) {
					return [this.triggers[i], ""];
				}
			}
        } 

        return false;
    }

    /**
     * Validate a value for the command and prepare it for execution.
     * @param {discord.Message} message The original message that was sent.
     * @returns { Promise<{ [key: string]: any }> }
     */
    async validate(message) {
        /**
         * @type { { [key: string]: CustomCommandContextVariableExpression } } 
         */
        const parsed_args = {};

        const validation = await this.validateCmd(message);

        if (!validation) {
            return false;
        }

        const [ trigger, msg ] = validation;

        const parts = msg.split(" ").filter(_ => _);

        let param_i = 0;
        let just_found = false;
        let start = 0;
        let i = 0;

        const parameters = Object.entries(this.parameters);

        for (; param_i < parameters.length && i < parts.length; i++) {
            const [id, param] = parameters[param_i];

            if (just_found) {
                const lookahead = parameters[param_i + 1];

                if (lookahead && await lookahead[1].parse(message, parts[i]) !== InvalidArg) {
                    just_found = false;
                    i--;
                    param_i++;
                } else {
                    const parsed = await param.parse(message, parts.slice(start, i + 1).join(" "));

                    if (parsed !== InvalidArg) {
                        just_found = true;

                        if (id) {
                            parsed_args[id] = parsed;
                        }
                    } else {
                        just_found = false;
                        i--;
                        param_i++;
                    }
                }
            } else {
                const parsed = await param.parse(message, parts[i]);

                if (parsed !== InvalidArg) {
                    just_found = true;
                    start = i;

                    if (id) {
                        parsed_args[id] = parsed;
                    }
                } else {
                    return false;
                }
            }
        }

        if (i < parameters.length) {
            return false;
        }

        if (i < parts.length) {
            return false;
        }

        return {
            trigger,
            args: parsed_args
        };
    }

    /**
     * Clear the timeout for a user.
     * @param {discord.UserResolvable} user The user to clear the timeout for.
     */
    clearTimeout(user) {
        if (this.timeouts.delete(user.id || user)) {
            this.emit("timeoutClear", user);
        }
    }
    
    /**
     * Clear all timeouts for the command.
     */
    clearTimeouts() {
        this.timeouts.clear();

        this.emit("allTimeoutsClear");
    }

    /**
     * Execute the command contextually.
     * @param {discord.Message} message The message that was originally sent.
     * @param {JSONCustomCommandTrigger} trigger The trigger that was triggered.
     * @param { { [key: string]: CustomCommandContextVariable }} parsed_args The arguments that were parsed.
     * @returns {CustomCommandExecutionPath}
     */
    async execute(message, trigger, parsed_args) {
        const timeout = this.timeouts.get(message.author.id);

        if (timeout && timeout > Date.now()) {
            if (trigger.type === "command") {
                await message.react("⏰");
            }

            return;
        }

        const script = new CustomCommandExecutionPath(message, this, parsed_args, this.variables);

        if (this.sweepable) {
            const service = this.guild_set.service.client.SweeperService;
            const sweeper = service.getSweeper(message.channel.id);

            sweeper.pushInterface(message, script.context);
        }

        if (this.timeout) {
            const timeout = Date.now() + this.timeout;

            this.timeouts.set(message.author.id, timeout);

            this.emit("timeout", message.author, timeout)
        }

        await script.run.call(script);

        return script;
    }
}

/**
 * Represents a set of custom commands in a guild.
 */
class GuildCustomCommands {
    /**
     * Instantiate a guilds custom commands.
     * @param {CustomCommandService} service The service that instantiated this object.
     * @param {String} id The ID of the guild.
     * @param {JSONGuildCustomCommandsObject} raw The commands in the guild.
     */
    constructor(service, id, raw) {
        /**
         * The service that instantiated this objet.
         * @type {CustomCommandService}
         */
        this.service = service;

        /**
         * The ID of the guild.
         * @type {String}
         */
        this.id = id;

        /**
         * The commands in the set.
         * @type {discord.Collection<String,CustomCommand>}
         */
        this.commands = new discord.Collection(Object.entries(raw.commands).map(([id, command]) => {
            return [id, new CustomCommand(this, command)]
        }));

        /**
         * The meta information for the custom commands set.
         * @type {JSONGuildCustomCommandsMetaObject}
         */
        this.meta = raw.meta || {
            count: this.commands.size
        };

        /**
         * Whether or not to prevent saving to a file.
         * @type {Boolean}
         */
        this.prevent_save = false;
    }

    /**
     * Convert the object to a pure JSON to be saved.
     * @returns {JSONGuildCustomCommandsObject}
     */
    toJSON() {
        return {
            commands: Object.fromEntries(this.commands.entries()),
            meta: this.meta
        }
    }

    async save() {
        if (this.prevent_save) return;

        await fs.writeFile(path.resolve(this.service.path, this.id + ".json"), JSON.stringify(this));
    }
}

/**
 * Represents a service dedicated to managing custom commands in guilds.
 * @extends Service
 */
export class CustomCommandService extends Service {
    /**
     * Instantiate the custom command service.
     * @param {SwagClan} client The client that instantiated this service.
     * @param {String} path The path where custom commands are kept.
     */
    constructor(client, path) {
        super(client);

        /**
         * The path where the guild custom commands are stored.
         * @type {String}
         */
        this.path = path;

        /**
         * The custom commands by guild IDs.
         * @type {discord.Collection<String,GuildCustomCommands>}
         */
        this.guilds = new discord.Collection;
    }

    /**
     * Load or reload the rules from the file system.
     * @returns {Array<CustomCommandRuleGroup>}
     */
    async loadRules() {
        return await rule_manager.reload();
    }

    /**
     * Get a guild's settings by it's ID.
     * @param {discord.GuildResolvable} guild_resolvable The guild to get the settings for.
     * @returns {GuildCustomCommands}
     */
    async getCustomCommands(guild_resolvable) {
        const guild = this.client.guilds.resolve(guild_resolvable);

        if (guild && this.guilds.get(guild.id)) {
            return this.guilds.get(guild.id);
        } else {
            try {
                await this.loadCustomCommands(guild.id);
            } catch (e) {
                if (e.code === "ENOENT") {
                    const commands = await this.createCustomCommands(guild_resolvable);
                    
                    await commands.save();

                    this.guilds.set(guild.id, commands);
                }
            }
            
            return await this.getCustomCommands(guild_resolvable);
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
     * Load custom commands for a guild.
     * @param {String} id The ID of the guild to load.
     * @returns {GuildCustomCommands}
     */
    async loadCustomCommands(id) {
        try {
            const data = await fs.readFile(path.resolve(this.path, id + ".json"));
            const json = JSON.parse(data.toString());

            const commands = new GuildCustomCommands(this, id, json);

            this.guilds.set(id, commands);

            this.emit("load", commands);
            
            return commands;
        } catch (e) {
            console.error(e);

            if (e.code === "ENOENT") {
                throw e;
            }

            const commands = this.createCustomCommands(id);

            commands.prevent_save = true;
            
            this.emit("error", id, e);

            return commands;
        }
    }

    /**
     * Load all custom commands from a directory.
     * @returns {discord.Collection<String,GuildCustomCommands>} The custom commands that were loaded.
     */
    async loadFromDirectory() {
        const files = await fs.readdir(this.path);

        /** @type {discord.Collection<String,GuildCustomCommands>} */
        const loaded = new discord.Collection;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const guild_id = file.split(".")[0]; // <snowflake>.json

            const settings = await this.loadCustomCommands(guild_id);

            loaded.set(guild_id, settings);
        }

        return loaded;
    }

    /**
     * Create settings for a guild.
     * @param {discord.GuildResolvable} guild_resolvable The guild to create the settings for.
     * @returns {GuildCustomCommands}
     */
    createCustomCommands(guild_resolvable) {
        const guild = this.client.guilds.resolve(guild_resolvable);

        const commands = new GuildCustomCommands(this, guild.id, {
            commands: [],
            meta: {
                count: 0 
            }
        });

        this.guilds.set(guild.id, commands);

        return commands;
    }
}