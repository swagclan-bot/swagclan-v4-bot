// Imports
import express from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import randomstring from "randomstring"
import ratelimit from "express-rate-limit"
import cors from "cors"

import assetRouter from "./routes/assets.js"
import basicRouter from "./routes/basic.js"
import oauthRouter from "./routes/oauth.js"
import accountRouter from "./routes/auth/account.js"

import errors from "./schema/Errors.js"

import client from "../client/index.js"

const app = express();

app.use(cookieParser());
app.use(async (req, res, next) => {
    if (!req.cookies.sid) {
        const sid = randomstring.generate({
            length: 35,
            charset: "hex",
            capitalization: "lowercase"
        });

        res.cookie("sid", sid, {
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        req.cookies.sid = sid;
    }

    next();
});

app.use(bodyParser.json());

app.use(cors({
    origin: process.env.BASE_WEB,
    credentials: true
}));

if (process.env.ENVIRONMENT === "production") {
    app.use(ratelimit({
        windowMs: 60000,
        max: 60,
        message: {
            error: errors.APIError.E429
        }
    }));
}

if (process.env.ENVIRONMENT === "development") {
    app.use(async (req, res, next) => {
        setTimeout(next, (Math.random() + 1) * 150);
    });
}

app.use("/asset", assetRouter);

app.use("/", basicRouter);
app.use("/auth", oauthRouter);
app.use("/", accountRouter);

app.get("*", errors.Not_Found);

app.listen(process.env.PORT, async () => {
    console.success("API server listening at *:" + process.env.PORT);
});

process.on("uncaughtException", async err => {
    if (err.code === "EADDRINUSE") {
        console.error("Failed to start API server, port in use.");
    } else {
        console.error("Failed to start API server.");
        throw err;
    }
});

export default app;