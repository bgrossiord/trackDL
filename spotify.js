const SpotifyWebApi = require("spotify-web-api-node");
const axios = require("axios").default;
const qs = require("qs");

require("dotenv").config();
const {lookOnSlider} = require("./slider");
const { createDlRepository, printReport, readReport } = require("./utils");

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const spotifyApi = new SpotifyWebApi();

let report = {warnings: [], found: [], notFound: []};

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
        const existingReport = await readReport(playlistName);


        for (const trackInfo of artistNameTracksDuration) {
            if(!existingReport || !existingReport.found.includes(trackInfo.search) ){
                await lookOnSlider(trackInfo, dlPath, report);
            }else{
                console.log(trackInfo.search  + "was found previously");
                report.found.push(trackInfo.search );
            }
        }

        // const timeElt = await trackElt.$('.controlPanel .track-time')
        // console.log(JSON.stringify(trackElt.jsonValue()))

        // if(timeElt){
        //   timeElt.click()
        //   console.log('time elt clicked');
        // }else{
        //   console.log('time elt not found');
        // }
        await printReport(playlistName, report);
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
