const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const privateKey = 'Yl35v-4x9ph-xDMlH-ho1rG-npj5B'; // Ganti dengan Private Key Tripay Anda

// Fungsi untuk memverifikasi signature dari Tripay
function verifySignature(callbackData, callbackSignature) {
    const { merchant_ref, status, amount } = callbackData;
    const payload = `${merchant_ref}${status}${amount}${privateKey}`;
    const calculatedSignature = crypto.createHash('sha256').update(payload).digest('hex');
    return calculatedSignature === callbackSignature;
}

// Endpoint untuk menangani callback dari Tripay
app.post('/callback', (req, res) => {
    const callbackData = req.body;
    const callbackSignature = req.headers['x-callback-signature']; // Signature yang dikirim oleh Tripay

    if (verifySignature(callbackData, callbackSignature)) {
        // Signature valid, proses data callback
        const { merchant_ref, status, amount } = callbackData;

        console.log('Callback diterima:', callbackData);

        if (status === 'PAID') {
            // Lakukan tindakan jika pembayaran berhasil
            console.log(`Pembayaran dengan ref ${merchant_ref} sebesar ${amount} berhasil.`);
            // Misalnya, update status pembayaran di database
        } else if (status === 'EXPIRED') {
            // Lakukan tindakan jika pembayaran kedaluwarsa
            console.log(`Pembayaran dengan ref ${merchant_ref} kedaluwarsa.`);
        } else if (status === 'FAILED') {
            // Lakukan tindakan jika pembayaran gagal
            console.log(`Pembayaran dengan ref ${merchant_ref} gagal.`);
        }

        // Kirim respons sukses ke Tripay
        res.status(200).json({ message: 'Callback diterima dan diproses' });
    } else {
        // Signature tidak valid
        console.error('Signature tidak valid');
        res.status(400).json({ message: 'Invalid signature' });
    }
});

// Menjalankan server di port 3000
app.listen(3000, () => {
    console.log('Server berjalan di port 3000');
});
