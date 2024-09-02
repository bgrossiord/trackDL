const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const axios = require("axios").default;
const stringSimilarity = require("string-similarity");

require("dotenv").config();

puppeteer.use(StealthPlugin());

const SIMILARITY_THRESHOLD=  process.env.SIMILARITY_THRESHOLD ? process.env.SIMILARITY_THRESHOLD  : 0.7;


const REJECT_TIME_DIFF = process.env.REJECT_TIME_DIFF ? process.env.REJECT_TIME_DIFF  : 60;
const WARNING_TIME_DIFF = process.env.WARNING_TIME_DIFF ? process.env.WARNING_TIME_DIFF  : 10;
const BITRATE_LIMIT = process.env.BITRATE_LIMIT ? process.env.BITRATE_LIMIT : 320;

async function lookOnSlider(
    {search , duration},
    dlPath,
    { warnings, found, notFound }
) {
    const browser = await puppeteer.launch( {headless: true, args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--window-position=0,0",
        "--ignore-certifcate-errors",
        "--ignore-certifcate-errors-spki-list",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    ]});
    const page = await browser.newPage();
    // Set user agent to a common browser user agent
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");

    // Set viewport to a common screen size
    await page.setViewport({ width: 1920, height: 1080 });

    // Set various headers to mimic a real browser
    await page.setExtraHTTPHeaders({
        "accept-language": "en-US,en;q=0.9",
        "sec-fetch-site": "none",
        "sec-fetch-mode": "navigate",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
    });

    console.log("going to ", "https://hayqbhgr.slider.kz/#" + search);
    // TODO search for all  tracks
    await page.goto("https://hayqbhgr.slider.kz/#" + search);

    const query = "#fullwrapper > div:nth-child(1)";
    const popup = await page.$(query);
    if (popup) {
        await popup.click();
        console.log("popup clicked");
    } else {
        console.log("popup not found");
    }
    await page.waitForTimeout(6000);
    const trackElts = await page.$$("#liveaudio > div.track > div.controlPanel > div.trackTime");
    //const trackElts = await page.$$(".mainHeader .liveaudio .track .controlPanel .trackTime");
    if (trackElts) {
        let foundTrack = false;
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
            const titleSlider = parentHtml.slice(
                parentHtml.indexOf("class=\"sm2_link\">") + "class=\"sm2_link\">".length,
                parentHtml.indexOf("</a></div><div class=\"controlPanel\">")
            );
            if(titleSlider=="undefined"){
                break;
            }
            const similarity = stringSimilarity.compareTwoStrings(titleSlider.toLowerCase(), search.toLowerCase());
            if(similarity<SIMILARITY_THRESHOLD){
                console.log(titleSlider+" &&&& "+search);
                console.log("Title are too different rejecting this link :",similarity);
                break;
            }
            

            await trackElt.click();
            try {
                await page.waitForSelector("#informer > b:nth-child(1)");
            } catch (err) {
                break;
            }

            const informer = await page.$("#informer");
            let bitrateString = await (
                await informer.getProperty("innerHTML")
            ).jsonValue();
            bitrateString = bitrateString.replace("<b>Bitrate:</b> ", "");
            bitrateString = bitrateString.substring(
                0,
                bitrateString.indexOf(" kbps")
            );
            console.log("bitrateString:", bitrateString);
            const biteRate = parseInt(bitrateString);

            console.log("sliderDuration:", sliderDuration);
            const [minutes, seconds] = sliderDuration.split(":");

            const msDuration = parseInt(minutes) * 60000 + parseInt(seconds) * 1000;
            console.log("msDuration", msDuration);
            console.log("trackInfo.duration", duration);

            if (biteRate >= BITRATE_LIMIT) {
                const dlLink = parentHtml.slice(
                    parentHtml.indexOf("<a href=\"") + "<a href=\"".length,
                    parentHtml.indexOf("\" class=\"sm2_link\">")
                );
                page._client;
                if(dlLink.startsWith("https://")){
                    await downloadFile( dlLink, dlPath + search.replace(/[/\\?%*:|"<>]/g, "") + ".mp3",
                        search,
                        found
                    );
                }else{
                    await downloadFile( "https://hayqbhgr.slider.kz/" + dlLink, dlPath + search.replace(/[/\\?%*:|"<>]/g, "") + ".mp3",
                        search,
                        found
                    );
                }
                
                if (Math.abs(msDuration - duration) > REJECT_TIME_DIFF*1000) {
                    console.log("Rejected time diff is more than "+REJECT_TIME_DIFF+" seconds");
                    break;
                }
                //Reject from time diff ex
                if (Math.abs(msDuration - duration) > WARNING_TIME_DIFF*1000 && msDuration < duration) {
                    warnings.push({
                        track: search,
                        warning: "Duration difference is greater than "+WARNING_TIME_DIFF+" seconds",
                    });
                }
                foundTrack = true;
                found.push(search);
                break;
            } else {
                informer.click();
            }
        }
        if (!foundTrack) {
            notFound.push(search);
            console.log("Not found :(");
        }
    } else {
        notFound.push(search);
        console.log("Not found any result on slider :(");
    }
    await page.waitForTimeout(6000);
    await browser.close();
}

async function downloadFile(fileUrl, outputLocationPath, searchTerm, found) {
    console.log("Found! Downloading to", outputLocationPath);
    const writer = fs.createWriteStream(outputLocationPath);

    return axios({
        method: "get",
        url: fileUrl,
        responseType: "stream",
    }).then((response) => {


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

                found.push(searchTerm);
            });
        });
    }).catch((err)=>{
        console.error(err);
    });
}

module.exports = { lookOnSlider };
