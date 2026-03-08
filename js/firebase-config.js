import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Dexie sudah tersedia secara global dari tag script di HTML, tidak perlu import

const firebaseConfig = {
  apiKey: "AIzaSyDVty30S6y_qc1eMs3kVctcIpLt6Suw4dA",
  authDomain: "mudapos-e8a4a.firebaseapp.com",
  projectId: "mudapos-e8a4a",
  storageBucket: "mudapos-e8a4a.firebasestorage.app",
  messagingSenderId: "864215339664",
  appId: "1:864215339664:web:1a97898b85ca3c1cb3be15"
};

const app = initializeApp(firebaseConfig);
const dbCloud = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Inisialisasi Dexie dengan semua tabel yang diperlukan (lengkap dengan field sinkron)
const dbLokal = new Dexie("MudaPosDB");
dbLokal.version(1).stores({
    // Produk
    produk: '++id, kode, nama, barcode, kategoriId, hargaDasar, hargaJual, berat, unitId, diskon, gudangId, stokAwal, stokMinimal, produkTimbangan, synced, idCloud',
    // Konversi unit
    konversiUnit: '++id, produkId, produkIdCloud, unitId, nilai, barcode, aktif, hargaDasar, hargaJual, poinPelanggan, komisiSales, synced, idCloud',
    // Qty break
    qtyBreak: '++id, produkId, produkIdCloud, level, minQty, harga, synced, idCloud',
    // Kategori
    kategori: '++id, nama, synced, idCloud',
    // Unit
    unit: '++id, nama, synced, idCloud',
    // Gudang
    gudang: '++id, kode, nama, lokasi, kapasitas, synced, idCloud',
    // Transaksi (untuk keperluan sales nanti)
    transaksi: '++id, noFaktur, tanggal, total, statusSync, synced, idCloud',
    // Detail transaksi
    detailTransaksi: '++id, transaksiId, produkId, nama, harga, qty, subtotal, synced, idCloud'
});

export { app, dbCloud, dbLokal, auth, provider, signInWithPopup, signOut, onAuthStateChanged };
