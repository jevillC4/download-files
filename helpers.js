const _ = require("lodash");
const { EOL } = require("os");

module.exports = () => ({
  filterData: (arr) => arr.filter((v) => !_.isEmpty(v)),
  getGreaterThan: (arr) => {
    let filter = arr.map((o) => parseInt(o["data-file_size"])),
      max = Math.max(...filter);

    return arr.filter((o) => o["data-file_size"] === String(max));
  },
});
