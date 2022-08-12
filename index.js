const SpotifyWebApi = require("spotify-web-api-node");
const request = require("request");
const axios = require("axios").default;
const qs = require("qs");
const fs = require("fs");
const path = require("path");
const { mkdir, writeFile } = require("node:fs/promises");
const puppeteer = require("puppeteer");
require('dotenv').config()


console.log('process.env.SPOTIFY_CLIENT_ID', process.env.SPOTIFY_CLIENT_ID)
console.log('process.env.SPOTIFY_CLIENT_ID', process.env.SPOTIFY_CLIENT_SECRET)

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const spotifyApi = new SpotifyWebApi();

const warnings = [];
const found = [];
const notFound = [];

const DL_REPO= __dirname




const exec = async () => {
  try {
    await initSpotifyApi();
    //TODO loop on multiple playlist
    let plID = "5OYUnlIGByxk97cGXK6psO?si=c9861c487c404b39";
    const artistNameTracksDuration = await getSpotifyTracksFromPL(plID);
    const playlistRes = await spotifyApi.getPlaylist(plID);
    const playlistName = "Spotify-" + playlistRes.body.name;
    console.log(
      `Retrieved ${artistNameTracksDuration.length} tracks reference from ${playlistName} `
    );
    try{
      await mkdir(DL_REPO + path.sep + playlistName + path.sep);
    }catch(err){
      if(err.code!=='EEXIST'){
        throw err
      }
    }



    for (const trackInfo of artistNameTracksDuration) {
      await lookOnSlider(trackInfo, playlistName)
    }  

    // const timeElt = await trackElt.$('.controlPanel .track-time')
    // console.log(JSON.stringify(trackElt.jsonValue()))

    // if(timeElt){
    //   timeElt.click()
    //   console.log('time elt clicked');
    // }else{
    //   console.log('time elt not found');
    // }


  } catch (err) {
    console.error(err);
  }

  await printReport()

};

exec();

async function lookOnSlider(trackInfo, playlistName) {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  console.log(
    "going to ",
    "https://slider.kz/#" + trackInfo.search
  );
  // TODO search for all  tracks
  await page.goto("https://slider.kz/#" + trackInfo.search);

  const query = "#fullwrapper > div:nth-child(1)";
  const popup = await page.$(query);
  if (popup) {
    await popup.click();
    console.log("popup clicked");
  } else {
    console.log("popup not found");
  }
  await page.waitForTimeout(1000);

  const trackElts = await page.$$(".track .controlPanel .trackTime");

  if(trackElts){
    let foundTrack = false
    for (const trackElt of trackElts) {
      const sliderDuration = await (
        await trackElt.getProperty("innerHTML")
      ).jsonValue();
      const parentNode = await (
        await trackElt.getProperty("parentNode")
      ).getProperty("parentNode");
      const parentHtml = await (
        await parentNode.getProperty("innerHTML")
      ).jsonValue();
      await trackElt.click();
      try{
        await page.waitForSelector("#informer > b:nth-child(1)");
      }catch (err){
        break
      }
    
      const informer = await page.$("#informer");
      let bitrateString = await (
        await informer.getProperty("innerHTML")
      ).jsonValue();
      bitrateString = bitrateString.replace("<b>Bitrate:</b> ", "");
      bitrateString = bitrateString.substring(0, bitrateString.indexOf(" kbps"));
      console.log("bitrateString:", bitrateString);
      const biteRate = parseInt(bitrateString);
    
      console.log("sliderDuration:", sliderDuration);
      const [minutes, seconds] = sliderDuration.split(":");
    
      const msDuration = parseInt(minutes) * 60000 + parseInt(seconds) * 1000;
      console.log("msDuration", msDuration);
      console.log(
        "trackInfo.duration",
        trackInfo.duration
      );
    
      if (biteRate >= 320) {
        const dlLink = parentHtml.slice(
          parentHtml.indexOf('<a href="') + '<a href="'.length,
          parentHtml.indexOf('" class="sm2_link">')
        );
        page._client;
        await downloadFile(
          "https://slider.kz" + dlLink,
          DL_REPO +
          path.sep +
          playlistName +
          path.sep +
          trackInfo.search.replace(":","\:") +
          ".mp3",trackInfo.search
        );
        if (Math.abs(msDuration - trackInfo.duration) > 60000) {
          warnings.push({
            track: trackInfo.search,
            warning: "Duration difference is greater than 1 minute",
          });
        }
        foundTrack =true
        break
      } else {
        informer.click();
      }
    }
    if(!foundTrack){
      notFound.push(trackInfo.search)
    }
  }else{
    notFound.push(trackInfo.search)
  }
  await browser.close();
}

async function getSpotifyTracksFromPL(plID) {
  const tracks = await spotifyApi.getPlaylistTracks(plID);

  artistNameTracksDuration = tracks.body.tracks.items
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
        Authorization:
          "Basic " +
          Buffer.from(client_id + ":" + client_secret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  spotifyApi.setAccessToken(resToken.data.access_token);
}

async function downloadFile(fileUrl, outputLocationPath, searchTerm) {
  console.log("Found! Downloading to", outputLocationPath)
  const writer = fs.createWriteStream(outputLocationPath);

  return axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  }).then((response) => {
    //ensure that the user can call `then()` only when the file has
    //been downloaded entirely.

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error = null;
      writer.on("error", (err) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on("close", () => {
        if (!error) {
          resolve(true);
        }
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
        found.push(searchTerm)
      });
    });
  });
}

async function printReport(){
  console.log('Printing report')
  const report = { warnings , found, notFound }
  console.log(DL_REPO+path.sep+"report.json")
  await writeFile(DL_REPO+path.sep+"report.json", JSON.stringify(report), 'utf-8')

}

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
