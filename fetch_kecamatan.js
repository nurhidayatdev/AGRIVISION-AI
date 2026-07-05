import fs from 'fs';

const regencyIds = [
  "7301", "7302", "7303", "7304", "7305", "7306", "7307", "7308", "7309", "7310",
  "7311", "7312", "7313", "7314", "7315", "7316", "7317", "7318", "7322", "7325",
  "7326", "7371", "7372", "7373"
];

let result = {};

async function fetchAll() {
  for (const id of regencyIds) {
    try {
      console.log(`Mengunduh data kabupaten ${id}...`);
      const response = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${id}.json`);
      const data = await response.json();
      result[id] = data;
    } catch (e) {
      console.error(`Gagal mengunduh kabupaten ${id}:`, e.message);
    }
  }
  fs.writeFileSync('src/utils/kecamatan_sulsel.json', JSON.stringify(result, null, 2));
  console.log('BERHASIL! Data telah disimpan di src/utils/kecamatan_sulsel.json');
}

fetchAll();
