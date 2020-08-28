import { CustomCommandRuleGroup, CustomCommandRule } from "./CustomCommandRule.js"

export default new CustomCommandRuleGroup({
    name: "Logic",
    description: "Rules for logical conditions and control.",
    emoji: "🎞",
    colour: "#f58300",
    rules: [
        new CustomCommandRule({
            id: "948d56f3-e771-4041-ad38-5aa814831b5b",
            name: "Wait %ms",
            description: "Wait for a number of milliseconds.",
            params: ["number"],
            callback: function ReplyToMessage(miliseconds) {
                return new Promise(resolve => {
                    setTimeout(resolve, miliseconds);
                });
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "d0fda121-932c-4675-bae5-3c54a7005498",
            name: "Stop if %",
            description: "Stop the script if the value is truthy.",
            params: ["boolean"],
            callback: function StopTheScript(val) {
                if (val) {
                    this.script.stop();
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "47e99fca-8d99-426f-8bbf-8a0875fda9ee",
            name: "% and stop",
            description: "Run a rule then stop the script, useful for in if statements.",
            params: ["void"],
            callback: async function AndStop(rule) {
                if (rule) {
                    await rule.evaluate(this);
                }

                this.script.stop();
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "b8c360fd-0daa-4635-b969-6a599421c789",
            name: "If % run % else %",
            description: "Run a script only if the value is truthy.",
            params: ["boolean", "void", "void"],
            callback: async function IfStatement(val, rule, _else) {
                if (val) {
                    if (rule) {
                        await rule.evaluate(this);
                    }
                } else {
                    if (_else) {
                        await _else.evaluate(this);
                    }
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "87dbb603-9a4d-4bab-a398-ab65dbe27556",
            name: "true",
            description: "A true boolean.",
            params: [],
            callback: function True() {
                return true;
            },
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "e049fda9-5e1d-4d79-8547-4f305b444aa1",
            name: "false",
            description: "A false boolean.",
            params: [],
            callback: function False() {
                return false;
            },
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "3ca29c6b-9417-4a63-8d4a-fd40c0963238",
            name: "% = %",
            description: "Check if two values are equal.",
            params: ["any", "any"],
            callback: function EqualValues(a, b) {
                return a == b;
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "7bd92311-430d-4c93-989c-168783649739",
            name: "% > %",
            description: "Check if a value if greater than the other.",
            params: ["any", "any"],
            callback: function GreaterThan(a, b) {
                return a > b;
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "f180ac14-3f57-41ce-ab59-38c77a6104af",
            name: "% < %",
            description: "Check if a value if lesser than the other.",
            params: ["any", "any"],
            callback: function GreaterThan(a, b) {
                return a < b;
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "f93e4208-64ca-49cf-a1ce-ffeb2135aad0",
            name: "% and %",
            description: "Returns true if both inputs are truthy.",
            params: ["any", "any"],
            callback: function And(a, b) {
                return a && b;
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "e05c9871-b253-488c-b736-636bb7c5bed7",
            name: "% or %",
            description: "Returns true if either inputs are truthy.",
            params: ["any", "any"],
            callback: function Or(a, b) {
                return a || b;
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "e6484b16-8e3f-4da0-b9f2-e14172bc13ec",
            name: "Not %",
            description: "Returns true if the input is false and false if it is true.",
            params: ["any"],
            callback: function Not(a) {
                return !a;
            },
            fallback: true,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "7c9d13e0-f683-4956-8422-457450df7fce",
            name: "% to boolean",
            description: "Convert any value into a boolean.",
            params: ["any"],
            callback: function ToString(val) {
                return Boolean(val);
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "29b1ce3c-5da5-4a76-83c3-0a7a2f5108a5",
            name: "% exists",
            description: "Check whether or not a value exists.",
            params: ["any"],
            callback: function Exists(val) {
                return Boolean(val);
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "3f0b8ae9-a33d-4034-b1dd-57c913ae9e6b",
            name: "Set % to %",
            description: "Change a variable's value.",
            params: ["var", "any"],
            callback: function SetVariable(variable, value) {
                if (this.vars[variable.name]) {
                    this.vars[variable.name].value = value;
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "6ad6072a-94dd-4a79-a703-8936a03a79c6",
            name: "Reset %",
            description: "Reset a variable to it's inital value.",
            params: ["var"],
            callback: function SetVariable(variable, value) {
                if (this.vars[variable.name]) {
                    this.vars[variable.name].value = this.script?.command?.variales?.[variable.name]?.inital || null;
                }
            },
            returns: "void"
        })
    ]
});