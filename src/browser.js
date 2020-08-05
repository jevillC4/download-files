const R = require("ramda");
const Promises = require("bluebird");
const puppeteer = require("puppeteer-core");

const { EOL } = require("os");

const config = require("../config");

const startBrowser = async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: config.browser.path,
    });

    const page = await browser.newPage();

    const navigationPromise = page.waitForNavigation();

    await page.goto("https://www.gnome-look.org");

    await page.setViewport({ width: 1920, height: 937 });

    await page.waitForSelector(
      "#panel-0 > ul > li:nth-child(22) > a > .cat-title"
    );

    await page.click("#panel-0 > ul > li:nth-child(22) > a > .cat-title");

    await navigationPromise;

    const filterLinks = await filterName(page);

    await clickToRefs(page, filterLinks);

    await browser.close();
  } catch (error) {
    console.log(`error ${EOL}`, error);
  }
};

const filterName = async (page) => {
  await page.waitForSelector("#explore-products > div.product-list");
  let selector =
    "#explore-products > div.product-list > div > div.explore-product-details > h3 > a";

  const namespaces = await page.evaluate((selector) => {
    try {
      let matchers = ["HD", "4K", "5K", "10"];

      const compose = (...fn) => (x) => fn.reduceRight((y, f) => f(y), x);

      const getNodes = (s) => document.querySelectorAll(s);

      const assignValues = (a) => [...a];

      const getObj = (a) =>
        a.map((link) => ({
          href: link.href,
          name: String(link.textContent),
        }));

      const toTrim = (a) =>
        a.map((o) => ({ ...o, name: String(o.name).replace(/\s/g, "") }));

      const toUpperCase = (a) =>
        a.map((o) => ({ ...o, name: String(o.name).toUpperCase() }));

      const matchNames = (a) =>
        a.filter(
          (o) =>
            o.name.includes(matchers[0]) ||
            o.name.includes(matchers[1]) ||
            o.name.includes(matchers[2]) ||
            o.name.includes(matchers[3])
        );

      return compose(
        matchNames,
        toUpperCase,
        toTrim,
        getObj,
        assignValues,
        getNodes
      )(selector);
    } catch (error) {
      return error;
    }
  }, selector);

  return namespaces;
};

const clickToRefs = async (page, arr) => {
  try {
    await page.waitForSelector("#product-main");

    arr.forEach(async (v) => await page.goto(v));
    // await Promises.all( await )

    await navigationPromise;
  } catch (error) {
    console.log(`error ${EOL}`, error);
  }
};

module.exports = startBrowser;

// declarative
