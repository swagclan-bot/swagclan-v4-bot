import joi from "joi"

const MIN_NAME = 3;
const MAX_NAME = 20;
const MAX_DESCRIPTION = 200;

const MAX_TRIGGERS = 5;
const MAX_TRIGGER_NAME = 20;
const TRIGGER_TYPES = [
    "command",
    "startsWith",
    "contains",
    "exact",
    "matches"
];

const MAX_PARAMETERS = 3;
const MAX_PARAMETER_NAME = 20;
const PARAMETER_TYPES = [
    "number",
    "string",
    "boolean",
    "member",
    "channel",
    "role",
    "exact"
];

const MAX_VARIABLES = 3;
const MAX_VARIABLE_NAME = 20;
const VARIABLE_TYPES = [
    "number",
    "string",
    "boolean",
    "member",
    "channel",
    "role",
    "date",
    "message",
    "permission",
    "void"
];

const MAX_INPUT = 2000;

const MAX_ACTIONS = 10;

const MAX_TIMEOUT = 86400000;

export const parameter_schema = joi.object().keys({
    type: joi.string().allow(...PARAMETER_TYPES).required(),
    name: joi.string().max(MAX_PARAMETER_NAME).required()
});

export const variable_schema = joi.object().keys({
    type: joi.string().allow(...VARIABLE_TYPES).required(),
    name: joi.string().required().max(MAX_VARIABLE_NAME)
});

export const input_schema = joi.object().keys({
    type: joi.string().allow("input").required(),
    value: joi.string().max(MAX_INPUT).required()
});

export const ctx_var_schema = joi.object().keys({
    type: joi.string().allow("ctx_var").required(),
    name: joi.string().required()
});

export const action_schema = joi.object().keys({
    type: joi.string().required().allow("action"),
    rule: joi.object().keys({
        group: joi.string().required(),
        id: joi.string().required()
    }),
    arguments: joi.array().required().items(joi.link(".."), joi.allow(null))
})

export const expression_schema = joi.any().allow(input_schema, ctx_var_schema, action_schema);

export const post_command_schema = joi.object().keys({
    name: joi.string().required().min(MIN_NAME).max(MAX_NAME),
    description: joi.string().required().min(0).allow("").max(MAX_DESCRIPTION),
    triggers: joi.array().required().items(joi.object().keys({
		type: joi.string().required().allow(...TRIGGER_TYPES),
		name: joi.string().required().max(MAX_TRIGGER_NAME)
	})).max(MAX_TRIGGERS),
    parameters: joi.object().required().pattern(/^/, parameter_schema).max(MAX_PARAMETERS),
    variables: joi.object().required().pattern(/^/, variable_schema).max(MAX_VARIABLES),
    actions: joi.array().required().items(expression_schema).max(MAX_ACTIONS),
    timeout: joi.number().required().positive().integer().allow(0).max(MAX_TIMEOUT),
    enabled: joi.boolean().required(),
    hidden: joi.boolean().required(),
    sweepable: joi.boolean().required()
});

export const put_command_schema = post_command_schema.keys({
    id: joi.string().required().pattern(/^[0-9]+$/)
});

export default {
    parameter_schema,
    variable_schema,
    input_schema,
    ctx_var_schema,
    action_schema,
    expression_schema,
    post_command_schema,
    put_command_schema
}