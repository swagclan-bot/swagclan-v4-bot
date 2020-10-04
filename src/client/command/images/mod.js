// Imports
import { BotModule, ModuleCommand, MessageMatcher, CommandVersion, CommandArgument, CommandSyntax, ArgumentType } from "../../../service/ModuleService.js"
import sharp from "sharp"
import fetch from "node-fetch"

/** @param {discord.TextChannel} channel */
async function get_last_image(channel) {
    function get_message_embed_image(message) {
        // Reverse embed list to get the last embed with the image instead of the first.
        return message.embeds.reverse().find(embed => embed.image?.url)?.image?.url;
    }

    // Sort all messages in channel by when they were created, probably slow.
    const messages_sorted = channel.messages.cache.filter(message => !message.deleted).sorted((messagea, messageb) => messageb.createdTimestamp - messagea.createdTimestamp).first(20);

    const last_message = messages_sorted.find(val => {
        if (get_message_embed_image(val)) {
            return true;
        }
        
        // Check attachments in image.
        if (val.attachments.last()?.attachment) {
            return true;
        }

        // Check image URLs in image.
        if (val.content.match(ArgumentType.ImageURL._validate)) {
            return true;
        }

        return false;
    });

    if (last_message) {
        // Return the image that was found, whether in an embed or as an attachment.
        return get_message_embed_image(last_message) ||
            last_message.attachments.first()?.attachment ||
            last_message.content.match(RegExp(ArgumentType.ImageURL._validate, "g"))?.reverse()?.[0];
    }

    return null;
}

async function apply_effects(image, callback) {
    const sh = sharp(await (await fetch(image)).buffer());
    const meta = await sh.metadata();

    callback(meta, sh);

    const buffer = await sh.toBuffer();

    return {
        meta,
        buffer
    }
}

