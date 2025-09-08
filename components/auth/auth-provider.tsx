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
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)


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
      const userData = { ...user, token };
      setUser(userData);
      
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

  const logout = () => setUser(null)

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
