const _ = require("lodash");
const { EOL } = require("os");

const helpers = require("../helpers");
const Iterator = require("./pages/iterate");
const InitPage = require("./pages/init_page");

const selectors = () => ({
  url: "https://www.gnome-look.org",
  url2: "https://www.gnome-look.org/browse/cat/300/order/latest/",
  firstSelector: "#panel-0 > ul > li:nth-child(22) > a > .cat-title",
  secondSelector: "#explore-products > div.product-list",
  thirdSelector: "#explore-products > div.product-list > div",
  navSelectors: {
    list:
      "#explore-products > div.product-list > div > div.explore-product-details > h3 > a",
  },
  nav: (num) =>
    `https://www.gnome-look.org/browse/cat/300/page/${num}/ord/latest/`,
  pages: 1,
});

const PAGE_COUNTER = { counter: 1 };

class Browser {
  constructor() {
    this.browser = new InitPage();
  }

  async startBrowser() {
    try {
      await this.browser.launch();

      await this.browser.goPage(selectors().url);

      let ind = await this.startNav();
      if (ind) {
        await this.recNav(selectors().pages);
      }
    } catch (error) {
      console.error(`startBrowser error ${EOL}`, error);
    }
  }

  async recNav(counter = 0) {
    if (counter === 155) {
      await this.browser.close();
      return;
    }

    try {
      const { counter } = PAGE_COUNTER;
      let add = counter + 1;

      _.assign(PAGE_COUNTER, { counter: add });

      let newUrl = selectors().nav(add);

      await this.browser.goPage(newUrl);
      await this.innerHandler(newUrl, true);
    } catch (error) {
      console.error(`recNav error ${EOL}`, error);
    } finally {
      await this.recNav(counter + 1);
    }
  }

  async startNav(url = selectors().url) {
    try {
      await this.browser.waitForSelector(selectors().firstSelector);

      await this.browser.click(selectors().firstSelector);
      return await this.innerHandler(url);
    } catch (error) {
      console.error(`startNav error ${EOL}`, error);
    }
  }

  async innerHandler(url) {
    try {
      await this.browser.waitForSelector(selectors().secondSelector);

      const data = await this.browser.iterateContext(
        selectors().navSelectors.list
      );

      const sanitize = helpers().filterData(data);

      const iterator = new Iterator(this.browser.page);
      await iterator.handler(url, sanitize);
      const flag = iterator._flag;

      for (let index = 0; index < data.length; index++) {
        data.splice(index, 1);
        index = -1;
      }
      return flag;
    } catch (error) {
      console.error(`innerHandler error ${EOL}`, error);
    }
  }
}

module.exports = Browser;
