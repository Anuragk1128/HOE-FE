"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

export type User = {
  name: string
  email: string
  phone?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  register: (name: string, email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "hoe_auth_user_v1"

const DEMO = {
  email: "demo@hoe.test",
  password: "Demo@123",
  name: "Demo User",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) setUser(JSON.parse(raw))
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const login = async (email: string, password: string) => {
    // Demo credentials
    if (email === DEMO.email && password === DEMO.password) {
      setUser({ name: DEMO.name, email: DEMO.email })
      return { ok: true as const }
    }
    // Very basic fake validation for demo
    return { ok: false as const, error: "Invalid credentials" }
  }

  const register = async (name: string, email: string, password: string) => {
    if (!name || !email || !password) return { ok: false as const, error: "All fields are required" }
    // Accept any inputs for demo and sign user in
    setUser({ name, email })
    return { ok: true as const }
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
