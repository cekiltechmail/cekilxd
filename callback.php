<?php
// Mengatur header untuk JSON response
header('Content-Type: application/json');

// Mendapatkan private key dari file konfigurasi
$config = include('config.php');
$private_key = $config['tripay_secret'];

// Ambil data JSON dari permintaan POST
$data = json_decode(file_get_contents('php://input'), true);

// Periksa jika data dan signature ada
if (isset($data['merchant_ref']) && isset($data['status']) && isset($data['amount']) && isset($data['signature'])) {
    // Ambil signature dari data
    $received_signature = $data['signature'];

    // Buat signature lokal
    $signature = hash_hmac('sha256', $data['merchant_ref'] . $data['status'] . $data['amount'], $private_key);

    // Verifikasi signature
    if ($received_signature === $signature) {
        // Tangani status pembayaran
        switch ($data['status']) {
            case 'PAID':
                $message = 'Pembayaran berhasil';
                break;
            case 'EXPIRED':
                $message = 'Pembayaran kedaluwarsa';
                break;
            case 'FAILED':
                $message = 'Pembayaran gagal';
                break;
            default:
                $message = 'Status tidak dikenali';
                break;
        }

        // Kirim respon JSON
        echo json_encode(['message' => $message, 'status' => $data['status']]);
    } else {
        // Signature tidak valid
        echo json_encode(['message' => 'Signature tidak valid', 'status' => 'error']);
    }
} else {
    // Jika data tidak valid
    echo json_encode(['message' => 'Data tidak valid', 'status' => 'error']);
}
?>
