<?php
session_start();
require_once 'koneksi.php';
require_once 'auth_check.php';
require_once 'vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

// 2. Capture GET parameters
$musim_tanam = $_GET['musim_tanam'] ?? 'MT I';
$id_kabupaten = $_GET['id_kabupaten'] ?? 'ALL';
$sertakan_ai = isset($_GET['sertakan_ai']) && $_GET['sertakan_ai'] === 'true';

// 3. Database Query
$sql = "SELECT dap.*, mk.nama_kabupaten 
        FROM data_alokasi_pupuk dap
        JOIN master_kabupaten mk ON dap.id_kabupaten = mk.id
        WHERE dap.musim_tanam = :musim_tanam";

$params = [':musim_tanam' => $musim_tanam];

// Admin Provinsi/Pusat can view ALL or specific
// Admin Kabupaten / PPL can only view their own
if ($_SESSION['role'] === 'Admin Kabupaten' || $_SESSION['role'] === 'PPL') {
    $id_kabupaten = $_SESSION['id_kabupaten']; // Force to their own
}

if ($id_kabupaten !== 'ALL') {
    $sql .= " AND dap.id_kabupaten = :id_kabupaten";
    $params[':id_kabupaten'] = $id_kabupaten;
}

$sql .= " ORDER BY mk.nama_kabupaten ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$data_report = $stmt->fetchAll();

// 5. Append Gemini AI Narrative logic (Prepared early)
$ai_narrative_html = '';
if ($sertakan_ai && count($data_report) > 0) {
    // Collect unique narratives or cuaca anomali to display
    $narratives = [];
    foreach ($data_report as $row) {
        // We will mock narasi_rekomendasi if it's not present, or use cuaca_anomali
        // For demonstration, we construct a narrative line per regency
        if (!empty($row['cuaca_anomali'])) {
            $narasi = "<b>" . htmlspecialchars($row['nama_kabupaten']) . "</b>: ";
            // Assuming there's a cuaca_anomali column we saved earlier
            $narasi .= "Kondisi tercatat " . htmlspecialchars($row['cuaca_anomali']) . ". ";
            
            // If we actually had a dedicated `narasi_rekomendasi` column we'd use it here:
            // $narasi .= htmlspecialchars($row['narasi_rekomendasi']);
            
            $narratives[] = $narasi;
        }
    }
    
    if (count($narratives) > 0) {
        $ai_narrative_html .= "<div style='margin-top: 30px; page-break-inside: avoid;'>";
        $ai_narrative_html .= "<h3 style='font-family: Helvetica, Arial, sans-serif; font-size: 14px;'>RINGKASAN EKSEKUTIF GEMINI AI</h3>";
        $ai_narrative_html .= "<div style='border: 1px solid #000; padding: 15px; background-color: #f9f9f9; font-family: Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6;'>";
        $ai_narrative_html .= implode("<br><br>", $narratives);
        $ai_narrative_html .= "</div>";
        $ai_narrative_html .= "</div>";
    }
}

$print_date = date('d-m-Y H:i:s');
$generated_by = htmlspecialchars($_SESSION['nama_lengkap'] ?? 'Administrator');
$season_label = htmlspecialchars($musim_tanam);

