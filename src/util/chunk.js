/**
 * Chunk up an array of considerable length into smaller arrays of less significant length.
 * @param {Array<any>} array The array to chunk.
 * @param {Number} size The size of each chunk.
 * @returns {Array<Array<any>>}
 */
export default function ChunkArr(array, size) {
    return array.reduce((all, one, i) => {
        const ch = Math.floor(i / size);

        all[ch] = [].concat((all[ch] || []), one);

        return all
     }, []);
}