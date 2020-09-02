import discord from "discord.js"

import { CustomCommandRuleGroup, CustomCommandRule } from "./CustomCommandRule.js"

export default new CustomCommandRuleGroup({
    name: "Member",
    description: "Rules for manipulating and getting information about members.",
    emoji: "👥",
    colour: "#b929e5",
    rules: [
        new CustomCommandRule({
            id: "8fbe4bb5-80f0-4bc2-bc52-8b60829dd293",
            name: "Message author",
            description: "Get the author of the message.",
            params: [],
            callback: function GetMessageAuthor() {
                return this.message.member;
            },
            fallback: null,
            returns: "member"
        }),
        new CustomCommandRule({
            id: "45e49b61-2760-4dc9-904b-62b7508df68c",
            name: "Get member by ID %",
            description: "Get a member by their ID.",
            params: ["string"],
            callback: function GetMemberByID(id) {
                return this.message.guild.members.resolve(id);
            },
            fallback: null,
            returns: "member"
        }),
        new CustomCommandRule({
            id: "7026f3b7-adf5-43cf-8295-7b8d6745a1fe",
            name: "Get member by tag %",
            description: "Get a member by their tag.",
            params: ["string"],
            callback: function GetMemberByTag(tag) {
                return this.message.guild.members.cache.filter(member => member.user.tag === tag).first();
            },
            fallback: null,
            returns: "member"
        }),
        new CustomCommandRule({
            id: "bc46ef81-8240-4228-9039-ab0755c91a52",
            name: "ID of %",
            description: "Get the ID of a member.",
            params: ["member"],
            callback: function IDOfMember(member) {
                return member.user.id;
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "cdaa4c8d-cc16-4c39-a696-66b63694f90e",
            name: "Username of %",
            description: "Get the username of a member.",
            params: ["member"],
            callback: function UsernameOfMember(member) {
                return member.user.username;
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "58b593c2-ada7-49b0-9fc0-7bf313ae7c9e",
            name: "Nickname of %",
            description: "Get the nickname of a member.",
            params: ["member"],
            callback: function UsernameOfMember(member) {
                return member.nickname || member.user.username;
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "7a8e1ccf-3331-47cb-a252-13e96376cfb6",
            name: "Discriminator of %",
            description: "Get the discriminator of a member.",
            params: ["member"],
            callback: function DiscriminatorOfMember(member) {
                return member.user.discriminator;
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "2d070602-9df7-428b-b459-289a1c49d1be",
            name: "Tag of %",
            description: "Get the tag of a member.",
            params: ["member"],
            callback: function TagOfMember(member) {
                return member.user.tag;
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "36c47693-cfd4-4de7-bf14-68be3246d683",
            name: "Mention %",
            description: "Mention the member.",
            params: ["member"],
            callback: function MentionMember(member) {
                return "<@" + member.id + ">";
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "0b5d2327-07a3-4199-be0a-130f0e961775",
            name: "Avatar URL of %",
            description: "Get the avatar URL of a member.",
            params: ["member"],
            callback: function AvatarURLOfMember(member) {
                return member.user.avatarURL("png");
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "a72ebd1e-f099-4093-8f86-9c27b45614eb",
            name: "% is bot",
            description: "Check whether a member is a bot.",
            params: ["member"],
            callback: function MemberIsBot(member) {
                return member.user.bot;
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "77193541-59dd-4877-81d9-d0bfe53f4616",
            name: "Set nickname of % to %",
            description: "Set the nickname of a member to something.",
            params: ["member", "string"],
            callback: async function SetNickname(member, nickname) {
                if (nickname.length <= 32 && nickname.length > 0) {
                    if (member.manageable) {
                        await member.setNickname(nickname);
                    }
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "68c0c649-2d4f-4f89-a0dd-9f2e46c3b8a1",
            name: "Ban %",
            description: "Ban a member.",
            params: ["member"],
            callback: async function BanMember(member) {
                if (member.bannable) {
                    await member.ban();
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "3746c47a-5141-4072-820a-01f25af83c2f",
            name: "Kick %",
            description: "Kick a member.",
            params: ["member"],
            callback: async function KickMember(member) {
                if (member.kickable) {
                    await member.kick();
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "6522bdef-f7d5-4902-b2f8-01ff838cb0d9",
            name: "Kick % with reason %",
            description: "Kick a member with a reason.",
            params: ["member", "string"],
            callback: async function KickMember(member, reason) {
                if (member.kickable) {
                    await member.kick(reason);
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "4542c410-2f53-4549-8bb9-7c1a15774fc0",
            name: "Last message of %",
            description: "Get the last message of a member.",
            params: ["member"],
            callback: function LastMessageOf(member) {
                return member.lastMessage;
            },
            returns: "message"
        }),
        new CustomCommandRule({
            id: "a2478d98-9900-478f-aa9e-9cc8288d83fa",
            name: "Give role % to %",
            description: "Give a role to a member.",
            params: ["role", "member"],
            callback: async function GiveRoleToMember(role, member) {
                await member.roles.add(role);
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "7fcd298d-8e4b-4b23-a682-a68883c9baef",
            name: "Remove role % from %",
            description: "Remove a role from a member.",
            params: ["role", "member"],
            callback: async function RemoveRoleFromMember(role, member) {
                /*if (role === ALL_ROLES) {
                    await member.roles.remove(member.roles.cache);
                } else {*/
                    await member.roles.remove(role);
                // }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "464149a8-2859-4edf-9a99-b4bf40e3b523",
            name: "Member % has role %",
            description: "Check whether a member has a role.",
            params: ["member", "role"],
            callback: function MemberHasRole(member, role) {
                return member.roles.cache.get(role.id);
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "e560a24b-b3c4-4bc0-8880-248e0008e60e",
            name: "Member % has permission %",
            description: "Check whether a member has a permission.",
            params: ["member", "permission"],
            callback: function MemberHasPermission(member, permission) {
                return member.hasPermission(permission);
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "40948cdf-0c1c-4933-8a84-b17c21acee5e",
            name: "Member % can manage %",
            description: "Check whether a member should be able to manage another member .",
            params: ["member", "member"],
            callback: function MemberCanManage(member1, member2) {
                const FLAGS = discord.Permissions.FLAGS;

                return member1.hasPermission(FLAGS.MANAGE_NICKNAMES) && member1.hasPermission(FLAGS.KICK_MEMBERS) && member1.hasPermission(FLAGS.BAN_MEMBERS) // "Manage members?"
                    && member1.guild.ownerID !== member2.user.id &&
                    (member1.guild.ownerID === member1.user.id || member1.roles.highest.comparePositionTo(member2.roles.highest) > 0);
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "d3e83107-20ee-47f0-91fc-af8681cb0f46",
            name: "Hoist role of %",
            description: "Get the hoist role of a member.",
            params: ["member"],
            callback: function GetHoistRole(member) {
                return member.roles.hoist;
            },
            fallback: null,
            returns: "role"
        }),
        new CustomCommandRule({
            id: "8d3e498e-4de1-4bdf-81e0-4562b774e471",
            name: "Highest role of %",
            description: "The highest role of the member.",
            params: ["member"],
            callback: function GetHighestRole(member) {
                return member.roles.highest;
            },
            fallback: null,
            returns: "role"
        }),
        new CustomCommandRule({
            id: "ae6809b3-0c43-4ba2-8b14-4b48dba3da91",
            name: "Colour role of %",
            description: "The colour role of the member.",
            params: ["member"],
            callback: function GetColourRole(member) {
                return member.roles.color;
            },
            fallback: null,
            returns: "role"
        }),
        new CustomCommandRule({
            id: "2d5ddb54-c5ff-4891-8878-bf1cde085970",
            name: "Send % to %",
            description: "Send a message to another member.",
            params: ["string", "member"],
            callback: async function SendMessage(text, member) {
                await member.send(text);
            },
            returns: "void"
        })
    ]
});