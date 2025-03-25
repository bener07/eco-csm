// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUA1yzrQX2aSSga_snaz3CIgwuDonzpHw",
  authDomain: "eco-csm.firebaseapp.com",
  projectId: "eco-csm",
  storageBucket: "eco-csm.firebasestorage.app",
  messagingSenderId: "711637616635",
  appId: "1:711637616635:web:5e837956c8d6151fcbad5e",
  measurementId: "G-MM8HP4SQR0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const analytics = getAnalytics(app);

export {db};