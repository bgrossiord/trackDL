const { google } = require("googleapis");
const moment = require("moment");
const { lookOnSlider } = require("./slider");
const { createDlRepository, printReport, readReport } = require("./utils");
require("dotenv").config();

const report = { warnings: [], found: [], notFound: [] };

const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
});

const PLAYLISTS_IDS = process.env.YOUTUBE_PLAYLISTS?.split(",");

const PAGINATION = 50;

const exec = async () => {
    if(PLAYLISTS_IDS){
        for (const playlistId of PLAYLISTS_IDS) {
            console.log(playlistId);
          
            const playlist = await youtube.playlists.list({
                id: playlistId,
                part: "id,snippet,contentDetails",
            });
            const playlistName = "Youtube-" + playlist.data.items[0].snippet.title;
           
            const dlPath = await createDlRepository(playlistName);
    
            const existingReport = await readReport(playlistName);
            const plItems = await retrieveAndDL(playlistId, playlistName, existingReport, dlPath);
            console.log("total length",plItems.length);
            await printReport(playlistName, report);
        }
    }
};


module.exports = { execYoutube: exec };
async function retrieveAndDL(playlistId, playlistName, existingReport, dlPath, nextPageToken) {
    const  request = {
        part: "id,snippet",
        playlistId: playlistId,
        maxResults: PAGINATION,
    };
    if(nextPageToken){
        request.pageToken=nextPageToken;
    }
    console.log("request", request);
    const plItems = await youtube.playlistItems.list(request);
    console.log("plItems", plItems.data.pageInfo);
    console.log(
        `Retrieved ${plItems.data.items.length} tracks reference from ${playlistName} `
    );
    for (const plItem of plItems.data.items) {
        const resVid = await youtube.videos.list({
            part: ["contentDetails"],
            id: [plItem.snippet.resourceId.videoId],
        });
        // console.log("resVid",resVid);
        if (resVid.data.items) {
            const d = moment.duration(resVid.data.items[0]?.contentDetails?.duration);
            // console.log("duration ", d);
            console.log("duration in ms", d.asMilliseconds());
            const search = plItem.snippet.title.replace(/ *\[[^\]]*]/, "");
            if (!existingReport || !existingReport.found.includes(search)) {
                await lookOnSlider(
                    { search: search, duration: d.asMilliseconds() },
                    dlPath,
                    report
                );
            } else {
                console.log(search + " was found previously");
                report.found.push(search);
            }
        }
    }
    console.log("plItems.data.items.length",plItems.data.items.length);
    console.log("plItems.nextPageToken",plItems.data.nextPageToken);

    if(plItems.data.nextPageToken ){
        const res = await retrieveAndDL(playlistId, playlistName, existingReport, dlPath, plItems.data.nextPageToken);

        if(res){
            return [...plItems.data.items, ...res];
        }
    }else{
        return plItems.data.items;
    }
}

