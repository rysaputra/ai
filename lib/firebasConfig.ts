// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkcr06ggy8Ma6PUCEN8EkArT-XoauxwMg",
  authDomain: "ryo-store.firebaseapp.com",
  projectId: "ryo-store",
  storageBucket: "ryo-store.appspot.com",
  messagingSenderId: "942352040911",
  appId: "1:942352040911:web:01302be6ef694ec218c8ba",
  measurementId: "G-MD8ZTDFQ81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);