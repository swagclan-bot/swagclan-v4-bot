import { CustomCommandRuleGroup, CustomCommandRule } from "./CustomCommandRule.js"

export default new CustomCommandRuleGroup({
    name: "Role",
    description: "Rules for manipulating and getting information about roles.",
    emoji: "🏷",
    colour: "#eed0ad",
    rules: [
        new CustomCommandRule({
            id: "685ddf25-3786-4792-bf8e-9e573c286633",
            name: "Get role by ID %",
            description: "Get a role by it's ID.",
            params: ["string"],
            callback: function GetRoleByID(id) {
                return this.message.guild.roles.resolve(id);
            },
            fallback: null,
            returns: "role"
        }),
        new CustomCommandRule({
            id: "eda97e56-cfb0-4124-bd0b-15e0a145dff1",
            name: "Get role by name %",
            description: "Get a role by it's name.",
            params: ["string"],
            callback: function GetRoleByName(name) {
                return this.message.guild.roles.cache.filter(role => role.name === name).first();
            },
            fallback: null,
            returns: "role"
        }),
        new CustomCommandRule({
            id: "655690df-c04b-4f99-a42f-3c35bc10bdf2",
            name: "ID of %",
            description: "Get the id of a role.",
            params: ["role"],
            callback: function IDOfRole(role) {
                return role?.id;
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "a88a4e0e-ab99-49fc-8cd9-719e307b7bfe",
            name: "Name of %",
            description: "Get the name of a role.",
            params: ["role"],
            callback: function NameOfRole(role) {
                return role?.name;
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "b3307fb7-21b7-45ae-a265-0e7829c7ccf0",
            name: "Hex colour of %",
            description: "Get the hex colour of a role.",
            params: ["role"],
            callback: function ColourOfRole(role) {
                return "#" + role?.color.toString(16);
            },
            fallback: "#000000",
            returns: "number"
        }),
        new CustomCommandRule({
            id: "b3307fb7-21b7-45ae-a265-0e7829c7ccf0",
            name: "Colour of %",
            description: "Get the colour of a role.",
            params: ["role"],
            callback: function ColourOfRole(role) {
                return role?.color;
            },
            fallback: 0x0,
            returns: "string"
        }),
        new CustomCommandRule({
            id: "5c23f435-a9ce-4e30-8a01-aa88ef52b0d0",
            name: "% hoists",
            description: "Check if a role hoists a member into a separate member section.",
            params: ["role"],
            callback: function DoesRoleHoist(role) {
                return role?.hoist;
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "a92fc08d-41ea-4f27-92f8-ccfdf952e1ff",
            name: "% is mentionable",
            description: "Check if a role is mentionable.",
            params: ["role"],
            callback: function IsRoleMentionable(role) {
                return role?.mentionable;
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "80c54ada-ce56-4178-9af6-94af6773b3f8",
            name: "Position of %",
            description: "Get the position of a role.",
            params: ["role"],
            callback: function PositionOfRole(role) {
                return role?.position;
            },
            fallback: 0,
            returns: "string"
        }),
        new CustomCommandRule({
            id: "357eb024-07c2-490d-9546-bf088431c658",
            name: "Role % higher than %",
            description: "Check if a role is higher than another.",
            params: ["role", "role"],
            callback: function HigherRole(role1, role2) {
                if (!role1 && role2) {
                    return false;
                }

                if (role1 && !role2) {
                    return true;
                }

                if (!role1 && !role2) {
                    return false;
                }

                return role1.comparePositionTo(role2) > 0;
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "6b06643a-991a-4679-83d7-ff9c1e59d663",
            name: "Role % lower than %",
            description: "Check if a role is lower than another.",
            params: ["role", "role"],
            callback: function LowerRole(role1, role2) {
                if (!role1 && role2) {
                    return true;
                }

                if (role1 && !role2) {
                    return false;
                }

                if (!role1 && !role2) {
                    return false;
                }

                return role1.comparePositionTo(role2) < 0;
            },
            fallback: false,
            returns: "boolean"
        }),
        new CustomCommandRule({
            id: "cf796806-a354-4c07-83f3-74cccf7b9aa9",
            name: "Delete role %",
            description: "Delete a role.",
            params: ["role"],
            callback: async function DeleteRole(role) {
                if (role?.deletable) {
                    await role.delete();
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "9b736ebc-502e-4d5c-b56b-3a692788eb88",
            name: "Set name of % to %",
            description: "Change the name of a role.",
            params: ["role", "string"],
            callback: async function SetName(role, name) {
                if (role?.editable) {
                    await role.setName(name);
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "51736f8a-c0aa-44e2-96fb-d564bb39e21c",
            name: "Set colour of % to %",
            description: "Change the colour of a role.",
            params: ["role", "string"],
            callback: async function SetColour(role, colour) {
                if (role?.editable) {
                    await role.setColor(colour);
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "f8226fdd-0d4d-4100-98d8-94b85d7de7a9",
            name: "Set hoistable of % to %",
            description: "Change whether a role is hoistable.",
            params: ["role", "boolean"],
            callback: async function SetColour(role, hoistable) {
                if (role?.editable) {
                    await role.setHoistable(hoistable);
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "a8a086bf-5b92-4436-9d64-9c97f381f26f",
            name: "Set mentionable of % to %",
            description: "Change whether a role is mentionable",
            params: ["role", "boolean"],
            callback: async function SetColour(role, mentionable) {
                if (role?.editable) {
                    await role.setMentionable(hoistable);
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "e97e96b7-6ce1-4354-abba-f443ac4b5016",
            name: "Date created of %",
            description: "When the role was first created.",
            params: ["role"],
            callback: async function GetCreated(role) {
                return role?.createdAt || new Date(0);
            },
            returns: "date"
        })
    ]
});