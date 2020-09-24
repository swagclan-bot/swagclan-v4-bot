// Imports
import dotenv from "dotenv"

import runtime_config from "./src/runtime.cfg.js"

dotenv.config();

import colours from "./src/util/colours.js"

if (runtime_config.debug) {
    await colours();
} else {
    await colours({
        suppress_errs: ["DiscordAPIError: Unknown Message", "Unhandled promise rejection", ...runtime_config.suppress]
    });
}

await import("./src/index.js");