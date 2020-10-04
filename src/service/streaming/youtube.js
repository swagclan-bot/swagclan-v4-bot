import StreamingProvider from "./StreamingProvider.js"

import googleapis from "googleapis"
import ytdl from "ytdl-core"
import isoduration from "iso8601-duration"

import credentials from "../../../.credentials.js"

const YOUTUBE_REGEX = /^(?:(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w-_]+))$/;

const youtube = new googleapis.youtube_v3.Youtube({
    auth: credentials.youtubev3
});

/**
 * @type {StreamingProvider<googleapis.youtube_v3.Youtube>}
 */
export default new StreamingProvider({
    name: "Youtube",
    regex: /.+/,
    async resolve(search_term) {
        const match = YOUTUBE_REGEX.exec(search_term);

        console.log(match);

        const options = match ? {
            part: "snippet",
            type: "video",
            id: { kind: "youtube#video", videoId: match[1] }
        } : {
            part: "snippet",
            type: "video",
            q: search_term
        }
        
        const searchres = await youtube.search.list(options);

        if (searchres.status !== 200) {
            throw "Could not get song YouTube (" + searchres.status + ").";
        }

        const items = searchres.data.items;

        if (items && items[0]) {
            const listres = await youtube.videos.list({
                part: ["snippet", "contentDetails"],
                id: [items[0].id.videoId]
            });

            if (listres.status !== 200) {
                throw "Could not get song on YouTube (" + listres.status + ").";
            }

            const video = listres.data.items[0];

            const duration = isoduration.parse(video.contentDetails.duration);

            return {
                name: video.snippet.title,
                authors: [video.snippet.channelTitle],
                album: null,
                description: video.snippet.description?.replace(/\r|\n/g, "").substr(0, 200).trim() || null,
                release_date: new Date(video.snippet.publishedAt).toLocaleDateString(),
                id: video.id,
                authorIds: [video.snippet.channelId],
                albumId: null,
                url: "https://youtube.com/watch?v=" + video.id,
                authorURLs: ["https://youtube.com/channel/" + video.snippet.channelId],
                albumURL: null,
                streamURL: "https://youtube.com/watch?v=" + video.id,
                albumCover: video.snippet.thumbnails.high.url,
                duration: (duration.years * 217728000000) +
                    (duration.months * 18144000000) +
                    (duration.weeks * 604800000) +
                    (duration.days * 86400000) +
                    (duration.hours * 3600000) +
                    (duration.minutes * 60000) +
                    (duration.seconds * 1000)
            }
        } else {
            throw "Could not find a video on YouTube by that name."
        }
    },
    stream(song) {
        return ytdl(song.streamURL, { filter: "audioonly" });
    }
});