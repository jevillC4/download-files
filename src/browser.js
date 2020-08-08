const util = require("util");
const Promises = require("bluebird");

const { EOL } = require("os");

const InitPage = require("./pages/init_page");
const { timeStamp } = require("console");

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

      await this.handlerItem(data);
    } catch (error) {
      console.log(`error handlerNode ${EOL}`, error);
    }
  }

  async handlerItem(arr, i = 1) {
    try {
      let obj = arr[i];

      if (!obj) return;

      const url = async () => {
        const d = await this.browser.page.url();
        console.log(`d ${EOL}`, d);
      };
      const captura = async () => {
        const data = this.browser.page.screenshot({ path: `${obj.name}.jpg` });
        if (data) {
          console.log(`se creo la captura de pantalla`);
          await this.browser.page.waitForFunction(
            (state) => document.readyState === state,
            "complete"
          );
          // await this.browser.page.goBack();
          await this.browser.goPage(
            "https://www.gnome-look.org/browse/cat/300/order/latest/"
          );
        }
      };
      await Promises.all([
        this.browser.page.waitForNavigation(),
        this.browser.setSelector(obj.selector),
        this.browser.goPage(obj.href),
        this.browser.page.waitForFunction(
          (state) => document.readyState === state,
          "complete"
        ),
        url(),
        captura(),
        // this.browser.page.waitForNavigation(),
        // this.browser.page.waitForNavigation(),
      ]);
    } catch (error) {
      console.log(`handlerItem ${EOL}`, error);
    } finally {
      await this.handlerItem(arr, i + 1);
    }
  }
}

module.exports = Browser;
