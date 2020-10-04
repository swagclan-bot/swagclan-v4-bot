import StreamingProvider from "./StreamingProvider.js"

import SpotifyClient from "spotify-web-api-node"
import googleapis from "googleapis"
import fetch from "node-fetch"
import ytdl from "ytdl-core"
import isoduration from "iso8601-duration"

import credentials from "../../../.credentials.js"

const SPOTIFY_REGEX = /^(?:(?:(?:(?:(?:https?)\:\/\/)?open\.spotify\.com\/track\/)|(?:spotify\:track\:))([a-zA-Z0-9]+)(?:\?.+)?)$/;

async function getAccessToken() {
    const IDBase64 = Buffer.from(credentials.spotifyID + ":" + credentials.spotifySecret).toString("base64");
    const created_timestamp = Date.now();

    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: "Basic " + IDBase64,
            "content-type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
    });

    if (res.status !== 200) {
        throw res;
    }

    const json = await res.json();

    json.created_timestamp = created_timestamp;
    json.expires_at = json.created_timestamp + (json.expires_in * 1000);

    return json;
}

const spotify = new SpotifyClient;

const youtube = new googleapis.youtube_v3.Youtube({
    auth: credentials.youtubev3
});

let auth = null;

/**
 * @type {StreamingProvider<googleapis.youtube_v3.Youtube>}
 */
export default new StreamingProvider({
    name: "Spotify",
    async authorise() {
        auth = await getAccessToken();

        spotify.setAccessToken(auth.access_token);
    },
    regex: SPOTIFY_REGEX,
    async resolve(trackid) {
        if (auth.expires_at < Date.now()) {
            auth = await getAccessToken();
            
            spotify.setAccessToken(auth.access_token);
        }

        trackid = SPOTIFY_REGEX.exec(trackid)[1];

        try {
            const res = await spotify.getTrack(trackid);

            const track = res.body;

            const artists = track.artists.map(artist => {
                return artist.name;
            }).join(", ");

            const searchres = await youtube.search.list({
                part: "snippet",
                type: "video",
                q: artists + " - " + track.name + " audio"
            });

            if (searchres.status !== 200) {
                throw "Could not get song on YouTube (" + searchres.status + ")."
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
                    name: track.name,
                    authors: track.artists.map(artist => artist.name),
                    album: track.album.name,
                    description: null,
                    release_date: track.album.release_date.split("/").join("-"),
                    id: track.id,
                    authorId: track.artists.map(artist => artist.id),
                    albumId: track.album.id,
                    url: track.external_urls.spotify,
                    authorURLs: track.artists.map(artist => artist.external_urls.spotify),
                    albumURL: track.album.external_urls.spotify,
                    streamURL: "https://youtube.com/watch?v=" + video.id,
                    albumCover: track.album.images[0].url,
                    duration: (duration.years * 217728000000) +
                        (duration.months * 18144000000) +
                        (duration.weeks * 604800000) +
                        (duration.days * 86400000) +
                        (duration.hours * 3600000) +
                        (duration.minutes * 60000) +
                        (duration.seconds * 1000)
                }
            }
        } catch (e) {
            throw "Could not get track from Spotify.";
        }
    },
    stream(song) {
        return ytdl(song.streamURL, { filter: "audioonly" });
    }
});