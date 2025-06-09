import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_API_URL = 'https://api.escuelajs.co/api/v1/auth';
const USER_API_URL = 'https://api.escuelajs.co/api/v1/users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<{ sub: string }>(token);
        // Fetch user details
        fetch(`${USER_API_URL}/${decoded.sub}`)
          .then(res => res.json())
          .then(userData => {
            setUser({
              id: userData.id,
              email: userData.email,
              username: userData.name
            });
          })
          .catch(() => {
            localStorage.removeItem('token');
          })
          .finally(() => {
            setLoading(false);
          });
      } catch {
        localStorage.removeItem('token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
   
    const { access_token } = await response.json();
    localStorage.setItem('token', access_token);
    
    const decoded = jwtDecode<{ sub: string }>(access_token);
    const userResponse = await fetch(`${USER_API_URL}/${decoded.sub}`);
    const userData = await userResponse.json();

    setUser({
      id: userData.id,
      email: userData.email,
      username: userData.name
    });
  };

  const signUp = async (email: string, password: string, username: string) => {
    const response = await fetch(USER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: username,
        email,
        password,
        avatar: 'https://picsum.photos/800'
      }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    await signIn(email, password);
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}