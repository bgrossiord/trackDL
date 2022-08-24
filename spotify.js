const SpotifyWebApi = require("spotify-web-api-node");
const axios = require("axios").default;
const qs = require("qs");
const path = require("path");
const { writeFile} = require("node:fs/promises");
require("dotenv").config();
const {lookOnSlider} = require("./slider");
const { createDlRepository } = require("./utils");

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const spotifyApi = new SpotifyWebApi();

const report = {warnings: [], found: [], notFound: []};

const DL_REPO= __dirname;


const exec = async () => {
    try {
        await initSpotifyApi();
        // TODO loop on multiple playlist
        const plID = "5OYUnlIGByxk97cGXK6psO?si=c9861c487c404b39";
        const artistNameTracksDuration = await getSpotifyTracksFromPL(plID);
        const playlistRes = await spotifyApi.getPlaylist(plID);
        const playlistName = "Spotify-" + playlistRes.body.name;
        console.log(
            `Retrieved ${artistNameTracksDuration.length} tracks reference from ${playlistName} `,
        );
        const dlPath = await createDlRepository(playlistName);


        for (const trackInfo of artistNameTracksDuration) {
            await lookOnSlider(trackInfo, playlistName, dlPath, report);
        }

        // const timeElt = await trackElt.$('.controlPanel .track-time')
        // console.log(JSON.stringify(trackElt.jsonValue()))

        // if(timeElt){
        //   timeElt.click()
        //   console.log('time elt clicked');
        // }else{
        //   console.log('time elt not found');
        // }
        await printReport(playlistName);
    } catch (err) {
        console.error(err);
    }

};




async function getSpotifyTracksFromPL(plID) {
    const tracks = await spotifyApi.getPlaylistTracks(plID);

    const artistNameTracksDuration = tracks.body.tracks.items
        .map((tr) => tr.track)
        .map((track) => ({
            search: track.name + " " + track.artists.map((art) => art.name).join(" "),
            duration: track.duration_ms,
        }));
    console.log(artistNameTracksDuration);

    return artistNameTracksDuration;
}

async function initSpotifyApi() {
    const resToken = await axios.post(
        "https://accounts.spotify.com/api/token",
        qs.stringify({
            grant_type: "client_credentials",
        }),
        {
            headers: {
                "Authorization":
          "Basic " +
          Buffer.from(client_id + ":" + client_secret).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded",
            },
        },
    );
    spotifyApi.setAccessToken(resToken.data.access_token);
}


async function printReport(playlistName) {
    console.log("Printing report");
    console.log(DL_REPO+path.sep+"report.json");
    await writeFile(DL_REPO+path.sep+`report${playlistName}.json`, JSON.stringify(report), "utf-8");
}

module.exports = {execSpotify: exec};

// request.post(authOptions, function(error, response, body) {
// if (!error && response.statusCode === 200) {
//     const token = body.access_token;
//     console.log('TOKEN :::', token)

//     spotifyApi.setAccessToken(token);

//     spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
//         function(data) {
//           console.log('Artist albums', data.body);
//         },
//         function(err) {
//           console.error(err);
//         }
//       );
// }
// });
