const puppeteer = require("puppeteer");

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
        headless: false,
        // executablePath: config.browser.path,
      });

      this.browser = browser;
      this.page = await this.browser.newPage();

      this.page.setRequestInterception(true);
      this.page.on("request", async (request) => {
        try {
          if (
            ["image", "stylesheet", "font"].includes(request.resourceType())
          ) {
            request.abort();
          } else {
            request.continue();
          }
        } catch (error) {
          console.log(`error ${EOL}`, error);
        }
      });

      this.page.setViewport({ width: 1920, height: 937 });
    } catch (error) {
      console.log(`error ${EOL}`, error);
      return null;
    }
  }

  async goPage(url) {
    await this.page.setDefaultNavigationTimeout(0);
    await this.page.goto(url);
  }

  async waitForSelector(selector) {
    await this.page.waitForSelector(selector);
  }

  async click(selector) {
    await this.page.click(selector);
  }

  async iterateContext(selector) {
    return await this.page.$$eval(selector, (nodes) => {
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
