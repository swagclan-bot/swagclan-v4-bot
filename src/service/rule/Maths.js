import { CustomCommandRuleGroup, CustomCommandRule } from "./CustomCommandRule.js"

export default new CustomCommandRuleGroup({
    name: "Maths",
    description: "Mathematical operations for making calculations.",
    emoji: "➕",
    colour: "#32cc49",
    rules: [
        new CustomCommandRule({
            id: "743f801e-b7d5-4548-816f-8d86a14a507b",
            name: "Random from % to %",
            description: "Pick a random number from a range.",
            params: ["number", "number"],
            callback: function RandomNumber(min, max) {
                const precision = Math.max((min.toString().split(".")[1] || "").length, (max.toString().split(".")[1] || "").length);
                const range = max - min;

                return Number((Math.floor(Math.random() * (range + 1)) + min).toFixed(precision));
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "64cdcaa9-d770-45a5-b0ab-28de002ad36b",
            name: "% + %",
            description: "Add two numbers together.",
            params: ["number", "number"],
            callback: function AddTwoNumbers(a, b) {
                return a + b;
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "11553dae-c70f-47c5-8bfd-abf833cb62eb",
            name: "% / %",
            description: "Divide a number by another.",
            params: ["number", "number"],
            callback: function DivideNumber(a, b) {
                return a / b;
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "328e294a-2290-45e9-a42e-308443cfa5de",
            name: "% * %",
            description: "Multiply two numbers together.",
            params: ["number", "number"],
            callback: function MultiplyTwoNumbers(a, b) {
                return a * b;
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "55355dca-610c-4f06-b4bf-3e7e8e5ee016",
            name: "% - %",
            description: "Take a number from another.",
            params: ["number", "number"],
            callback: function TakeNumber(a, b) {
                return a - b;
            },
            fallback: 0,
            returns: "number"
        })
    ]
});