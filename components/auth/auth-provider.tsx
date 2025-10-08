"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { API_BASE_URL } from "@/lib/api"

export type User = {
  id: string
  name: string
  email: string
  phone?: string
  token?: string
}

type LoginResponse = {
  token: string
  user: Omit<User, 'token'>
}

type ErrorResponse = {
  message: string
  statusCode?: number
  error?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  register: (name: string, email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  sendOtp: (email: string) => Promise<{ ok: true; message: string } | { ok: false; error: string }>
  registerWithOtp: (name: string, email: string, password: string, otp: string) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => void
  setAuthenticatedUser: (user: Omit<User, 'token'>, token: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage and listen for cross-tab updates
  useEffect(() => {
    try {
      const rawUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (rawUser && token) {
        const parsed = JSON.parse(rawUser) as Omit<User, 'token'> & Partial<User>;
        setUser({
          id: parsed.id,
          name: parsed.name,
          email: parsed.email,
          phone: (parsed as any).phone,
          token,
        });
      }
    } catch (e) {
      console.warn('Failed to restore auth state from storage', e);
    } finally {
      setLoading(false);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'authToken') {
        try {
          const rawUser = localStorage.getItem('user');
          const token = localStorage.getItem('authToken');
          if (rawUser && token) {
            const parsed = JSON.parse(rawUser);
            setUser({ id: parsed.id, name: parsed.name, email: parsed.email, phone: parsed.phone, token });
          } else {
            setUser(null);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [])

  const setAuthenticatedUser = (u: Omit<User, 'token'>, token: string) => {
    setUser({ ...u, token });
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(u));
    } catch {}
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json() as LoginResponse | ErrorResponse;

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        return { 
          ok: false as const, 
          error: errorData.message || 'Login failed. Please check your credentials and try again.' 
        };
      }

      const { token, user } = data as LoginResponse;
      setAuthenticatedUser(user, token);
      return { ok: true as const };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        ok: false as const, 
        error: 'An error occurred during login. Please try again later.' 
      };
    }
  }

  const register = async (name: string, email: string, password: string) => {
    if (!name || !email || !password) {
      return { ok: false as const, error: "All fields are required" };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json() as LoginResponse | ErrorResponse;

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        return { 
          ok: false as const, 
          error: errorData.message || 'Registration failed. Please try again.' 
        };
      }

      const { token, user } = data as LoginResponse;
      const userData = { ...user, token };
      setUser(userData);
      
      return { ok: true as const };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        ok: false as const, 
        error: 'An error occurred during registration. Please try again later.' 
      };
    }
  }

  const sendOtp = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/send-otp`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json() as { message: string } | ErrorResponse;

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        return { 
          ok: false as const, 
          error: errorData.message || errorData.error || 'Failed to send OTP. Please try again.' 
        };
      }

      return { 
        ok: true as const, 
        message: (data as { message: string }).message || 'OTP sent to email'
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      return { 
        ok: false as const, 
        error: 'An error occurred while sending OTP. Please try again later.' 
      };
    }
  }

  const registerWithOtp = async (name: string, email: string, password: string, otp: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, otp })
      });

      const data = await response.json() as { token: string; user: Omit<User, 'token'> } | ErrorResponse;

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        return { 
          ok: false as const, 
          error: errorData.message || errorData.error || 'Registration failed. Please try again.' 
        };
      }

      const { token, user } = data as { token: string; user: Omit<User, 'token'> };
      setAuthenticatedUser(user, token);
      return { ok: true as const };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        ok: false as const, 
        error: 'An error occurred during registration. Please try again later.' 
      };
    }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch {}
  }

  const value = useMemo(() => ({ user, loading, login, register, sendOtp, registerWithOtp, logout, setAuthenticatedUser }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
