// js/auth-guard.js
import { auth, dbCloud } from './firebase-config.js';
import { 
  doc, getDoc, setDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { 
  onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import * as firebaseui from 'https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.js';
import { GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// ========== KONFIGURASI AKSES HALAMAN ==========
const PAGE_ACCESS = {
  adminOnly: [
    'masterdata.html',
    'purchase.html',
    'purchase-list.html',
    'finance.html',
    'inventory.html',
    'report.html',
    'setting.html',
    'relation.html',
    'user-manager.html'
  ],
  kasirAllowed: [
    'index.html',
    'sales.html',
    'sales-list.html',
    'sales-returns.html'
  ]
};

const ADMIN_ONLY_MENU_ITEMS = [
  'masterdata.html',
  'purchase.html',
  'purchase-list.html',
  'finance.html',
  'inventory.html',
  'report.html',
  'setting.html',
  'relation.html'
];

// ========== STATE ==========
let currentUser = null;
let currentRole = null;
let authInitialized = false;
let uiInstance = null;

// ========== SESSION STORAGE ==========
function saveAuthState(user, role) {
  if (user) {
    sessionStorage.setItem('userEmail', user.email);
    sessionStorage.setItem('userDisplayName', user.displayName || '');
    sessionStorage.setItem('userRole', role);
    sessionStorage.setItem('userUid', user.uid);
  } else {
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userDisplayName');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userUid');
  }
}

function loadAuthState() {
  return {
    email: sessionStorage.getItem('userEmail'),
    displayName: sessionStorage.getItem('userDisplayName'),
    role: sessionStorage.getItem('userRole'),
    uid: sessionStorage.getItem('userUid')
  };
}

// ========== FETCH / CREATE USER ROLE ==========
async function fetchOrCreateUserRole(user) {
  if (!user) return null;
  try {
    const userDocRef = doc(dbCloud, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.role || 'kasir'; // default kasir jika field kosong
    } else {
      // User baru: buat dokumen dengan role default 'kasir'
      const defaultRole = 'kasir';
      await setDoc(userDocRef, {
        email: user.email,
        name: user.displayName || '',
        role: defaultRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return defaultRole;
    }
  } catch (error) {
    console.error("Gagal mengambil/membuat role:", error);
    return null;
  }
}

// ========== INISIALISASI AUTH DENGAN FIREBASEUI ==========
export async function initAuth(callback) {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        const role = await fetchOrCreateUserRole(user);
        currentRole = role;
        saveAuthState(user, role);
      } else {
        currentUser = null;
        currentRole = null;
        saveAuthState(null, null);
      }
      authInitialized = true;
      
      if (callback) callback(user, currentRole);
      resolve({ user, role: currentRole });
    });
    
    // Bersihkan listener jika perlu (tapi kita biarkan saja)
    window._authUnsubscribe = unsubscribe;
  });
}

// ========== FIREBASEUI WIDGET ==========
export function startFirebaseUI(containerId, redirectUrl = '/index.html') {
  if (!uiInstance) {
    uiInstance = new firebaseui.auth.AuthUI(auth);
  }
  
  const uiConfig = {
    signInFlow: 'redirect',        // Stabil untuk mobile
    signInSuccessUrl: redirectUrl, // Halaman setelah login sukses (default)
    signInOptions: [
      GoogleAuthProvider.PROVIDER_ID,
      // EmailAuthProvider.PROVIDER_ID, // Opsional
    ],
    callbacks: {
      signInSuccessWithAuthResult: async (authResult, redirectUrl) => {
        const user = authResult.user;
        // Tunggu sebentar agar role sempat tersimpan
        const role = await fetchOrCreateUserRole(user);
        saveAuthState(user, role);
        currentUser = user;
        currentRole = role;
        
        // Redirect sesuai role
        if (role === 'admin') {
          window.location.href = 'masterdata.html';
        } else {
          window.location.href = 'sales.html';
        }
        
        // Jangan biarkan FirebaseUI redirect sendiri
        return false;
      },
      uiShown: () => {
        // Bisa sembunyikan loader di sini
      }
    },
    credentialHelper: firebaseui.auth.CredentialHelper.NONE, // Tidak simpan kredensial
  };
  
  uiInstance.start(`#${containerId}`, uiConfig);
}

// ========== ROUTE GUARD ==========
export function checkPageAccess() {
  const state = loadAuthState();
  const role = state.role;
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  if (!role) {
    // Belum login: tampilkan UI login
    console.warn('Tidak ada role, arahkan ke login');
    if (currentPage !== 'index.html') {
      window.location.href = 'index.html';
    }
    return false;
  }
  
  const isAdmin = role === 'admin';
  const isKasir = role === 'kasir';
  
  if (isAdmin) {
    return true; // Admin bisa akses semua
  }
  
  if (isKasir) {
    if (PAGE_ACCESS.kasirAllowed.includes(currentPage)) {
      return true;
    } else {
      alert('Akses ditolak. Halaman ini hanya untuk admin.');
      window.location.href = 'sales.html';
      return false;
    }
  }
  
  alert('Role tidak valid.');
  window.location.href = 'index.html';
  return false;
}

// ========== FILTER SIDEBAR ==========
export function filterSidebarByRole() {
  const role = loadAuthState().role;
  if (role !== 'admin') {
    const allLinks = document.querySelectorAll('.sidebar-menu .menu-link, .sidebar-menu .nav-link, .sidebar-menu a');
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const page = href.split('/').pop();
        if (ADMIN_ONLY_MENU_ITEMS.includes(page)) {
          const parentLi = link.closest('li');
          if (parentLi) parentLi.style.display = 'none';
        }
      }
    });
    
    // Sembunyikan submenu yang hanya admin
    const submenuItems = document.querySelectorAll('.submenu a');
    submenuItems.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const page = href.split('/').pop();
        if (ADMIN_ONLY_MENU_ITEMS.includes(page)) {
          const parentLi = link.closest('li');
          if (parentLi) parentLi.style.display = 'none';
        }
      }
    });
  }
  
  updateUserInfoUI();
}

// ========== UPDATE UI INFO USER ==========
export function updateUserInfoUI() {
  const state = loadAuthState();
  const userNameSpan = document.getElementById('userDisplayName');
  const userRoleSpan = document.getElementById('userRoleDisplay');
  
  if (userNameSpan && state.displayName) {
    userNameSpan.textContent = state.displayName;
  }
  if (userRoleSpan && state.role) {
    userRoleSpan.textContent = state.role === 'admin' ? 'Administrator' : 'Kasir';
  }
}

// ========== LOGOUT ==========
export async function logoutUser() {
  try {
    await signOut(auth);
    saveAuthState(null, null);
    currentUser = null;
    currentRole = null;
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ========== GETTER ==========
export function getCurrentUser() {
  return currentUser;
}

export function getCurrentRole() {
  return currentRole || loadAuthState().role;
}

export function isAdmin() {
  return getCurrentRole() === 'admin';
}

export function isKasir() {
  return getCurrentRole() === 'kasir';
}

// ========== TUNGGU INISIALISASI ==========
export async function waitForAuth() {
  if (authInitialized) return { user: currentUser, role: currentRole };
  return new Promise((resolve) => {
    const check = setInterval(() => {
      if (authInitialized) {
        clearInterval(check);
        resolve({ user: currentUser, role: currentRole });
      }
    }, 100);
  });
}
