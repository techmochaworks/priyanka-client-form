// authcontext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider, // Import this
  signInWithPopup     // Import this
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Import getDoc

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>; // Add to interface
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name,
      email,
      createdAt: new Date().toISOString(),
    });
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // New Google Sign In Function
  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore, if not, create them
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        name: user.displayName || 'User',
        email: user.email,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    googleSignIn, // Export function
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};