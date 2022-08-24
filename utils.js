const {mkdir} = require("node:fs/promises");
const path = require("path");
const { writeFile} = require("node:fs/promises");

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

async function printReport(playlistName) {
    console.log("Printing report");
    console.log(DL_REPO+path.sep+"report.json");
    await writeFile(DL_REPO+path.sep+`report${playlistName}.json`, JSON.stringify(report), "utf-8");
}

module.exports = {createDlRepository, printReport};