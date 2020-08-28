/**
 * Await a spefified amount of milliseconds asynchronously.
 * @param {Number} milliseconds The number of milliseconds to sleep for.
 * @returns {Promise<void>}
 */
export default function sleep(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}