import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDvty30S6y_qc1eMs3kVctcIpLt6Suw4dA",
    authDomain: "mudapos-e8a4a.firebaseapp.com",
    projectId: "mudapos-e8a4a",
    storageBucket: "mudapos-e8a4a.firebasestorage.app",
    messagingSenderId: "864215339664",
    appId: "1:864215339664:web:1a97898b85ca3c1cb3be15"
};

const app = initializeApp(firebaseConfig);
const dbCloud = getFirestore(app);

// Inisialisasi Dexie dengan store yang lebih lengkap
const dbLokal = new Dexie("MudaPosDB");
dbLokal.version(1).stores({
    produk: '++id, kode, nama, harga, stok, kategori, synced, idCloud',
    transaksi: '++id, noFaktur, tanggal, total, statusSync',
    detailTransaksi: '++id, transaksiId, produkId, nama, harga, qty, subtotal'
});

export { dbCloud, dbLokal };
