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

const PLAYLISTS_IDS = process.env.YOUTUBE_PLAYLISTS.split(",");

const exec = async () => {
    console.log(PLAYLISTS_IDS[0]);
    for (const playlistId of PLAYLISTS_IDS) {
        console.log(playlistId);
        const plItems = await youtube.playlistItems.list({
            part: "id,snippet",
            playlistId: playlistId,
            maxResults: 50,
        });
        const playlist = await youtube.playlists.list({
            id: playlistId,
            part: "id,snippet,contentDetails",
        });
        const playlistName = "Youtube-" + playlist.data.items[0].snippet.title;
        console.log(
            `Retrieved ${plItems.data.items.length.length} tracks reference from ${playlistName} `
        );
        const dlPath = await createDlRepository(playlistName);

        const existingReport = await readReport(playlistName);

        for (const plItem of plItems.data.items) {
            const resVid = await youtube.videos.list({
                part: ["contentDetails"],
                id: [plItem.snippet.resourceId.videoId],
            });
            // console.log("resVid",resVid);
            const d = moment.duration(resVid.data.items[0].contentDetails.duration);
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
        await printReport(playlistName, report);
    }

    // const videoIds = wlItems.data.items.map((item)=>(item.contentDetails.videoId)).join(",")
    // const videosRes = await youtube.videos.list( {part: 'snippet', id:videoIds})
    // console.log(videosRes.data.items)
};

exec();

module.exports = { execYoutube: exec };
