const cliProgress = require('cli-progress');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const download = require('image-downloader');
const fs = require('fs');

const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

bar1.start(100, 0); //---- process bar
bar1.update(15); //---- process bar

const text1 = process.argv[2] ? process.argv[2] : undefined;
const text2 = process.argv[3] ? process.argv[3] : '_';
let compoundText = text1 && text2 ? `${text1}/${text2}` : text1;

bar1.update(20); //---- process bar

const dateNow = new Date();

fs.mkdir(`./src`, function (err) {
  if (err) {
    if (err.errno === -17) {
      console.log('./src already exist');
    } else {
      console.log(err);
    }
  } else {
    console.log('src folder successfully created.');
  }
});

bar1.update(30); //---- process bar

fs.mkdir(`./src/images_${dateNow}`, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('images folder successfully created.');
  }
});

bar1.update(50); //---- process bar

function getImages(html) {
  const $ = cheerio.load(html);
  const result = Array.from($('.meme-img'));
  result.length = 10;
  if (text1 === undefined) {
    result.forEach((item, index) => {
      downloadImage(item.attribs.src, index, true);
    });
  } else {
    if (text1 === 'clean') {
      compoundText = undefined;
      result.forEach((item, index) => {
        downloadImage(item.attribs.src.split('/')[1], index);
      });
    } else {
      result.forEach((item, index) => {
        downloadImage(item.attribs.src.split('/')[1], index);
      });
    }
  }
}

bar1.update(70); //---- process bar

fetch('https://memegen.link/examples')
  .then((res) => res.text())
  .then((body) => getImages(body));

function downloadImage(url, index, noArg = false) {
  const options = noArg
    ? {
        url: `https://api.memegen.link/images${url}`,
        dest: `./src/images_${dateNow}/${index}.jpg`, // will be saved to /path/to/dest/image.jpg
      }
    : {
        url: `https://api.memegen.link/images/${url}${
          compoundText ? '/' + compoundText + '/' + index : ''
        }.jpg?preview=true&watermark=none`,
        dest: `./src/images_${dateNow}/${index}.jpg`, // will be saved to /path/to/dest/image.jpg
      };

  download
    .image(options)
    .then(({ filename }) => {
      console.log('Saved to', filename); // saved to /path/to/dest/image.jpg
    })
    .catch((err) => console.error(err));
}

bar1.update(100); //---- process bar
bar1.stop(); //---- process bar
