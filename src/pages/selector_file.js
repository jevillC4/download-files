const fs = require("fs");
const path = require("path");
const axios = require("axios");
const request = require("request");
const cheerio = require("cheerio");
const Promises = require("bluebird");
const querystring = require("querystring");

const { EOL } = require("os");

const config = require("../../config");

const DIR_DOWNLOAD = config.dir.download;

const helpers = require("../../helpers");

class SelectorFile {
  constructor(page) {
    this.page = page;
    this.selectors = {
      first:
        "#product-tabs-container > #product-tabs > .nav > li:nth-child(2) > a",
      second:
        '#files-panel > div > article > div > table > tbody > tr[class="activerows"]',
    };
  }
  async handler() {
    await this.page.waitForSelector(this.selectors.first);
    await this.page.click(this.selectors.first);

    const data = await this.iterateTable();

    const sanitize = helpers().filterData(data);
    const greater = helpers().getGreaterThan(sanitize);

    await this.showFrame(greater);

    for (let index = 0; index < sanitize.length; index++) {
      sanitize.splice(index, 1);
      index = -1;
    }
  }

  async iterateTable() {
    return await this.page.$$eval(this.selectors.second, (nodes) =>
      Array.from(nodes, (node) => {
        const compose = (...fn) => (x) => fn.reduceRight((y, f) => f(y), x);

        const getSize = () => node.querySelector("td:nth-child(6)").textContent;

        const splitName = (n) => String(n).split(".")[0];

        const evaluateNode = (n) =>
          n >= 8
            ? {
                href: "https://www.gnome-look.org",
                "data-file_id": node
                  .querySelector('td > a[id^="data-link"]')
                  .getAttribute("data-file_id"),
                "data-file_name": node
                  .querySelector('td > a[id^="data-link"]')
                  .getAttribute("data-file_name"),
                "data-file_type": node
                  .querySelector('td > a[id^="data-link"]')
                  .getAttribute("data-file_type"),
                "data-file_size": node
                  .querySelector('td > a[id^="data-link"]')
                  .getAttribute("data-file_size"),
                "data-has_torrent": node
                  .querySelector('td > a[id^="data-link"]')
                  .getAttribute("data-has_torrent"),
                "data-project_id": node
                  .querySelector('td > a[id^="data-link"]')
                  .getAttribute("data-project_id"),
                "data-link_type": node
                  .querySelector('td > a[id^="data-link"]')
                  .getAttribute("data-link_type"),
                "data-is-external-link": node
                  .querySelector('td > a[id^="data-link"]')
                  .getAttribute("data-is-external-link"),
                "data-external_link": node
                  .querySelector('td > a[id^="data-link"]')
                  .getAttribute("data-external_link"),
              }
            : undefined;

        const than = compose(evaluateNode, splitName, getSize)();

        return { ...than };
      })
    );
  }

  async showFrame(arr, i = 0) {
    let value = arr[i];
    if (!value) return;

    try {
      let urlString = querystring.stringify({
        file_id: value["data-file_id"],
        file_type: value["data-file_type"],
        file_name: value["data-file_name"],
        file_size: value["data-file_size"],
        has_torrent: value["data-has_torrent"],
        project_id: value["data-project_id"],
        link_type: value["data-link_type"],
        is_external: value["data-is-external-link"],
        external_link: value["data-external_link"],
      });

      const { data } = await axios({
        method: "POST",
        url: `${value["href"]}/dl?${urlString}`,
      });

      let $ = cheerio.load(data);

      let linkDownload = $('div[class="empty-action"] > a').attr("href");

      await this.saveFile(linkDownload, value["data-file_name"]);
    } catch (error) {
      console.error(`showFrame Error: ${error}`);
    } finally {
      await this.showFrame(arr, i + 1);
    }
  }

  async saveFile(url, name) {
    return new Promises((resolve, reject) => {
      let dirFile = path.normalize(path.join(DIR_DOWNLOAD, name));

      fs.access(dirFile, fs.constants.F_OK, (err) => resolve());

      let file = fs.createWriteStream(`${dirFile}`);

      request({
        uri: url,
        headers: {
          Connection: "keep-alive",
          "Content-Length": 0,
          "Cache-Control": "max-age=0",
          "Upgrade-Insecure-Requests": 1,
          Origin: "https://www.gnome-look.org",
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
        },
      })
        .pipe(file)
        .on("finish", () => {
          // console.log(`downloaded file!`);
          resolve();
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }
}

module.exports = SelectorFile;
