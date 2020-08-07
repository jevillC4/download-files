const util = require("util");
const Promises = require("bluebird");

const { EOL } = require("os");

const InitPage = require("./pages/init_page");

const selectors = () => ({
  url: "https://www.gnome-look.org",
  firstSelector: "#panel-0 > ul > li:nth-child(22) > a > .cat-title",
  secondSelector: "#explore-products > div.product-list",
  thirdSelector: "#explore-products > div.product-list > div",
  navSelectors: {
    list:
      "#explore-products > div.product-list > div > div.explore-product-details > h3 > a",
  },
});
class Browser {
  constructor() {
    this.browser = new InitPage();
  }

  async startBrowser() {
    try {
      await this.browser.launch();
      const navigationPromise = this.browser.page.waitForNavigation();

      await this.browser.goPage(selectors().url);

      await this.browser.setSelector(selectors().firstSelector);

      await this.browser.click(selectors().firstSelector);

      await navigationPromise;

      await this.handlerNode();

      await this.browser.close();
    } catch (error) {
      console.log(`error ${EOL}`, error);
    }
  }

  async handlerNode() {
    try {
      await this.browser.setSelector(selectors().secondSelector);

      const data = await this.browser.iterateContext(
        selectors().navSelectors.list
      );
      console.log(`data ${EOL}`, data);

      await Promises.all(
        data.map(async (node, i) => {
          const navigationPromise = this.browser.page.waitForNavigation();

          await this.browser.setSelector(node.selector);

          await this.browser.goPage(node.href);

          await navigationPromise;

          await this.browser.page.screenshot({ path: `example${i}.png` });

          await this.browser.page.goBack(
            "https://www.gnome-look.org/browse/cat/300/order/latest/"
          );

          await navigationPromise;
        })
      );
    } catch (error) {
      console.log(`error handlerNode ${EOL}`, error);
    }
  }
}

// const puppeteer = require("puppeteer");
// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   const navigationPromise = page.waitForNavigation();

//   await page.goto("https://www.gnome-look.org/browse/cat/");

//   await page.setViewport({ width: 1920, height: 937 });

//   await page.waitForSelector(
//     ".product-list > .explore-product:nth-child(2) > .explore-product-details > h3 > a"
//   );
//   await page.click(
//     ".product-list > .explore-product:nth-child(2) > .explore-product-details > h3 > a"
//   );

//   await navigationPromise;

//   await navigationPromise;

//   await page.waitForSelector(
//     ".product-list > .explore-product:nth-child(1) > .explore-product-details > h3 > a"
//   );
//   await page.click(
//     ".product-list > .explore-product:nth-child(1) > .explore-product-details > h3 > a"
//   );

//   await navigationPromise;

//   await navigationPromise;

//   await browser.close();
// })();

// const puppeteer = require("puppeteer");
// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   const navigationPromise = page.waitForNavigation();

//   await page.goto("https://www.gnome-look.org/browse/cat/");

//   await page.setViewport({ width: 1920, height: 937 });

//   await page.waitForSelector(
//     ".product-list > .explore-product:nth-child(3) > .explore-product-details > h3 > a"
//   );
//   await page.click(
//     ".product-list > .explore-product:nth-child(3) > .explore-product-details > h3 > a"
//   );

//   await navigationPromise;

//   await navigationPromise;

//   await browser.close();
// })();

// const puppeteer = require("puppeteer");
// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   const navigationPromise = page.waitForNavigation();

//   await page.goto("https://www.gnome-look.org/browse/cat/");

//   await page.setViewport({ width: 1920, height: 937 });

//   await page.waitForSelector(
//     ".product-list > .explore-product:nth-child(2) > .explore-product-details > h3 > a"
//   );
//   await page.click(
//     ".product-list > .explore-product:nth-child(2) > .explore-product-details > h3 > a"
//   );

//   await navigationPromise;

//   await navigationPromise;

//   await browser.close();
// })();

module.exports = Browser;
