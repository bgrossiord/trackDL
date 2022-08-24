const {google} = require("googleapis");
const { createDlRepository } = require("./utils");
require("dotenv").config();


const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
});

const exec = async ()=>{
    const youtubeVids = await youtube.playlistItems.list( {
        part: "id,snippet", playlistId: "PL1F7eVznPLVI5cWY2fldnN_DYAeMzqODe", maxResults: 50});
    const playlist = await youtube.playlists.list({id: "PL1F7eVznPLVI5cWY2fldnN_DYAeMzqODe",  part: "id,snippet"});
    const playlistName = "Youtube-" + playlist.data.items[0].snippet.title;
    console.log(
        `Retrieved ${youtubeVids.data.items.length.length} tracks reference from ${playlistName} `,
    );

    const dlPath = await createDlRepository(playlistName);

    console.log("youtubeVids.data.items",youtubeVids.data.items[0]);

    for (const vid of youtubeVids.data.items) {
        vid.snippet.title;
    }


    // const videoIds = wlItems.data.items.map((item)=>(item.contentDetails.videoId)).join(",")
    // const videosRes = await youtube.videos.list( {part: 'snippet', id:videoIds})
    // console.log(videosRes.data.items)
};


exec();

module.exports = {execYoutube: exec};