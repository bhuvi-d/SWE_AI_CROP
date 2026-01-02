import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
   apiKey: "AIzaSyAOTDqxHcTAHBGC_XzkqRLOyUu9mCOvR90",
  authDomain: "cropaid-e1101.firebaseapp.com",
  projectId: "cropaid-e1101",
  storageBucket: "cropaid-e1101.firebasestorage.app",
  messagingSenderId: "117592832656",
  appId: "1:117592832656:web:6a2c3c8fd7267397b97615",
  measurementId: "G-HWBWDJ5WF0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
