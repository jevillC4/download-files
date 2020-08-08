const puppeteer = require("puppeteer-core");

const config = require("../../config");

class InitPage {
  constructor() {
    this.page = undefined;
    this.browser = undefined;
  }

  async launch() {
    try {
      const browser = await puppeteer.launch({
        headless: false,
        executablePath: config.browser.path,
      });

      this.browser = browser;
      this.page = await this.browser.newPage();
      this.page.setViewport({ width: 1920, height: 937 });
    } catch (error) {
      return null;
    }
  }

  goPage = async (url) => await this.page.goto(url);

  setSelector = async (selector) => await this.page.waitForSelector(selector);

  click = async (selector) => await this.page.click(selector);

  waitForNavigation = () => this.page.waitForFunction({}, { timeout: "40" });

  async iterateContext(selector1) {
    return this.page.$$eval(selector1, (nodes, obj) => {
      return nodes.map((n, i) => {
        let matchers = ["HD", "4K", "5K"],
          compose = (...fn) => (x) => fn.reduceRight((y, f) => f(y), x),
          getObj = (a) => ({
            href: a.href,
            name: String(a.textContent),
          }),
          toTrim = (o) =>
            Object.assign(o, {
              name: String(o.name).replace(/\s/g, ""),
            }),
          toUpperCase = (o) =>
            Object.assign(o, { name: String(o.name).toUpperCase() }),
          matchNames = (o) =>
            Object.assign(o, {
              href:
                o.name.includes(matchers[0]) ||
                o.name.includes(matchers[1]) ||
                o.name.includes(matchers[2])
                  ? o.href
                  : undefined,
              name:
                o.name.includes(matchers[0]) ||
                o.name.includes(matchers[1]) ||
                o.name.includes(matchers[2])
                  ? o.name
                  : undefined,
              selector:
                o.name.includes(matchers[0]) ||
                o.name.includes(matchers[1]) ||
                o.name.includes(matchers[2])
                  ? `.product-list > .explore-product:nth-child(${i}) > .explore-product-details > h3 > a`
                  : undefined,
            });

        const data = compose(matchNames, toUpperCase, toTrim, getObj)(n);
        return { ...data };
      });
    });
  }

  async close() {
    await this.browser.close();
  }
}

module.exports = InitPage;
