require("dotenv").config();

module.exports = {
  browser: {
    path: process.env.BROWSER_PATH,
  },
  dir:{
    download: process.env.DIR
  }
};
