const { EOL } = require("os");

const SelectorFile = require("./selector_file");

class Iterator {
  constructor(page) {
    this.page = page;
    this._flag = false;
  }

  set flag(v) {
    this._flag = v;
  }

  get flag() {
    return this._flag;
  }

  async handler(url, arr, i = 0) {
    let value = arr[i],
      count = i + 1;
    if (!value) return;

    if (count === arr.length) {
      this.flag = true;
    }

    try {
      let instanceSelector = new SelectorFile(this.page);
      await this.page.waitFor(50);
      await this.page.goto(value.href);

      await this.page.waitFor(50);
      await instanceSelector.handler();

      await this.page.waitFor(50);

      await this.page.goto(url);

      await this.page.waitFor(50);
    } catch (error) {
      console.log(`error ${EOL}`, error);
    } finally {
      await this.handler(url, arr, i + 1);
    }
  }
}

module.exports = Iterator;
