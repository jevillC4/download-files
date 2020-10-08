require("dotenv").config();

console.log("process.env.LOAD_FAST", process.env.LOAD_FAST);
module.exports = {
  dir: {
    download: process.env.DIR,
  },
  fast: process.env.LOAD_FAST == 1 ? true : false,
  num_page: parseInt(process.env.NUM_PAGE),
  see_broser: process.env.SEE_BROWSER == 1 ? false : undefined,
  size_images_to_download: parseInt(process.env.SIZE_IMAGES),
};
