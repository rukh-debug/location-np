const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const util = require("util");

let countItem = async (page, whatToCount) => {
  return new Promise(async (resolve, reject) => {
    try {
      let x = {};
      let outerElement = await page.evaluate((whatToCount) => {
        // let whatToCount = this.whatToCount;
        return document.querySelector(whatToCount).outerHTML;
      }, whatToCount);
      const $ = cheerio.load(outerElement);
      $("option").each(async (i, el) => {
        if ($(el).attr("value") !== "") {
          x = {
            ...x,
            [$(el).attr("value")]: $(el).text(),
          };
        }
      });

      resolve(x);
    } catch (error) {
      console.log(error.message);
      reject(error);
    }
  });
};

(async function () {
  let data = {};
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome-stable",
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto("https://voterlist.election.gov.np/bbvrs1/index_2.php", {
    waitUntil: "domcontentloaded",
  });
  await page.setViewport({ width: 946, height: 957 });
  // #state
  // #district
  // #vdc_mun
  // #ward
  await page.waitForSelector("#state");

  let states = await countItem(page, "#state");

  for (i = 0; i < Object.keys(states).length; i++) {
    let currentState = states[Object.keys(states)[i]];
    // console.log(currentState)
    data[currentState] = {};

    await page.select("#state", Object.keys(states)[i]);
    await new Promise((r) => setTimeout(() => r(), 300));
    let districts = await countItem(page, "#district");
    for (j = 0; j < Object.keys(districts).length; j++) {
      let currentDistrict = districts[Object.keys(districts)[j]];
      // console.log(currentDistrict)
      data[currentState][currentDistrict] = {};

      await page.select("#district", Object.keys(districts)[j]);
      await new Promise((r) => setTimeout(() => r(), 300));

      let vdcmun = await countItem(page, "#vdc_mun");
      for (k = 0; k < Object.keys(vdcmun).length; k++) {
        let currentVdcmun = vdcmun[Object.keys(vdcmun)[k]];
        // console.log(currentVdcmun)
        data[currentState][currentDistrict][currentVdcmun] = [];

        await page.select("#vdc_mun", Object.keys(vdcmun)[k]);
        await new Promise((r) => setTimeout(() => r(), 300));

        let ward = await countItem(page, "#ward");
        let currentWard = Object.values(ward);
        console.log(currentWard);
        data[currentState][currentDistrict][currentVdcmun] = currentWard;
      }
    }
  }

  // write to the file
  const fs = require("fs");

  const write = JSON.stringify(data);

  fs.writeFileSync("all_nepal_location.json", write, "utf-8", (err) => {
    if (err) {
      console.log(err);
    }
    console.log("JSON written, File saved.");
  });

  // console.log(data)
  // $("option").each(async (i, el) => {
  //   if (i !== 0) {
  //     await page.select("#state", i.toString());
  //     console.log("hi")
  //     const outerElement2 = await page.evaluate(
  //       () => document.querySelector("#district").outerHTML
  //     );
  //     console.log("hello")
  //     const $2 = cheerio.load(outerElement2);
  //     console.log("me")
  //     let numofdistrict = $("option").length - 1;
  //     console.log('cd')
  //     $2("option").each(async (i, el) => {
  //       console.log(i)
  //       if (i !== 0) {
  //         await page.select("#district", "68");
  //       }
  //     });
  //     console.log("hhh")
  //     data = {
  //       ...data,
  //       [$(el).text()]: {},
  //     };
  //     // console.log(data)
  //   }
  // });
  // console.log(data)
  // for (i = 0; i < numofstate; i++) {
  //   data = {
  //     ...data,
  //     [$("option").text]: {}
  //   }
  //   console.log(data)
  // }
})();
