const fs = require('fs');
const https = require('https');

const regencyIds = [
  "7301", "7302", "7303", "7304", "7305", "7306", "7307", "7308", "7309", "7310",
  "7311", "7312", "7313", "7314", "7315", "7316", "7317", "7318", "7322", "7325",
  "7326", "7371", "7372", "7373"
];

let result = {};
let completed = 0;

function fetchDistricts(id) {
  const url = `https://emsifa.github.io/api-wilayah-indonesia/api/districts/${id}.json`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        result[id] = JSON.parse(data);
      } catch(e) {
        console.error('Error parsing', id);
      }
      completed++;
      if (completed === regencyIds.length) {
        fs.writeFileSync('src/utils/kecamatan_sulsel.json', JSON.stringify(result, null, 2));
        console.log('Successfully saved to src/utils/kecamatan_sulsel.json');
      }
    });
  }).on('error', (err) => {
    console.error('Error fetching', id, err.message);
    completed++;
  });
}

regencyIds.forEach(fetchDistricts);
