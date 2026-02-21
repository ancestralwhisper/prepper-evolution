const fs = require('fs');
const https = require('https');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve, reject);
      }
      
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Better URLs for the products
// EcoFlow
const ecoflow = 'https://cdn.shopify.com/s/files/1/1996/9367/products/Delta_2_Max_White_1024x1024.jpg';
// ESEE 4
const esee = 'https://img.blade-hq.com/cat--ESEE-RC-4--882.jpg'; // Wait, let's just use Wikimedia or simpler URL

download('https://m.media-amazon.com/images/I/41DXY0Tf7KL.jpg', 'client/public/images/product-esee4.png')
  .then(() => console.log('ESEE done'))
  .catch(console.error);

download('https://m.media-amazon.com/images/I/71R2c3QY05L.jpg', 'client/public/images/product-ecoflow.png')
  .then(() => console.log('EcoFlow done'))
  .catch(console.error);