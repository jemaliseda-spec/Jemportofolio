import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  doc,
  getDoc,
  getFirestore
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const loginPanel = document.getElementById("owner-login-panel");
const dashboard = document.getElementById("owner-dashboard");
const status = document.getElementById("auth-status");
const signInButton = document.getElementById("google-sign-in");
const signOutButton = document.getElementById("owner-sign-out");
let accessCheck = 0;
let authErrorMessage = "";

const errorWithCode = (message, error) => {
  const code = typeof error?.code === "string" ? error.code : "unknown";
  return `${message} (Kode Firebase: ${code})`;
};

const setStatus = (message, isError = false) => {
  status.textContent = message;
  status.className = `mt-4 rounded-lg border px-3 py-2 text-sm leading-6 ${
    isError
      ? "border-rose-400/30 bg-rose-400/10 text-rose-100"
      : "border-amber-400/30 bg-amber-400/10 text-amber-100"
  }`;
};

const showLogin = (message, isError = false) => {
  dashboard.classList.add("hidden");
  loginPanel.classList.remove("hidden");
  document.getElementById("owner-email").textContent = "";
  setStatus(message, isError);
};

if (!isFirebaseConfigured) {
  showLogin("Login belum aktif. Lengkapi konfigurasi aplikasi web di firebase-config.js, lalu siapkan Authentication dan Firestore sesuai petunjuk.");
} else {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    signInButton.disabled = false;
    setStatus("Siap masuk menggunakan akun Google yang sudah diizinkan.");

    signInButton.addEventListener("click", async () => {
      signInButton.disabled = true;
      authErrorMessage = "";
      setStatus("Membuka login Google...");
      try {
        await signInWithRedirect(auth, provider);
      } catch (error) {
        signInButton.disabled = false;
        authErrorMessage = errorWithCode("Login Google gagal. Periksa koneksi dan pengaturan Firebase.", error);
        showLogin(authErrorMessage, true);
      }
    });

    signOutButton.addEventListener("click", async () => {
      try {
        await signOut(auth);
        showLogin("Anda sudah keluar.");
      } catch (error) {
        showLogin("Tidak dapat mengakhiri sesi. Periksa koneksi lalu coba kembali.", true);
      }
    });

    onAuthStateChanged(auth, async (user) => {
      const requestId = ++accessCheck;
      if (!user) {
        signInButton.disabled = false;
        showLogin(authErrorMessage || "Masuk dengan akun Google pemilik yang telah didaftarkan.", Boolean(authErrorMessage));
        return;
      }

      authErrorMessage = "";
      signInButton.disabled = true;
      showLogin("Memeriksa akses pemilik...");
      try {
        const adminDocument = await getDoc(doc(firestore, "dashboardAdmins", user.uid));
        if (requestId !== accessCheck) return;
        if (!adminDocument.exists() || adminDocument.data().active !== true) {
          authErrorMessage = "Login Google berhasil, tetapi akun ini belum diberi akses pemilik. Periksa UID dan dokumen dashboardAdmins di Firebase.";
          await signOut(auth);
          if (requestId === accessCheck) {
            signInButton.disabled = false;
            showLogin(authErrorMessage, true);
          }
          return;
        }

        loginPanel.classList.add("hidden");
        dashboard.classList.remove("hidden");
        document.getElementById("owner-email").textContent = user.email || "Akun Google";
        document.dispatchEvent(new Event("owner-dashboard-authenticated"));
      } catch (error) {
        if (requestId !== accessCheck) return;
        authErrorMessage = errorWithCode("Login Google berhasil, tetapi akses Firestore tidak dapat diverifikasi. Periksa Firestore Rules dan koneksi internet.", error);
        await signOut(auth);
        signInButton.disabled = false;
        showLogin(authErrorMessage, true);
      }
    });

    getRedirectResult(auth).catch((error) => {
      authErrorMessage = errorWithCode("Login Google gagal. Pastikan provider Google aktif dan domain situs terdaftar di Firebase.", error);
      showLogin(authErrorMessage, true);
    });
  } catch (error) {
    signInButton.disabled = true;
    showLogin("Firebase tidak dapat dimulai. Periksa konfigurasi firebase-config.js.", true);
  }
}
