import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

// Inisialisasi Dexie dengan semua tabel yang diperlukan
const dbLokal = new Dexie("MudaPosDB");
dbLokal.version(1).stores({
    produk: '++id, kode, nama, barcode, kategoriId, hargaDasar, hargaJual, berat, unitId, diskon, gudangId, stokAwal, stokMinimal, produkTimbangan, synced, idCloud',
    konversiUnit: '++id, produkId, produkIdCloud, unitId, nilai, barcode, aktif, hargaDasar, hargaJual, poinPelanggan, komisiSales, synced, idCloud',
    qtyBreak: '++id, produkId, produkIdCloud, level, minQty, harga, synced, idCloud',
    kategori: '++id, nama, synced, idCloud',
    unit: '++id, nama, synced, idCloud',
    gudang: '++id, kode, nama, lokasi, kapasitas, synced, idCloud',
    transaksi: '++id, noFaktur, tanggal, total, statusSync, synced, idCloud',
    detailTransaksi: '++id, transaksiId, produkId, nama, harga, qty, subtotal, synced, idCloud'
});

// Ekspos dbLokal ke global agar bisa diakses di script biasa
window.dbLokal = dbLokal;

export { app, dbCloud, dbLokal, auth, provider, signInWithPopup, signOut, onAuthStateChanged };
