<?php
session_start();
require_once 'koneksi.php';
require_once 'auth_check.php';

// Ensure user has adequate role to perform AI analysis
require_role(['Admin Provinsi', 'Admin Pusat', 'Kadis Provinsi', 'Admin Kabupaten'], 'dashboard.php');

// 2. Get the id_alokasi from the GET parameter
$id_alokasi = isset($_GET['id_alokasi']) ? intval($_GET['id_alokasi']) : 0;

if ($id_alokasi <= 0) {
    header("Location: dashboard.php?error=invalid_id");
    exit;
}

try {
    // 3. Database Query
    $stmt = $pdo->prepare("
        SELECT dap.*, mk.nama_kabupaten 
        FROM data_alokasi_pupuk dap
        JOIN master_kabupaten mk ON dap.id_kabupaten = mk.id
        WHERE dap.id = :id_alokasi
        LIMIT 1
    ");
    $stmt->bindParam(':id_alokasi', $id_alokasi, PDO::PARAM_INT);
    $stmt->execute();
    $data = $stmt->fetch();

    if (!$data) {
        header("Location: dashboard.php?error=data_not_found");
        exit;
    }

    // 4. BMKG Mock Integration
    // Simulating a BMKG weather API response for the regency
    $cuaca_mock = "La Nina - Curah Hujan Tinggi (Risiko Leaching)";
    
    // 5. Construct the Gemini Prompt
    $prompt = "Act as an Agronomy Expert.\n";
    $prompt .= "Wilayah: " . $data['nama_kabupaten'] . ". ";
    $prompt .= "Komoditas: " . $data['komoditas'] . ". ";
    $prompt .= "Luas: " . $data['luas_lahan'] . " Ha. ";
    $prompt .= "Kuota Urea: " . $data['kuota_urea'] . " Ton. ";
    $prompt .= "Kuota NPK: " . $data['kuota_npk'] . " Ton. ";
    $prompt .= "Kondisi Cuaca: " . $cuaca_mock . ".\n\n";
    $prompt .= "Instructions: Calculate the exact predicted need for Urea and NPK considering the weather anomalies (e.g., heavy rain causes nitrogen leaching so Urea need increases). Return ONLY a valid JSON object with the exact keys: 'prediksi_urea' (integer), 'prediksi_npk' (integer), 'status_risiko' (string: 'Aman', 'Waspada', or 'Kritis'), and 'narasi_rekomendasi' (string).";

    // 6. Gemini API cURL Request
    $gemini_api_key = 'YOUR_GEMINI_API_KEY'; // TODO: Store securely in .env
    $gemini_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . $gemini_api_key;

    $gemini_payload = [
        "contents" => [
            [
                "parts" => [
                    ["text" => $prompt]
                ]
            ]
        ],
        "generationConfig" => [
            "temperature" => 0.2,
            // You can strictly enforce JSON response MIME type on newer API versions
            "responseMimeType" => "application/json" 
        ]
    ];

    $ch = curl_init($gemini_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($gemini_payload));
    
    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        throw new Exception('cURL error (Gemini): ' . curl_error($ch));
    }
    curl_close($ch);

    $gemini_data = json_decode($response, true);
    
    if (!isset($gemini_data['candidates'][0]['content']['parts'][0]['text'])) {
        throw new Exception('Invalid response format from Gemini API.');
    }

    $response_text = $gemini_data['candidates'][0]['content']['parts'][0]['text'];
    
    // Clean the output (strip markdown ```json and trim whitespace)
    $response_text = str_replace(['```json', '```'], '', $response_text);
    $response_text = trim($response_text);
    
    $ai_result = json_decode($response_text, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Failed to parse Gemini JSON response: ' . json_last_error_msg());
    }

    // Extract values safely
    $prediksi_urea = $ai_result['prediksi_urea'] ?? 0;
    $prediksi_npk = $ai_result['prediksi_npk'] ?? 0;
    $status_risiko = $ai_result['status_risiko'] ?? 'Aman';
    $narasi_rekomendasi = $ai_result['narasi_rekomendasi'] ?? '';

    // 7. Database Update
    $pdo->beginTransaction();

    // Mapping prediksi_urea to prediksi_ai as well to ensure backwards compatibility with UI
    $stmt_update = $pdo->prepare("
        UPDATE data_alokasi_pupuk 
        SET 
            prediksi_ai = :prediksi_ai, 
            prediksi_urea = :prediksi_urea,
            prediksi_npk = :prediksi_npk,
            status_risiko = :status_risiko,
            cuaca_anomali = :cuaca_anomali
        WHERE id = :id_alokasi
    ");
    
    $stmt_update->bindParam(':prediksi_ai', $prediksi_urea, PDO::PARAM_INT);
    $stmt_update->bindParam(':prediksi_urea', $prediksi_urea, PDO::PARAM_INT);
    $stmt_update->bindParam(':prediksi_npk', $prediksi_npk, PDO::PARAM_INT);
    $stmt_update->bindParam(':status_risiko', $status_risiko, PDO::PARAM_STR);
    $stmt_update->bindParam(':cuaca_anomali', $cuaca_mock, PDO::PARAM_STR);
    $stmt_update->bindParam(':id_alokasi', $id_alokasi, PDO::PARAM_INT);
    $stmt_update->execute();

    // 8. n8n Webhook Trigger (Alerting)
    if (in_array($status_risiko, ['Kritis', 'Waspada'])) {
        $n8n_webhook_url = 'YOUR_N8N_WEBHOOK_URL'; // TODO: Configure Webhook URL
        
        $webhook_payload = [
            "kabupaten" => $data['nama_kabupaten'],
            "pesan" => $narasi_rekomendasi,
            "status" => $status_risiko
        ];

        // Fire a fast/semi-background cURL POST request
        $ch_webhook = curl_init($n8n_webhook_url);
        curl_setopt($ch_webhook, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch_webhook, CURLOPT_POST, true);
        curl_setopt($ch_webhook, CURLOPT_POSTFIELDS, json_encode($webhook_payload));
        curl_setopt($ch_webhook, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch_webhook, CURLOPT_TIMEOUT, 2); // Prevent hanging if n8n is slow
        curl_exec($ch_webhook);
        curl_close($ch_webhook);

        // INSERT a log entry into the riwayat_peringatan table
        $stmt_log = $pdo->prepare("
            INSERT INTO riwayat_peringatan (id_kabupaten, pesan, status, tanggal)
            VALUES (:id_kabupaten, :pesan, :status, NOW())
        ");
        $stmt_log->bindParam(':id_kabupaten', $data['id_kabupaten'], PDO::PARAM_INT);
        $stmt_log->bindParam(':pesan', $narasi_rekomendasi, PDO::PARAM_STR);
        $stmt_log->bindParam(':status', $status_risiko, PDO::PARAM_STR);
        $stmt_log->execute();
    }

    $pdo->commit();

    // 9. Redirect back to dashboard
    header("Location: dashboard.php?ai_success=1");
    exit;

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    // In production, log the actual exception message and line number securely
    error_log("Gemini Process Error: " . $e->getMessage());
    header("Location: dashboard.php?error=ai_failed");
    exit;
}
?>
