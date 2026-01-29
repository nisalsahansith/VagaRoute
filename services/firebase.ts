import { initializeApp, getApps, getApp } from "firebase/app";
//@ts-ignore
import { initializeAuth, getReactNativePersistence, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBjZGTl8V4wDVyrA56B1eEbXvoKJ5qp40s",
  authDomain: "vagaroute-54d87.firebaseapp.com",
  projectId: "vagaroute-54d87",
  storageBucket: "vagaroute-54d87.firebasestorage.app",
  messagingSenderId: "814406155454",
  appId: "1:814406155454:web:77f723ec1942bc8e9032ef"
};
// Prevent re-initializing app in Expo Fast Refresh
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// Initialize Auth for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore (optional)
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
