// js/accounting.js
import { dbCloud } from './firebase-config.js';
import {
  collection, addDoc, serverTimestamp, getDocs, query, where, orderBy,
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ========== CHART OF ACCOUNTS STANDAR ==========
const DEFAULT_COA = [
  { kode: '101', nama: 'Kas', tipe: 'aset', saldo_normal: 'debit' },
  { kode: '102', nama: 'Piutang Usaha', tipe: 'aset', saldo_normal: 'debit' },
  { kode: '103', nama: 'Persediaan Barang', tipe: 'aset', saldo_normal: 'debit' },
  { kode: '201', nama: 'Hutang Usaha', tipe: 'kewajiban', saldo_normal: 'kredit' },
  { kode: '301', nama: 'Modal', tipe: 'ekuitas', saldo_normal: 'kredit' },
  { kode: '401', nama: 'Penjualan', tipe: 'pendapatan', saldo_normal: 'kredit' },
  { kode: '501', nama: 'HPP (Harga Pokok Penjualan)', tipe: 'beban', saldo_normal: 'debit' },
  { kode: '601', nama: 'Diskon Penjualan', tipe: 'beban', saldo_normal: 'debit' },
  { kode: '701', nama: 'Beban Operasional', tipe: 'beban', saldo_normal: 'debit' },
];

// Pastikan COA ada di Firestore (jalankan sekali)
export async function initCOA() {
  const coaCol = collection(dbCloud, 'chartOfAccounts');
  const snap = await getDocs(coaCol);
  if (snap.empty) {
    for (let akun of DEFAULT_COA) {
      await addDoc(coaCol, akun);
    }
    console.log('✅ Chart of Accounts siap.');
  }
}

// Ambil akun berdasarkan kode
export async function getAkunByKode(kode) {
  const q = query(collection(dbCloud, 'chartOfAccounts'), where('kode', '==', kode));
  const snap = await getDocs(q);
  if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  return null;
}

// Catat satu entry jurnal
async function addJournalEntry(jurnalId, akunId, debit, kredit) {
  await addDoc(collection(dbCloud, 'journalEntries'), {
    jurnalId,
    akunId,
    debit: debit || 0,
    kredit: kredit || 0,
    createdAt: serverTimestamp()
  });
}

// Fungsi utama: catat jurnal lengkap
export async function recordJournal(entries, description, reference) {
  // entries = [{ kode_akun: '101', debit: 10000, kredit: 0 }, ...]
  const jurnalRef = await addDoc(collection(dbCloud, 'journals'), {
    tanggal: new Date().toISOString().split('T')[0],
    description,
    reference,
    createdAt: serverTimestamp()
  });

  for (let entry of entries) {
    const akun = await getAkunByKode(entry.kode);
    if (!akun) {
      console.error(`Akun dengan kode ${entry.kode} tidak ditemukan`);
      continue;
    }
    await addJournalEntry(jurnalRef.id, akun.id, entry.debit || 0, entry.kredit || 0);
  }

  return jurnalRef.id;
}
