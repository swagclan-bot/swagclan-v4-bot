/**
 * @typedef SongData
 * @property {String} name The name of the song.
 * @property {String} authors The author of the song.
 * @property {String} album The album of the song.
 * @property {String} description The description of the song.
 * @property {String} release_date The release date of the song.
 * @property {String} id The ID of the song.
 * @property {Array<String>} authorIds The ID of the authors.
 * @property {String} albumId The ID of the song's album.
 * @property {String} url The URL of the song.
 * @property {Array<String>} authorURLs The URLs of the song authors.
 * @property {String} albumURL The URL of the song album.
 * @property {String} streamURL The URL of where the song can be streamed.
 * @property {String} albumCover The URL of the album's cover image.
 * @property {Number} duration The duration of the song in milliseconds.
 */

/**
 * @typedef StreamingServiceOptions
 * @property {String} name The name of the streaming service.
 * @property {AuthoriseFunction} authorise Function to authorise the streaming service.
 * @property {ResolveFunction} resolve Function that resolves a song input to data that can safely be streamed.
 * @property {DisplayFunction} display Function to display a song in an embed.
 * @property {DisplayFunction} displaySnippet Function to display a song in an snippet embed.
 * @property {StreamFunction} stream Function that returns a readable stream to stream the music from.
 */

/**
 * @callback AuthoriseFunction
 */

/**
 * @callback ResolveFunction
 * @param {String} term The URL or search term to resolve.
 * @returns {Promise<null|SongData>}
 */

/**
 * @callback EmbedSnippet
 * @property {String} title The title of the embed.
 * @property {String} description The description of the embed.
 */

/**
 * @callback StreamFunction
 * @param {SongData} data The data required to stream. (Usually from resolve())
 * @returns {ReadableStream}
 */

/**
 * Represents a music streaming provider.
 */
export default class StreamingProvider {
    /**
     * Instantiate the streaming service.
     * @param {StreamingServiceOptions} options 
     */
    constructor(options = {}) {
        /**
         * The name of the streaming service.
         * @type {String}
         */
        this.name = options.name;
        
        /**
         * Function to authorise the streaming service.
         * @type {AuthoriseFunction}
         */
        this._authorise = options.authorise;

        /**
         * The regex that this provider matches songs by.
         * @type {RegExp}
         */
        this.regex = options.regex;

        /**
         * Function that resolves a song input to data that can safely be streamed.
         * @type {ResolveFunction}
         */
        this.resolve = options.resolve || (() => null);
        
        /**
         * Function that returns a readable stream to stream the music from.
         * @type {null|StreamFunction}
         */
        this.stream = options.stream || (() => null);
    }

    /**
     * Authorise the streaming service.
     */
    async authorise() {
        try {
            if (this._authorise) await this._authorise();
        } catch (e) {
            console.log(e);

            throw new Error("Could not authorise provider.");
        }
    }
}