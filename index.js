const { execSpotify } = require("./spotify");
const { execYoutube } = require("./youtube");

const exec = async () => {
    await execSpotify();
    await execYoutube();
};

exec();
