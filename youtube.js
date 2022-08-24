const {google} = require("googleapis");
const moment = require("moment");
const { lookOnSlider } = require("./slider");
const { createDlRepository, printReport, readReport } = require("./utils");
require("dotenv").config();

const report = {warnings: [], found: [], notFound: []};

const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
});

const exec = async ()=>{
    const plItems = await youtube.playlistItems.list( {
        part: "id,snippet", playlistId: "PL1F7eVznPLVI5cWY2fldnN_DYAeMzqODe", maxResults: 50});
    const playlist = await youtube.playlists.list({id: "PL1F7eVznPLVI5cWY2fldnN_DYAeMzqODe",  part: "id,snippet,contentDetails"});
    const playlistName = "Youtube-" + playlist.data.items[0].snippet.title;
    console.log(
        `Retrieved ${plItems.data.items.length.length} tracks reference from ${playlistName} `,
    );
    const dlPath = await createDlRepository(playlistName);
        
    const existingReport = await readReport(playlistName);


    for (const plItem of plItems.data.items) {
        const resVid = await youtube.videos.list({
            "part": [
                "contentDetails"
            ],
            "id": [
                plItem.snippet.resourceId.videoId
            ]
        });
        // console.log("resVid",resVid);
        const d = moment.duration(resVid.data.items[0].contentDetails.duration);
        // console.log("duration ", d);
        console.log("duration in ms", d.asMilliseconds());
        const search = plItem.snippet.title.replace(/ *\[[^\]]*]/, "");
        if(!existingReport || !existingReport.found.includes(search) ){
            await lookOnSlider({search:search, duration: d.asMilliseconds() }, playlistName, dlPath, report);
        }else{
            report.found.push(search);
        }
    }
    await printReport(playlistName, report);


    // const videoIds = wlItems.data.items.map((item)=>(item.contentDetails.videoId)).join(",")
    // const videosRes = await youtube.videos.list( {part: 'snippet', id:videoIds})
    // console.log(videosRes.data.items)
};


exec();

module.exports = {execYoutube: exec};