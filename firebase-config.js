// Firebase Configuration
// Instructions:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Enable Authentication > Sign-in method > Google
// 4. Enable Firestore Database
// 5. Go to Project Settings > General > Your apps > Web app
// 6. Copy your config and replace the values below

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Enable this flag to use Firebase (set to true after configuring above)
const FIREBASE_ENABLED = false;

export { firebaseConfig, FIREBASE_ENABLED };
