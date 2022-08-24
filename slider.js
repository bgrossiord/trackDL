const fs = require("fs");
const puppeteer = require("puppeteer");
const axios = require("axios").default;

async function lookOnSlider(
    {search , duration},
    playlistName,
    dlPath,
    { warnings, found, notFound }
) {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    console.log("going to ", "https://slider.kz/#" + search);
    // TODO search for all  tracks
    await page.goto("https://slider.kz/#" + search);

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

            if (biteRate >= 320) {
                const dlLink = parentHtml.slice(
                    parentHtml.indexOf("<a href=\"") + "<a href=\"".length,
                    parentHtml.indexOf("\" class=\"sm2_link\">")
                );
                page._client;
                await downloadFile( "https://slider.kz" + dlLink, dlPath + search + ".mp3",
                    search,
                    found
                );
                if (Math.abs(msDuration - duration) > 60000) {
                    warnings.push({
                        track: search,
                        warning: "Duration difference is greater than 1 minute",
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
                found.push(searchTerm);
            });
        });
    });
}

module.exports = { lookOnSlider };
