<?php
$regencies = ["7301", "7302", "7303", "7304", "7305", "7306", "7307", "7308", "7309", "7310", "7311", "7312", "7313", "7314", "7315", "7316", "7317", "7318", "7322", "7325", "7326", "7371", "7372", "7373"];
$result = [];
foreach($regencies as $r) {
   $data = file_get_contents("https://emsifa.github.io/api-wilayah-indonesia/api/districts/{$r}.json");
   if ($data) {
      $result[$r] = json_decode($data, true);
   }
}
file_put_contents('src/utils/kecamatan_sulsel.json', json_encode($result));
echo "SUCCESS";
