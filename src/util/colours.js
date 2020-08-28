// Imports
import "colors"

import randomstring from "randomstring"
import mkdirp from "mkdirp"
import utils from "util"
import fs from "fs"

import runtime_config from "../runtime.cfg.js"
import runtime_id from "../runtime.id.js"

export default async () => {
    // await mkdirp("logs");

    const log_stream = fs.createWriteStream("logs.txt", { // "logs/" + runtime_id + ".txt", {
        flags: "a"
    });

    console._log = (...log) => {
        const log_id = randomstring.generate({
            length: 20,
            charset: "hex",
            capitalization: "lowercase"
        });

        const format = utils.format(...log);
        const stripped = format.replace(/\x1b\[[0-9]+m/g, "");

        console.log("[" + new Date().toISOString() + "]", ...log);

        log_stream.write("{" + log_id + "} [" + new Date().toISOString() + "] " + stripped + "\n");

        return log_id;
    }

    console.success = (...log) => {
        return console._log("[SUCCESS]".bgGreen, ...log);
    }

    console.info = (...log) => {
        return console._log("[INFO]".bgBlue, ...log);
    }

    console.debug = (...log) => {
        if (runtime_config.debug) {
            return console._log("[DEBUG]".bgYellow, ...log);
        }
    }

    console.error = (...log) => {
        return console._log("[ERROR]".bgRed, ...log);
    }
}