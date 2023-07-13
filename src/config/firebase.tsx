// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore/lite'
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBGPg3kxbGfHNFKKNSNOtJ2DhxwWgw7mas",
    authDomain: "project-ta-4a31c.firebaseapp.com",
    projectId: "project-ta-4a31c",
    storageBucket: "project-ta-4a31c.appspot.com",
    messagingSenderId: "641358009220",
    appId: "1:641358009220:web:5bdd0d24a03d4bd58c03d1",
    measurementId: "G-J2EC4GX4B6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { analytics, firestore, storage }; 