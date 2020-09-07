import { CustomCommandRuleGroup, CustomCommandRule } from "./CustomCommandRule.js"

import randomstring from "randomstring"

export default new CustomCommandRuleGroup({
    name: "String",
    description: "Rules for string matching and manipulation.",
    emoji: "🧵",
    colour: "#3fbf8e",
    rules: [
        new CustomCommandRule({
            id: "c135b760-9a39-432e-9e24-e7acab21b4d1",
            name: "Join %%",
            description: "Join two strings together.",
            params: ["any", "any"],
            callback: function Join(a, b) {
                return a + b;
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "dfac8273-c5df-4da5-a395-4b0fd9562510",
            name: "% to string",
            description: "Convert any value into a string.",
            params: ["any"],
            callback: function ToString(val) {
                return val + "";
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "9a427fd2-51e4-4d50-8c80-bbcfb188e676",
            name: "String % starts with %",
            description: "Check if a string starts with a value.",
            params: ["string", "string"],
            callback: function StringStartsWith(str, substr) {
                return str.startsWith(substr);
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "4ad48234-d092-4866-9d06-9f6ca676fe09",
            name: "String % ends with %",
            description: "Check if a string ends with a value.",
            params: ["string", "string"],
            callback: function StringEndsWith(str, substr) {
                return str.endsWith(substr);
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "e20d738d-edc4-4c11-aa9f-a0cc3fa9b907",
            name: "String % matches %",
            description: "Check if a string matches a regex.",
            params: ["string", "string"],
            callback: function StringMatchesRegex(str, regex) {
                try {
                    return RegExp(regex).test(str);
                } catch {
                    return false;
                }
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "df2766d6-e124-4d89-b1a2-e88f19a1ca6b",
            name: "Character % of %",
            description: "Get a character at a point in a string.",
            params: ["number", "string"],
            callback: function CharacterIOfString(index, str) {
                return str[index];
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "224495ba-7f79-4ea6-9258-494976a52608",
            name: "Length of %",
            description: "Get the length of a string.",
            params: ["string"],
            callback: function LengthOf(str) {
                return str.length;
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "8b1103ce-bcb3-487a-aa11-d11fbd3b35d3",
            name: "Substring of % from % to %",
            description: "Get part of a string.",
            params: ["string", "number", "number"],
            callback: function Substring(str, start, end) {
                return str.substring(start, end);
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "1cc337bf-cf82-4423-8ddd-bcbd0bf0c8b4",
            name: "Substring of % from % with length %",
            description: "Get part of a string.",
            params: ["string", "number", "number"],
            callback: function Substring(str, start, length) {
                return str.substr(start, length);
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "64d6a69d-1d89-43c3-af35-c7d7ff938424",
            name: "Random string with length %",
            description: "Create a string with random characters of a certain length.",
            params: ["number"],
            callback: function RandomString(length) {
                return randomstring.generate(length);
            },
            fallback: "",
            returns: "string"
        })
    ]
});