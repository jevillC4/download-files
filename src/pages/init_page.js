const R = require("ramda");
const Promises = require("bluebird");
const puppeteer = require("puppeteer-core");

const { EOL } = require("os");

const config = require("../../config");

class InitPage {
  constructor() {
    this.page = undefined;
    this.browser = undefined;
  }

  async launch() {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: config.browser.path,
      });

      this.browser = browser;
      this.page = await this.browser.newPage();
      this.page.setViewport({ width: 1920, height: 937 });
    } catch (error) {
      return null;
    }
  }

  async goPage(url) {
    return await this.page.goto(url);
  }

  async setSelector(selector) {
    return await this.page.waitForSelector(selector);
  }

  async click(selector) {
    return await this.page.click(selector);
  }

  waitForNavigation() {
    return this.page.waitForNavigation();
  }

  async iterateContext(selector) {
    return this.page.$$eval(selector, (nodes) =>
      nodes.map((n) => console.log(n))
    );
  }

  async close() {
    await this.browser.close();
  }
}

module.exports = InitPage;
