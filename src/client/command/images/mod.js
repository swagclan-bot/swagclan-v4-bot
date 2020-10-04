// Imports
import { BotModule, ModuleCommand, MessageMatcher, CommandVersion, CommandArgument, CommandSyntax, ArgumentType } from "../../../service/ModuleService.js"
import Jimp from "jimp"
import sharp from "sharp"
import fetch from "node-fetch"
import configure from "@jimp/custom"
import fisheyePlugin from "@jimp/plugin-fisheye"

configure({
    plugins: [fisheyePlugin]
}, Jimp)

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

async function get_image(image) {
    const original = await (await fetch(image)).buffer();

    const sh = sharp(original);
    const meta = await sh.metadata();

    if (meta.format === "webp" || meta.format === "svg") {
        return await sh.toFormat("png").toBuffer();
    }

    return await sh.toBuffer();
}

async function apply_effects(image, callback) {
    const img = await Jimp.read(await get_image(image));

    const meta = {
        width: img.getWidth(),
        height: img.getHeight(),
        ext: img.getExtension(),
        mime: img.getMIME()
    }

    await callback(meta, img);

    const buffer = await img.getBufferAsync(Jimp.AUTO);

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
                        await this.reply("info", "Enlarging image..");

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
                                        name: "image." + img.meta.ext
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
                        await this.reply("info", "Flipping image..");

                        const img = await apply_effects(image, (meta, img) => {
                            if (this.args.axis.value === "y") {
                                img.flip(true, false);
                            } else {
                                img.flip(false, true);
                            }
                        });
                        
                        try {
                            if (Buffer.byteLength(img.buffer) < 8388608) { // 8 MB
                                await this.edit("success", "Uploading image..");

                                await message.channel.send("", {
                                    files: [{
                                        attachment: img.buffer,
                                        name: "image." + img.meta.ext
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
            name: "Invert",
            description: "Invert the colours of the last image, an attached image or a linked image.",
            emoji: "🖼",
            versions: [
                new CommandVersion(["invert", "negate"], [
                    new CommandArgument({
                        name: "url",
                        description: "The URL of the image to invert.",
                        emoji: "⛓",
                        types: [ArgumentType.ImageURL],
                        optional: true
                    })
                ]),
            ],
            callback: async function InvertImage(message) {
                let image = this.args.url?.value || message.attachments.first()?.attachment || await get_last_image(message.channel);

                if (image) {
                    try {
                        await this.reply("info", "Inverting image..");

                        const img = await apply_effects(image, (meta, img) => {
                            img.invert();
                        });
                        
                        try {
                            if (Buffer.byteLength(img.buffer) < 8388608) { // 8 MB
                                await this.edit("success", "Uploading image..");

                                await message.channel.send("", {
                                    files: [{
                                        attachment: img.buffer,
                                        name: "image." + img.meta.ext
                                    }]
                                });

                                await this.edit("success", "Successfully inverted image.");
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
                        description: "The URL of the image to rotate.",
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
                        await this.reply("info", "Rotating image..");

                        const img = await apply_effects(image, (meta, img) => {
                            img.rotate(this.args.degrees.value);
                        });
                        
                        try {
                            if (Buffer.byteLength(img.buffer) < 8388608) { // 8 MB
                                await this.edit("success", "Uploading image..");

                                await message.channel.send("", {
                                    files: [{
                                        attachment: img.buffer,
                                        name: "image." + img.meta.ext
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
        }),
        new ModuleCommand({
            name: "Greyscale",
            description: "Convert the last image, an attached image or a linked image to greyscale.",
            emoji: "🖼",
            versions: [
                new CommandVersion(["greyscale", "grey"], [
                    new CommandArgument({
                        name: "url",
                        description: "The URL of the image to greyscale.",
                        emoji: "⛓",
                        types: [ArgumentType.ImageURL],
                        optional: true
                    })
                ]),
            ],
            callback: async function GreyscaleImage(message) {
                let image = this.args.url?.value || message.attachments.first()?.attachment || await get_last_image(message.channel);

                if (image) {
                    try {
                        await this.reply("info", "Greyscaling image..");

                        const img = await apply_effects(image, (meta, img) => {
                            img.greyscale();
                        });
                        
                        try {
                            if (Buffer.byteLength(img.buffer) < 8388608) { // 8 MB
                                await this.edit("success", "Uploading image..");

                                await message.channel.send("", {
                                    files: [{
                                        attachment: img.buffer,
                                        name: "image." + img.meta.ext
                                    }]
                                });

                                await this.edit("success", "Successfully greyscaled image.");
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
        }),
        new ModuleCommand({
            name: "Crop",
            description: "Crop the last image, an attached image or a linked image to a given boundary.",
            emoji: "🖼",
            versions: [
                new CommandVersion(["crop"], [
                    new CommandArgument({
                        name: "url",
                        description: "The URL of the image to crop.",
                        emoji: "⛓",
                        types: [ArgumentType.ImageURL],
                        optional: true
                    }),
                    new CommandArgument({
                        name: "x",
                        description: "The x of the boundary starting position.",
                        emoji: "▶",
                        types: [ArgumentType.UnsignedInteger],
                        optional: true
                    }),
                    new CommandArgument({
                        name: "🔽",
                        description: "The y of the boundary starting position.",
                        emoji: "⛓",
                        types: [ArgumentType.UnsignedInteger],
                        optional: true
                    }),
                    new CommandArgument({
                        name: "📏",
                        description: "The width of the boundary starting position.",
                        emoji: "⛓",
                        types: [ArgumentType.UnsignedInteger],
                        optional: true
                    }),
                    new CommandArgument({
                        name: "📏",
                        description: "The height of the boundary starting position.",
                        emoji: "⛓",
                        types: [ArgumentType.UnsignedInteger],
                        optional: true
                    })
                ]),
            ],
            callback: async function CropImage(message) {
                let image = this.args.url?.value || message.attachments.first()?.attachment || await get_last_image(message.channel);

                if (image) {
                    try {
                        await this.reply("info", "Cropping image..");

                        const img = await apply_effects(image, (meta, img) => {
                            img.crop(this.args.x.value, this.args.y.value, this.args.width.value, this.args.height.value);
                        });
                        
                        try {
                            if (Buffer.byteLength(img.buffer) < 8388608) { // 8 MB
                                await this.edit("success", "Uploading image..");

                                await message.channel.send("", {
                                    files: [{
                                        attachment: img.buffer,
                                        name: "image." + img.meta.ext
                                    }]
                                });

                                await this.edit("success", "Successfully cropped image.");
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
        }),
        new ModuleCommand({
            name: "Fisheye",
            description: "Create a fisheye effect on the last image, an attached image or a linked image.",
            emoji: "🖼",
            versions: [
                new CommandVersion(["fisheye"], [
                    new CommandArgument({
                        name: "url",
                        description: "The URL of the image to fisheye.",
                        emoji: "⛓",
                        types: [ArgumentType.ImageURL],
                        optional: true
                    }),
                    new CommandArgument({
                        name: "radius",
                        description: "The fisheye radius.",
                        emoji: "📏",
                        types: [ArgumentType.Float],
                        optional: true,
                        default: 1.6
                    })
                ]),
            ],
            callback: async function FisheyeImage(message) {
                let image = this.args.url?.value || message.attachments.first()?.attachment || await get_last_image(message.channel);

                if (image) {
                    try {
                        await this.reply("info", "Applying fisheye to image..");

                        const img = await apply_effects(image, (meta, img) => {
                            img.fisheye({ r: this.args.radius.value })
                        });
                        
                        try {
                            if (Buffer.byteLength(img.buffer) < 8388608) { // 8 MB
                                await this.edit("success", "Uploading image..");

                                await message.channel.send("", {
                                    files: [{
                                        attachment: img.buffer,
                                        name: "image." + img.meta.ext
                                    }]
                                });

                                await this.edit("success", "Successfully created fisheye effect on image.");
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
