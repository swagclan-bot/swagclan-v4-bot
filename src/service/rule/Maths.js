import { CustomCommandRuleGroup, CustomCommandRule } from "./CustomCommandRule.js"

export default new CustomCommandRuleGroup({
    name: "Maths",
    description: "Mathematical operations for making calculations.",
    emoji: "➕",
    colour: "#32cc49",
    rules: [
        new CustomCommandRule({
            id: "98991505-e365-401a-bcdc-074d087a0046",
            name: "Random",
            description: "Pick a psuedo-random number between 0 and 1",
            params: [],
            callback: function Random() {
                return Math.random();
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "743f801e-b7d5-4548-816f-8d86a14a507b",
            name: "Random from % to %",
            description: "Pick a pseudo-random number from a range.",
            params: ["number", "number"],
            callback: function RandomNumber(min, max) {
                const precision = Math.max((min.toString().split(".")[1] || "").length, (max.toString().split(".")[1] || "").length);
                const range = max - min;

                return Number((Math.random() * range + min).toFixed(precision));
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
        }),
        new CustomCommandRule({
            id: "6b47ab74-d96d-4901-83ff-e7edb0c8c7ba",
            name: "% ^ %",
            description: "A number to the power of another.",
            params: ["number", "number"],
            callback: function Pow(a, b) {
                return Math.pow(a, b);
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "dd90aa3d-3f4d-44b7-8a4b-d330e1cfb68b",
            name: "Floor of %",
            description: "The number rounded down.",
            params: ["number"],
            callback: function Floor(a) {
                return Math.floor(a);
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "75c67d15-dac7-4c7b-8098-2c024c5694fb",
            name: "Ceil of %",
            description: "The number rounded up.",
            params: ["number"],
            callback: function Ceil(a) {
                return Math.ceil(a);
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "8eedecc1-0c37-4c45-b1e0-e4f072cffbc5",
            name: "Round %",
            description: "The number rounded to the nearest integer.",
            params: ["number"],
            callback: function Round(a) {
                return Math.round(a);
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "62f49e4c-0255-4d54-b0d9-80522448292f",
            name: "Round % to % places",
            description: "The number rounded to a specified number of decimal places.",
            params: ["number", "number"],
            callback: function RoundToPlace(a, b) {
                return a.toFixed(b);
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "82de075c-8133-4a86-b8d3-94d1372cdd2f",
            name: "Abs of %",
            description: "The absolute value of the number.",
            params: ["number"],
            callback: function Abs(a) {
                return Math.abs(a);
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "d8a6bfa6-ee28-4135-9ebe-c239bd58edc7",
            name: "Sine of %",
            description: "The sine value of the number.",
            params: ["number"],
            callback: function Sine(a) {
                return Math.sin(a);
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "146e2469-50a7-423e-b310-bff3306d7ba3",
            name: "Cosine of %",
            description: "The cosine value of the number.",
            params: ["number"],
            callback: function Cosine(a) {
                return Math.cos(a);
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "561701c5-d6e9-4e91-9462-3618919c0e57",
            name: "Tangent of %",
            description: "The tangent value of the number.",
            params: ["number"],
            callback: function Tangent(a) {
                return Math.tan(a);
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "c6b26e0a-7591-43e9-a018-98ed576b124d",
            name: "Square root of %",
            description: "The square root of the number.",
            params: ["number"],
            callback: function Root(a) {
                return Math.sqrt(a);
            },
            fallback: 0,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "6fa7cc19-b2c5-4f86-96f9-725fce323d36",
            name: "PI",
            description: "The value of PI.",
            params: [],
            callback: function PI() {
                return Math.PI;
            },
            fallback: 3.141592653589793,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "73a9dc8e-259f-4b35-a034-d13a543b6ea3",
            name: "E",
            description: "Euler's constant and the base of natural logarithms.",
            params: [],
            callback: function E() {
                return Math.E;
            },
            fallback: 2.718281828459045,
            returns: "number"
        }),
        new CustomCommandRule({
            id: "aebf5e2e-876c-42c7-b31d-f709af2908c8",
            name: "Exp of %",
            description: "E^x, the base of the base of the natural logarithm.",
            params: ["number"],
            callback: function Exp(a) {
                return Math.exp(a);
            },
            fallback: 0,
            returns: "number"
        })
    ]
});