'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { getVendorToken, saveVendorToken, clearVendorToken, vendorLogin as apiVendorLogin, type VendorLoginResponse } from '@/lib/api'

interface VendorUser {
  _id: string
  email: string
  name?: string
}

interface VendorAuthContextType {
  vendor: VendorUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const VendorAuthContext = createContext<VendorAuthContextType | undefined>(undefined)

export function VendorAuthProvider({ children }: { children: ReactNode }) {
  const [vendor, setVendor] = useState<VendorUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const existingToken = getVendorToken()
    if (existingToken) {
      setToken(existingToken)
      // You might want to validate the token with an API call here
      // For now, we'll just set the token as valid
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiVendorLogin(email, password)
    console.log('Login response in context:', response)
    
    // Response is just { token: "string" }
    if (response.token) {
      const newToken = response.token
      // Create vendor object with email since API doesn't return vendor details
      const vendorData = { 
        _id: '', // We don't have vendor ID from login response
        email: email,
        name: undefined
      }
      setToken(newToken)
      setVendor(vendorData)
      saveVendorToken(newToken)
    } else {
      console.error('No token in response:', response)
      throw new Error(response.message || response.error || 'Login failed - no token received')
    }
  }

  const logout = () => {
    setToken(null)
    setVendor(null)
    clearVendorToken()
  }

  const value = {
    vendor,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  }

  return (
    <VendorAuthContext.Provider value={value}>
      {children}
    </VendorAuthContext.Provider>
  )
}

export function useVendorAuth() {
  const context = useContext(VendorAuthContext)
  if (context === undefined) {
    throw new Error('useVendorAuth must be used within a VendorAuthProvider')
  }
  return context
}

