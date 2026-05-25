import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, authService } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, name: string, role: 'student' | 'teacher') => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('Firebase user detected:', firebaseUser.email);
          
          // Get user profile from Firestore
          const userProfile = await authService.getUserProfile(firebaseUser.uid);
          console.log('User profile from Firestore:', userProfile);
          
          if (userProfile) {
            const user = {
              id: firebaseUser.uid,
              name: userProfile.name || '',
              email: firebaseUser.email || '',
              role: userProfile.role as 'teacher' | 'student',
              createdAt: userProfile.createdAt
            };
            console.log('Setting current user:', user);
            setCurrentUser(user);
          } else {
            console.log('No user profile found, using default');
            // If profile not found, use basic Firebase user info
            setCurrentUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: 'student' // Default role
            });
          }
        } else {
          console.log('No Firebase user');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (email: string, password: string) => {
    return authService.login(email, password);
  };

  const register = (email: string, password: string, name: string, role: 'student' | 'teacher') => {
    return authService.register(email, password, name, role);
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}