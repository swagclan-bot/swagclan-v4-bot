// Imports
import express from "express"
import bodyParser from "body-parser"
import ratelimit from "express-rate-limit"
import cors from "cors"

import assetRouter from "./routes/assets.js"

import errors from "./controllers/errors.js"

export default async function api(client) {
    const app = express();
    
    app.use(bodyParser.json());
    
    app.use(cors({
        origin: process.env.BASE_WEB,
        credentials: true
    }));
    
    app.use("/asset", assetRouter);

    if (process.env.ENVIRONMENT === "production") {
        server.use(ratelimit({
            windowMs: 60000,
            max: 60,
            message: {
                error: errors.APIError.E429
            }
        }));
    }

    if (process.env.ENVIRONMENT === "development") {
        server.use(async (req, res, next) => {
            setTimeout(next, (Math.random() + 1) * 150);
        });
    }

    app.get("*", errors.NotFound);
    
    server.listen(process.env.PORT, async () => {
        console.success("API server listening at *:" + process.env.PORT);
    });

    process.on("uncaughtException", async err => {
        if (err.code === "EADDRINUSE") {
            console.error("Failed to start API server, port in use.");
        } else {
            throw err;
        }
    });
}