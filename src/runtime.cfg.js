import yargs from "yargs"

export default yargs
    .option("debug", {
        type: "boolean",
        description: "Run in debug mode.",
        default: false
    })
    .option("lichessdev", {
        type: "boolean",
        description: "Use a local development version of lichess.",
        default: false
    })
    .option("suppress", {
        type: "array",
        description: "Suppress an error message.",
        default: []
    })
    .option("old-api", {
        type: "boolean",
        description: "Use the old API.",
        default: false
    })
    .argv;