import yargs from "yargs"

export default yargs
    .option("debug", {
        type: "boolean",
        description: "Whether or not to run in debug mode or not.",
        default: false
    })
    .option("lichessdev", {
        type: "boolean",
        description: "Whether or not to use a local development version of lichess.",
        default: false
    })
    .argv;