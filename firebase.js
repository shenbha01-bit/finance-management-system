import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  

const firebaseConfig = {
  apiKey: "AIzaSyDc5GNf7djuoWdHzKhb9JXViIM-29Ahnkc",
  authDomain: "finance-app-95911.firebaseapp.com",
  projectId: "finance-app-95911",
  storageBucket: "finance-app-95911.firebasestorage.app",
  messagingSenderId: "322014981530",
  appId: "1:322014981530:web:a0f585956b0449d59f1e23"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);