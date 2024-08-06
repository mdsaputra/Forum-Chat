// src/firebase.js
import {initializeApp} from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import {getDatabase} from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Pastikan AsyncStorage terinstal

const firebaseConfig = {
  apiKey: 'AIzaSyCwa9riswA3A7iIF7s0u08B__ovh1jkzdA',
  authDomain: 'chatnow-9d51f.firebaseapp.com',
  projectId: 'chatnow-9d51f',
  storageBucket: 'chatnow-9d51f.appspot.com',
  messagingSenderId: '828090857475',
  appId: '1:828090857475:web:0a8e28c543ab7d8269b636',
  measurementId: 'G-VL6X27YDDW',
};

// Inisialisasi aplikasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Auth dengan persistence menggunakan AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Dapatkan instance dari Database
const database = getDatabase(app);

export {auth, database};
