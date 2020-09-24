import oauth2 from "client-oauth2"

import credentials from "../../../.credentials.js"

export const discord = new oauth2({
    clientId: credentials.client_id,
    clientSecret: credentials.client_secret,
    accessTokenUri: "https://discord.com/api/v6/oauth2/token",
    authorizationUri: "https://discord.com/oauth2/authorize",
    redirectUri: process.env.BASE_API + "/auth/discord/callback",
    scopes: ["identify", "email", "guilds"]
});

export default {
    discord
}