import client from "./client/index.js"

(async () => {
    const api = await import("./api/index.js");

    api.default(await client());
})();