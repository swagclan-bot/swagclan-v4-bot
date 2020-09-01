import { CustomCommandRuleGroup, CustomCommandRule } from "./CustomCommandRule.js"

import discord  from "discord.js"

const FLAGS = discord.Permissions.FLAGS;

export default new CustomCommandRuleGroup({
    name: "Permissions",
    description: "Discord role and member permissions.",
    emoji: "👮‍♂️",
    colour: "#ce77ab",
    rules: [
        new CustomCommandRule({
            id: "b2da69db-593e-4fd9-8aee-27bea07c456f",
            name: "Administrator",
            description: "The administrator permission.",
            params: [],
            callback: function Administrator() {
                return FLAGS.ADMINISTRATOR;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "67f1fa4b-fd8e-4ed9-96fa-ad2627a9b74a",
            name: "Create invites",
            description: "The permission to create instant invites to the server.",
            params: [],
            callback: function CreateInvites() {
                return FLAGS.CREATE_INSTANT_INVITE;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "2bfddcb9-66e6-414e-bcc8-013767f450e2",
            name: "Kick members",
            description: "The permission to kick other members.",
            params: [],
            callback: function KickMembers() {
                return FLAGS.KICK_MEMBERS;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "20cce0a4-6cbc-47ab-a744-e81cbf606f21",
            name: "Ban members",
            description: "The permission to ban other members.",
            params: [],
            callback: function BanMembers() {
                return FLAGS.BAN_MEMBERS;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "e3e92184-c1a3-4503-9242-384a10f991f0",
            name: "Manage channels",
            description: "The permission to manage channels.",
            params: [],
            callback: function ManageChannels() {
                return FLAGS.MANAGE_CHANNELS;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "9bdd9240-8f82-4b20-88b4-d8cd958010bc",
            name: "Manage guild",
            description: "The permission to manage guild settings.",
            params: [],
            callback: function ManageGuild() {
                return FLAGS.MANAGE_GUILD;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "1d61e329-cd90-4f6e-9ac1-95855f130a93",
            name: "Add reactions",
            description: "The permission to add reactions to messages.",
            params: [],
            callback: function AddReactions() {
                return FLAGS.ADD_REACTIONS;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "09c9fbbd-c971-4ae7-b8c6-92a72b01f06b",
            name: "View audit log",
            description: "The permission to view audit logs.",
            params: [],
            callback: function ViewAuditLog() {
                return FLAGS.VIEW_AUDIT_LOG;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "6e9e292d-a61f-40e5-adf8-c962ffb31120",
            name: "Priority speaker",
            description: "The permission to be a speak with priority in voice channels.",
            params: [],
            callback: function PrioritySpeaker() {
                return FLAGS.PRIORITY_SPEAKER;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "e9b50981-4ea5-4d08-bab3-4ec224304bf2",
            name: "Stream",
            description: "The permission to steam in a voice channel.",
            params: [],
            callback: function Stream() {
                return FLAGS.STREAM;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "2d3bab60-1ce4-478c-a871-5310ba5f2275",
            name: "View channel",
            description: "The permission to view channels.",
            params: [],
            callback: function ViewChannel() {
                return FLAGS.VIEW_CHANNEL;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "277381ff-d7f8-45bc-9b72-87c10fda2c37",
            name: "Send messages",
            description: "The permission to send messages to channels.",
            params: [],
            callback: function SendMessages() {
                return FLAGS.SEND_MESSAGES;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "e7272d9a-7b06-481b-a62d-7a1955710610",
            name: "Send TTS messages",
            description: "The permission to send text to speech messages to channels.",
            params: [],
            callback: function SendTTSMessages() {
                return FLAGS.SEND_TTS_MESSAGES;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "4e07ba30-c1e8-4516-99be-a9a96ca1e9c1",
            name: "Manage messages",
            description: "The permission to manage messages in a channel.",
            params: [],
            callback: function ManageMessages() {
                return FLAGS.MANAGE_MESSAGES;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "0acdf675-dc1c-4d96-ba44-fe919e5e895e",
            name: "Embed links",
            description: "The permission to embed links in a channel.",
            params: [],
            callback: function EmbedLinks() {
                return FLAGS.EMBED_LINKS;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "aed1b68b-9835-4a39-96cf-8cd7f6854c5f",
            name: "Attach files",
            description: "The permission to send files with messages.",
            params: [],
            callback: function AttachFiles() {
                return FLAGS.ATTACH_FILES;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "04f87a9b-f2a4-4e4b-bcc0-4b5be4fb83a4",
            name: "Read message history",
            description: "The permission to send view messages that were sent previous to opening discord.",
            params: [],
            callback: function ReadMessageHistory() {
                return FLAGS.READ_MESSAGE_HISTORY;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "79c402d3-8c4c-49c2-b6bb-63c7c0f87810",
            name: "Mention everyone",
            description: "The permission to mention everyone in messages.",
            params: [],
            callback: function MentionEveryone() {
                return FLAGS.MENTION_EVERYONE;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "fc72c326-1513-4d12-992c-60630282660e",
            name: "Use external emojis",
            description: "The permission to use emojis from other servers.",
            params: [],
            callback: function UseExternalEmojis() {
                return FLAGS.USE_EXTERNAL_EMOJIS;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "01547cc2-9570-4378-a8da-839c2a2a054d",
            name: "View guild insights",
            description: "The permission to see guild insights.",
            params: [],
            callback: function ViewGuildInsights() {
                return FLAGS.VIEW_GUILD_INSIGHTS;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "fb6aadd0-80d1-4df4-8740-65c153dc8ce2",
            name: "Connect to voice",
            description: "The permission to connect to voice channels.",
            params: [],
            callback: function Connect() {
                return FLAGS.CONNECT;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "7d61cf97-71f9-414a-a6df-77093e5f5c61",
            name: "Speak in voice",
            description: "The permission to speak in voice channels.",
            params: [],
            callback: function Speak() {
                return FLAGS.SPEAK;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "bb81565c-5f8f-4a57-9562-9a3fa8f85fa6",
            name: "Mute members",
            description: "The permission to mute other members in a voice channel.",
            params: [],
            callback: function MuteMembers() {
                return FLAGS.MUTE_MEMBERS;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "3a54b0e6-3a73-420b-85ff-29c566cd7a57",
            name: "Deafen members",
            description: "The permission to deafen other members in a voice channel.",
            params: [],
            callback: function DeafenMembers() {
                return FLAGS.DEAFEN_MEMBERS;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "5c37316f-8e0a-4882-b827-9b9afda0949b",
            name: "Move members",
            description: "The permission to move members to other voice channels.",
            params: [],
            callback: function DeafenMembers() {
                return FLAGS.DEAFEN_MEMBERS;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "bff315cb-928b-4366-8561-7515cc2be756",
            name: "Use voice activity detection",
            description: "The permission to use voice activity detection in voice channels.",
            params: [],
            callback: function UseVAD() {
                return FLAGS.USE_VAD;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "41143fef-d41d-414e-91ad-a99d1f97c5b5",
            name: "Change nicknames",
            description: "The permission to change nickname.",
            params: [],
            callback: function ChangeNickname() {
                return FLAGS.CHANGE_NICKNAME;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "aa380d58-d099-433f-bd2e-e7977556e389",
            name: "Manage nicknames",
            description: "The permission to change the nicknames of other members.",
            params: [],
            callback: function ManageNicknames() {
                return FLAGS.MANAGE_NICKNAMES;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "c21611e3-9e1e-4d45-9d9e-f2b5a75ad14a",
            name: "Manage roles",
            description: "The permission to manage roles.",
            params: [],
            callback: function ManageRoles() {
                return FLAGS.MANAGE_ROLES;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "b9cf52c7-3cef-4954-a7c5-eaae2c46ea33",
            name: "Manage webhooks",
            description: "The permission to manage channel webhooks.",
            params: [],
            callback: function ManageWebhooks() {
                return FLAGS.MANAGE_WEBHOOKS;
            },
            returns: "permission"
        }),
        new CustomCommandRule({
            id: "9d0c06ec-ba4c-4407-9ea5-1cc4381a4d33",
            name: "Manage emojis",
            description: "The permission to manage guild emojis.",
            params: [],
            callback: function ManageEmojis() {
                return FLAGS.MANAGE_EMOJIS;
            },
            returns: "permission"
        })
    ]
});