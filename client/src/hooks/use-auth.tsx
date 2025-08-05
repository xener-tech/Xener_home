import { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth, handleAuthRedirect } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user for demonstration (remove when Firebase is configured)
    const mockUser: User = {
      id: 1,
      firebaseUid: "demo-uid",
      email: "demo@example.com",
      name: "Demo User",
      energyScore: 85,
      createdAt: new Date(),
    };

    // Simulate loading delay then set mock user
    const timer = setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);

    /* TODO: Uncomment when Firebase is configured
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Login/register user in our backend
          const response = await apiRequest("POST", "/api/auth/login", {
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || "User",
          });
          
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          console.error("Failed to sync user with backend:", error);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Handle redirect result on page load
    handleAuthRedirect().catch(console.error);

    return unsubscribe;
    */
  }, []);

  const signOut = async () => {
    const { signOutUser } = await import("@/lib/firebase");
    await signOutUser();
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
