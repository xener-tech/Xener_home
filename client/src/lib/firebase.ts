import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from "firebase/auth";

// Temporarily commented out until Firebase keys are configured
// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// };

const mockConfig = {
  apiKey: "demo-key",
  authDomain: "demo.firebaseapp.com", 
  projectId: "demo",
  storageBucket: "demo.firebasestorage.app",
  appId: "demo-app-id",
};

const app = initializeApp(mockConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Google sign in failed:", error);
    throw error;
  }
}

export async function handleAuthRedirect() {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error("Auth redirect handling failed:", error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out failed:", error);
    throw error;
  }
}