// 4. Construct the PDF HTML Template
$html = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Laporan Eksekutif AgriVision</title>
    <style>
        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 12px;
            color: #113224;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
            position: relative;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            text-transform: uppercase;
            font-weight: bold;
        }
        .header h2 {
            margin: 5px 0 0 0;
            font-size: 16px;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 12px;
        }
        .title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 20px;
            text-decoration: underline;
        }
        .metadata {
            margin-bottom: 15px;
            font-size: 12px;
        }
        .metadata table {
            width: 100%;
        }
        .metadata td {
            padding: 4px 0;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .data-table th, .data-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
        }
        .data-table th {
            background-color: #023E2D;
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 11px;
        }
        .data-table tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .status-aman { color: #059669; font-weight: bold; }
        .status-waspada { color: #D97706; font-weight: bold; }
        .status-kritis { color: #B91C1C; font-weight: bold; }
    </style>
</head>
<body>

    <div class='header'>
        <!-- Placeholder for Logo on the left -->
        <div style='position: absolute; left: 0; top: 0; width: 80px; height: 80px; border: 1px dashed #ccc; text-align: center; line-height: 80px; font-size: 10px; color: #999;'>[ LOGO ]</div>
        
        <h1>PEMERINTAH PROVINSI SULAWESI SELATAN</h1>
        <h2>DINAS PERTANIAN TANAMAN PANGAN, HORTIKULTURA DAN PERKEBUNAN</h2>
        <p>Jl. Jend. Sudirman No. 1, Makassar, Sulawesi Selatan. Kode Pos: 90112</p>
        <div style='clear: both;'></div>
    </div>

    <div class='title'>
        LAPORAN EKSEKUTIF ALOKASI & PREDIKSI KEBUTUHAN PUPUK
    </div>

    <div class='metadata'>
        <table border='0'>
            <tr>
                <td width='120'><b>Musim Tanam</b></td>
                <td width='10'>:</td>
                <td>{$season_label}</td>
                <td width='150' style='text-align: right;'><b>Tanggal Cetak</b></td>
                <td width='10'>:</td>
                <td width='150'>{$print_date}</td>
            </tr>
            <tr>
                <td><b>Dicetak Oleh</b></td>
                <td>:</td>
                <td>{$generated_by}</td>
                <td colspan='3'></td>
            </tr>
        </table>
    </div>

    <table class='data-table'>
        <thead>
            <tr>
                <th width='5%'>No</th>
                <th width='20%'>Kabupaten</th>
                <th width='15%'>Komoditas</th>
                <th width='15%'>Luas (Ha)</th>
                <th width='15%'>Kuota Urea (Ton)</th>
                <th width='15%'>Prediksi AI (Urea)</th>
                <th width='15%'>Status</th>
            </tr>
        </thead>
        <tbody>
";

if (count($data_report) > 0) {
    $no = 1;
    foreach ($data_report as $row) {
        $kabupaten = htmlspecialchars($row['nama_kabupaten']);
        $komoditas = htmlspecialchars($row['komoditas'] ?? '-');
        $luas = number_format($row['luas_lahan'] ?? 0, 0, ',', '.');
        $kuota = number_format($row['kuota_urea'] ?? 0, 0, ',', '.');
        $prediksi = number_format($row['prediksi_ai'] ?? 0, 0, ',', '.');
        
        $status_raw = strtolower($row['status_risiko'] ?? 'aman');
        $status_class = 'status-aman';
        if ($status_raw == 'kritis' || $status_raw == 'defisit') {
            $status_class = 'status-kritis';
        } elseif ($status_raw == 'waspada') {
            $status_class = 'status-waspada';
        }
        
        $status_text = htmlspecialchars($row['status_risiko'] ?? 'Aman');

        $html .= "
            <tr>
                <td>{$no}</td>
                <td style='text-align: left; font-weight: bold;'>{$kabupaten}</td>
                <td>{$komoditas}</td>
                <td style='text-align: right;'>{$luas}</td>
                <td style='text-align: right;'>{$kuota}</td>
                <td style='text-align: right;'><b>{$prediksi}</b></td>
                <td class='{$status_class}'>{$status_text}</td>
            </tr>
        ";
        $no++;
    }
} else {
    $html .= "
        <tr>
            <td colspan='7' style='padding: 20px;'>Tidak ada data ditemukan untuk parameter yang dipilih.</td>
        </tr>
    ";
}

$html .= "
        </tbody>
    </table>
";

// 5. Append Gemini AI Narrative
$html .= $ai_narrative_html;

$html .= "
</body>
</html>
";

// 6. PDF Generation Logic
$options = new Options();
$options->set('isRemoteEnabled', true);
$options->set('defaultFont', 'Helvetica');

$dompdf = new Dompdf($options);
$dompdf->loadHtml($html);

// Set paper size to A4, Landscape
$dompdf->setPaper('A4', 'landscape');

// Render the HTML as PDF
$dompdf->render();

// Output the generated PDF to Browser (force download)
$safe_musim = preg_replace('/[^A-Za-z0-9]/', '', $musim_tanam);
$filename = "Laporan_AgriVision_{$safe_musim}_" . date('Y') . ".pdf";

$dompdf->stream($filename, ["Attachment" => true]);
exit;
?>