export default new BotModule({
    name: "Images",
    description: "Image manipulation commands.",
    emoji: "🖼",
    commands: [
        new ModuleCommand({
            name: "Enlarge",
            description: "Enlarge the last image, an attached image or a linked image by a given scale factor.",
            emoji: "🖼",
            versions: [
                new CommandVersion(["enlarge", "scale"], [
                    new CommandArgument({
                        name: "url",
                        description: "The URL of the image to enlarge.",
                        emoji: "⛓",
                        types: [ArgumentType.ImageURL],
                        optional: true
                    }),
                    new CommandArgument({
                        name: "scale",
                        description: "The scale factor to enlarge the image by.",
                        emoji: "⏫",
                        types: [ArgumentType.Scalar],
                        optional: true,
                        default: 4
                    })
                ]),
                new CommandVersion(["enlarge", "scale"], [
                    new CommandArgument({
                        name: "url",
                        description: "The URL of the image to enlarge.",
                        emoji: "⛓",
                        types: [ArgumentType.ImageURL],
                        optional: true
                    }),
                    new CommandArgument({
                        name: "scalex",
                        description: "The scale factor to enlarge the image by horizontally.",
                        emoji: "⏩",
                        types: [ArgumentType.Scalar],
                        optional: true,
                        default: 4
                    }),
                    new CommandArgument({
                        name: "scaley",
                        description: "The scale factor to enlarge the image by vertically.",
                        emoji: "⏫",
                        types: [ArgumentType.Scalar],
                        optional: true,
                        default: 4
                    })
                ])
            ],
            example: "https://i.imgur.com/Sf6kXlB.gif",
            callback: async function EnlargeImage(message) {
                let image = this.args.url?.value || message.attachments.first()?.attachment || await get_last_image(message.channel);

                let scalex = this.args.scalex?.value || this.args.scale?.value || 4;
                let scaley = this.args.scaley?.value || this.args.scale?.value || 4;

                if (image) {
                    try {
                        const img = await apply_effects(image, (meta, img) => {
                            img.resize(Math.round(meta.width * scalex), Math.round(meta.height * scaley), {
                                fit: "fill"
                            });
                        });
                        
                        try {
                            if (Buffer.byteLength(img.buffer) < 8388608) { // 8 MB
                                await this.edit("success", "Uploading image..");

                                await message.channel.send("", {
                                    files: [{
                                        attachment: img.buffer,
                                        name: "image." + img.meta.format
                                    }]
                                });

                                await this.edit("success", "Successfully enlarged image.");
                            } else {
                                return await this.edit("error", "Resulting image was too large.");
                            }
                        } catch (e) {
                            return await this.edit("error", "Could not upload image.");
                        }
                    } catch (e) {
                        console.log(e);

                        return await this.edit("error", "Could not load image.");
                    }
                } else {
                    return await this.edit("error", "No image provided.");
                }
            }
        }),
        new ModuleCommand({
            name: "Flip",
            description: "Flip the last image, an attached image or a linked image by it's x or y axis.",
            emoji: "🖼",
            versions: [
                new CommandVersion(["flip", "flop"], [
                    new CommandArgument({
                        name: "url",
                        description: "The URL of the image to flip.",
                        emoji: "⛓",
                        types: [ArgumentType.ImageURL],
                        optional: true
                    }),
                    new CommandArgument({
                        name: "axis",
                        description: "The axis of which to flip the image.",
                        emoji: "⛓",
                        types: [
                            new ArgumentType({
                                name: "axis",
                                description: "A 2D axis of rotation or mirror.",
                                validate: /^(x|y)$/
                            })
                        ],
                        optional: true,
                        default: "x"
                    })
                ]),
            ],
            callback: async function FlipImage(message) {
                let image = this.args.url?.value || message.attachments.first()?.attachment || await get_last_image(message.channel);

                if (image) {
                    try {
                        const img = await apply_effects(image, (meta, img) => {
                            if (this.args.axis.value === "y") {
                                img.flop();
                            } else {
                                img.flip();
                            }
                        });
                        
                        try {
                            if (Buffer.byteLength(img.buffer) < 8388608) { // 8 MB
                                await this.edit("success", "Uploading image..");

                                await message.channel.send("", {
                                    files: [{
                                        attachment: img.buffer,
                                        name: "image." + img.meta.format
                                    }]
                                });

                                await this.edit("success", "Successfully flipped image.");
                            } else {
                                return await this.edit("error", "Resulting image was too large.");
                            }
                        } catch (e) {
                            return await this.edit("error", "Could not upload image.");
                        }
                    } catch (e) {
                        console.log(e);

                        return await this.edit("error", "Could not load image.");
                    }
                } else {
                    return await this.edit("error", "No image provided.");
                }
            }
        }),
        new ModuleCommand({
            name: "Negate",
            description: "Negate the colours of the last image, an attached image or a linked image.",
            emoji: "🖼",
            versions: [
                new CommandVersion(["negate"], [
                    new CommandArgument({
                        name: "url",
                        description: "The URL of the image to negate.",
                        emoji: "⛓",
                        types: [ArgumentType.ImageURL],
                        optional: true
                    })
                ]),
            ],
            callback: async function NegateImage(message) {
                let image = this.args.url?.value || message.attachments.first()?.attachment || await get_last_image(message.channel);

                if (image) {
                    try {
                        const img = await apply_effects(image, (meta, img) => {
                            img.negate();
                        });
                        
                        try {
                            if (Buffer.byteLength(img.buffer) < 8388608) { // 8 MB
                                await this.edit("success", "Uploading image..");

                                await message.channel.send("", {
                                    files: [{
                                        attachment: img.buffer,
                                        name: "image." + img.meta.format
                                    }]
                                });

                                await this.edit("success", "Successfully negated image.");
                            } else {
                                return await this.edit("error", "Resulting image was too large.");
                            }
                        } catch (e) {
                            return await this.edit("error", "Could not upload image.");
                        }
                    } catch (e) {
                        console.log(e);

                        return await this.edit("error", "Could not load image.");
                    }
                } else {
                    return await this.edit("error", "No image provided.");
                }
            }
        }),
        new ModuleCommand({
            name: "Rotate",
            description: "Rotate the last image, an attached image or a linked image by a given degrees.",
            emoji: "🖼",
            versions: [
                new CommandVersion(["rotate", "rot"], [
                    new CommandArgument({
                        name: "url",
                        description: "The URL of the image to negate.",
                        emoji: "⛓",
                        types: [ArgumentType.ImageURL],
                        optional: true
                    }),
                    new CommandArgument({
                        name: "degrees",
                        description: "The degrees to rotate the image by.",
                        emoji: "🔄",
                        types: [ArgumentType.UnsignedInteger],
                        optional: true,
                        default: 90
                    })
                ]),
            ],
            callback: async function RotateImage(message) {
                let image = this.args.url?.value || message.attachments.first()?.attachment || await get_last_image(message.channel);

                if (image) {
                    try {
                        const img = await apply_effects(image, (meta, img) => {
                            img.rotate(this.args.degrees.value, {
                                background: {
                                    r: 0,
                                    g: 0,
                                    b: 0,
                                    alpha: 0
                                }
                            });
                        });
                        
                        try {
                            if (Buffer.byteLength(img.buffer) < 8388608) { // 8 MB
                                await this.edit("success", "Uploading image..");

                                await message.channel.send("", {
                                    files: [{
                                        attachment: img.buffer,
                                        name: "image." + img.meta.format
                                    }]
                                });

                                await this.edit("success", "Successfully rotated image.");
                            } else {
                                return await this.edit("error", "Resulting image was too large.");
                            }
                        } catch (e) {
                            console.log(e);

                            return await this.edit("error", "Could not upload image.");
                        }
                    } catch (e) {
                        console.log(e);

                        return await this.edit("error", "Could not load image.");
                    }
                } else {
                    return await this.edit("error", "No image provided.");
                }
            }
        })
    ],
    matches: []
});