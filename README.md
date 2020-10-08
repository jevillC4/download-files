# Web scraping

Through the web scraping, I download files from the [Gnome](https://www.gnome-look.org/browse/cat/) page, in this case full hd images, which I use as wallpapers.

I developed this script, for practice and because I like to collect high resolution images ^\_^.

# NodeJs.

### configs

set the path where images are saved in the following file

**legend**
1 = YES | 0 = NO

./

.env

```
DIR=YOUR_PATH

NUM_PAGE=1 // default 1

SEE_BROWSER=0 // default 0

LOAD_FAST=1 // default 1
```

To set the image size in mb edit the following file
```
.src/pages/selector.js
```

line number 54

```
|53|
|54| n >= 10 // size image in MG default 10 Mb
|55|
```

### Run

Node version 14.x.x

```
node index.js
```
