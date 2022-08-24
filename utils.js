const {mkdir} = require("node:fs/promises");
const path = require("path");

const DL_REPO= __dirname;

async function createDlRepository(playlistName) {
    const dlPath = DL_REPO + path.sep + playlistName + path.sep;

    try {
        await mkdir(dlPath);
    } catch (err) {
        if (err.code !== "EEXIST") {
            throw err;
        }
    }
    return dlPath;
}

module.exports = {createDlRepository};