import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxbpYSj18Oe-la8gNQCUU7FJKbyhj4Vjg",
  authDomain: "pantry-app-69391.firebaseapp.com",
  projectId: "pantry-app-69391",
  storageBucket: "pantry-app-69391.appspot.com",
  messagingSenderId: "298084897355",
  appId: "1:298084897355:web:c36d4ce351b35b3c9fb3ce",
  measurementId: "G-914M8QCDJC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, firestore, auth };