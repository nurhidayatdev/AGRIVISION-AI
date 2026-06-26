<?php
session_start();
require_once 'koneksi.php';
require_once 'auth_check.php';

// Include PhpSpreadsheet (assuming installed via Composer)
require_once 'vendor/autoload.php';

// 2. RBAC Verification: Only 'Admin Provinsi' and 'Admin Kabupaten' can import
require_role(['Admin Provinsi', 'Admin Pusat', 'Kadis Provinsi', 'Admin Kabupaten'], 'kelola_data.php');

use PhpOffice\PhpSpreadsheet\IOFactory;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 3. File Handling
    if (isset($_FILES['dokumen_excel']) && $_FILES['dokumen_excel']['error'] === UPLOAD_ERR_OK) {
        $file_tmp_path = $_FILES['dokumen_excel']['tmp_name'];
        $file_name = $_FILES['dokumen_excel']['name'];
        $file_extension = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

        // Validate file extension
        $allowed_extensions = ['xlsx', 'csv'];
        if (!in_array($file_extension, $allowed_extensions)) {
            header("Location: kelola_data.php?status=error_extension");
            exit;
        }

        // Move to a temporary uploads directory securely
        $upload_dir = 'uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        
        // Create unique file name to prevent overriding and execution
        $new_file_name = uniqid('import_', true) . '.' . $file_extension;
        $destination = $upload_dir . $new_file_name;

        if (move_uploaded_file($file_tmp_path, $destination)) {
            try {
                // 4. Excel Parsing Logic
                // Load the spreadsheet file
                $spreadsheet = IOFactory::load($destination);
                $worksheet = $spreadsheet->getActiveSheet();
                $highestRow = $worksheet->getHighestRow();

                // Prepare statement to find id_kabupaten based on Kode BPS
                $stmt_find_kab = $pdo->prepare("SELECT id FROM master_kabupaten WHERE kode_bps = :kode_bps LIMIT 1");
                
                // Prepare statement to insert into data_alokasi_pupuk
                // Setting default values for fields not in excel like prediksi_ai or status_risiko
                $stmt_insert = $pdo->prepare("
                    INSERT INTO data_alokasi_pupuk (
                        id_kabupaten, musim_tanam, komoditas, luas_lahan, kuota_urea, kuota_npk, status_risiko, prediksi_ai
                    ) VALUES (
                        :id_kabupaten, :musim_tanam, :komoditas, :luas_lahan, :kuota_urea, :kuota_npk, 'Aman', 0
                    )
                ");

                $pdo->beginTransaction();

                // Loop through the rows starting from row 2 (assuming row 1 is the header)
                for ($row = 2; $row <= $highestRow; $row++) {
                    // Extract column values
                    $kode_bps   = $worksheet->getCell('A' . $row)->getValue();
                    $musim_tanam = $worksheet->getCell('B' . $row)->getValue();
                    $komoditas  = $worksheet->getCell('C' . $row)->getValue();
                    $luas_lahan = $worksheet->getCell('D' . $row)->getValue();
                    $kuota_urea = $worksheet->getCell('E' . $row)->getValue();
                    $kuota_npk  = $worksheet->getCell('F' . $row)->getValue();

                    // Skip empty rows
                    if (empty($kode_bps)) {
                        continue;
                    }

                    // Clean data
                    $kode_bps   = trim($kode_bps);
                    $musim_tanam = trim($musim_tanam);
                    $komoditas  = trim($komoditas);
                    $luas_lahan = is_numeric($luas_lahan) ? floatval($luas_lahan) : 0;
                    $kuota_urea = is_numeric($kuota_urea) ? floatval($kuota_urea) : 0;
                    $kuota_npk  = is_numeric($kuota_npk) ? floatval($kuota_npk) : 0;

                    // 5. Fetch id_kabupaten from master_kabupaten
                    $stmt_find_kab->bindParam(':kode_bps', $kode_bps, PDO::PARAM_STR);
                    $stmt_find_kab->execute();
                    $kabupaten = $stmt_find_kab->fetch();

                    if ($kabupaten) {
                        $id_kabupaten = $kabupaten['id'];

                        // If user is Admin Kabupaten, verify they are importing data for their own regency
                        if ($_SESSION['role'] === 'Admin Kabupaten' && $id_kabupaten != $_SESSION['id_kabupaten']) {
                            // Skip data that doesn't belong to their region
                            continue;
                        }

                        // Execute the insertion
                        $stmt_insert->bindParam(':id_kabupaten', $id_kabupaten, PDO::PARAM_INT);
                        $stmt_insert->bindParam(':musim_tanam', $musim_tanam, PDO::PARAM_STR);
                        $stmt_insert->bindParam(':komoditas', $komoditas, PDO::PARAM_STR);
                        $stmt_insert->bindParam(':luas_lahan', $luas_lahan);
                        $stmt_insert->bindParam(':kuota_urea', $kuota_urea);
                        $stmt_insert->bindParam(':kuota_npk', $kuota_npk);
                        
                        $stmt_insert->execute();
                    }
                }

                $pdo->commit();

                // 6. Clean Up: Delete the temporary uploaded file
                if (file_exists($destination)) {
                    unlink($destination);
                }

                // 7. Redirect back with success message
                header("Location: kelola_data.php?status=import_success");
                exit;

            } catch (\Exception $e) {
                $pdo->rollBack();
                // Clean up file on error
                if (file_exists($destination)) {
                    unlink($destination);
                }
                // In production, log the error message
                header("Location: kelola_data.php?status=error_processing");
                exit;
            }
        } else {
            header("Location: kelola_data.php?status=error_upload");
            exit;
        }
    } else {
        header("Location: kelola_data.php?status=no_file");
        exit;
    }
} else {
    header("Location: kelola_data.php");
    exit;
}
?>
