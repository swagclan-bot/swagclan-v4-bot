import express from "express"

/**
 * Stream events from an event emitter to a listening client.
 * @param {express.Request} req
 * @param {express.Response} res The response to stream to.
 * @param {any} object The event emitter to stream.
 * @param { { [key: string]: Function } } events The events to listen for and stream.
 */
export default function create_stream(req, res, object, events) {
    const entries = Object.entries(events);

    const hooked = entries.map(entry => {
        return [entry[0], function (...args) {
            res.write(JSON.stringify(entry[1](...args)));
        }];
    })

    for (let i = 0; i < hooked.length; i++) {
        const entry = hooked[i];

        object.on(entry[0], entry[1]);
    }

    req.on("close", () => {
        for (let i = 0; i < hooked.length; i++) {
            const entry = hooked[i];

            object.off(entry[0], entry[1]);
        }
    });
}