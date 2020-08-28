import { CustomCommandRuleGroup, CustomCommandRule } from "./CustomCommandRule.js"

export default new CustomCommandRuleGroup({
    name: "Message",
    description: "Rules for manipulating and replying to the message.",
    emoji: "💬",
    colour: "#1ea3d8",
    rules: [
        new CustomCommandRule({
            id: "97505086-6236-4a27-8761-f751aeacec65",
            name: "Message",
            description: "The message that was sent.",
            params: [],
            callback: function Message() {
                return this.message;
            },
            fallback: null,
            returns: "message"
        }),
        new CustomCommandRule({
            id: "e77d9251-89d3-4e97-860d-d478641d9a8d",
            name: "Last Message",
            description: "The last message that the bot repied with.",
            params: [],
            callback: function LastMessage() {
                return this.replies[0];
            },
            fallback: null,
            returns: "message"
        }),
        new CustomCommandRule({
            id: "de842756-4bbb-46c0-b942-0b5a559d87b0",
            name: "Reply with %",
            description: "Reply to the message.",
            params: ["any"],
            callback: async function ReplyToMessage(text) {
                await this.reply(text);
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "63a1a817-9e70-47c5-a600-96506aebbfe3",
            name: "Delete message",
            description: "Delete the original message.",
            params: [],
            callback: async function DeleteMessage(text) {
                if (this.message.deletable) {
                    await this.message.delete();
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "d36a5b6d-0fc9-4f4d-ba48-97d7cfec0877",
            name: "Delete message %",
            description: "Delete a message.",
            params: ["message"],
            callback: async function DeleteMessage(message) {
                if (message.deletable) {
                    await message.delete();
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "f98674ac-e2e2-4a77-b79f-0cd5701206af",
            name: "Get message by ID %",
            description: "Get a message by it's ID.",
            params: ["string"],
            callback: async function GetMessageByID(id) {
                const message = await this.message.channel.messages.fetch(id);

                return message;
            },
            fallback: null,
            returns: "message"
        }),
        new CustomCommandRule({
            id: "518615a1-01ab-4d69-ad0d-d7eee9978c92",
            name: "ID of %",
            description: "Get the ID of a message.",
            params: ["message"],
            callback: function IDOfMessage(message) {
                return message.id;
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "30ba25af-3731-4b30-86db-1e407ddb0048",
            name: "Contents of %",
            description: "Get the contents of a message.",
            params: ["message"],
            callback: function ContentsOfMessage(message) {
                return message.content;
            },
            fallback: "",
            returns: "string"
        }),
        new CustomCommandRule({
            id: "907fb175-d81d-45d6-9b54-9d95dbeb2422",
            name: "Author of %",
            description: "Get the author of a message.",
            params: ["message"],
            callback: function AuthorOfMessage(message) {
                return message.member;
            },
            fallback: null,
            returns: "member"
        }),
        new CustomCommandRule({
            id: "178d2e32-0f95-4ec3-b164-17c041243743",
            name: "Pin message %",
            description: "Pin a message.",
            params: ["message"],
            callback: async function Pin(message) {
                if (message.pinnable) {
                    await message.pin();
                }
            },
            returns: "void"
        }),
        new CustomCommandRule({
            id: "8af6db7e-a83b-48c7-bb8c-03ce673752e7",
            name: "React to % with %",
            description: "React to a message.",
            params: ["message", "string"],
            callback: async function React(message, react) {
                await message.react(react);
            },
            returns: "void"
        })
    ]
});