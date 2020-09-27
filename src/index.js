import "./client/index.js"

import runtime_config from "./runtime.cfg.js"

if (runtime_config.oldapi) {
    await import("./api/index.js");
} else {
    await import("./api/index_new.js");
}