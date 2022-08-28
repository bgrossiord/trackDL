const {mkdir} = require("node:fs/promises");
const path = require("path");
const { writeFile, readFile} = require("node:fs/promises");
require("dotenv").config();

const DL_REPO = process.env.DL_REPO ? process.env.DL_REPO  : __dirname;

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

async function printReport(playlistName,report) {
    console.log("Printing report");
    const  reportPath= DL_REPO+path.sep+playlistName+path.sep+`report${playlistName}.json`;
    console.log(reportPath);
    await writeFile(reportPath, JSON.stringify(report), "utf-8");
}

async function readReport(playlistName){
    try {
        let rawdata = await readFile(DL_REPO+path.sep+playlistName+path.sep+`report${playlistName}.json`);
        let report = JSON.parse(rawdata);
        return report;
    } catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
        return;
    }
    
}

module.exports = {createDlRepository, printReport, readReport};