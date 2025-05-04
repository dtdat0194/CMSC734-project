const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'public/candles'); // Your CSV folder
const outputPath = path.join(__dirname, 'src/stocks.json');

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.error('Unable to scan directory:', err);
  }

  const stocks = files.map(file => {
    const [stock] = file.split('.csv');
    return stock;
  });

  fs.writeFileSync(outputPath, JSON.stringify(stocks, null, 2));
  console.log('Stock list generated successfully.');
});