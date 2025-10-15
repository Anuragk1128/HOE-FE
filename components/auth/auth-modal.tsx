"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { OTPInput } from "@/components/ui/otp-input"
import { useAuth } from "./auth-provider"
import { Loader2, ArrowLeft } from "lucide-react"
import GoogleLoginButton from "./google-login-button"
import { toast } from "sonner"
import { ForgotPasswordModal } from "./forgot-password-modal"

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { login, sendOtp, registerWithOtp } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  // Login state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register state - 2 step process
  const [registrationStep, setRegistrationStep] = useState<1 | 2>(1)
  const [registerEmail, setRegisterEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await login(loginEmail, loginPassword)
      if (res.ok) {
        onOpenChange(false)
      } else {
        setError(res.error || 'Login failed. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Send OTP
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await sendOtp(registerEmail)
      if (res.ok) {
        setOtpSent(true)
        setRegistrationStep(2)
        toast.success(res.message || 'OTP sent to your email')
      } else {
        setError(res.error || 'Failed to send OTP. Please try again.')
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Complete Registration
  async function handleCompleteRegistration(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await registerWithOtp(name, registerEmail, password, otp)
      if (res.ok) {
        toast.success('Registration successful! Welcome!')
        onOpenChange(false)
        // Redirect to home page
        router.push('/')
      } else {
        setError(res.error || 'Registration failed. Please check your OTP and try again.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Reset registration state when modal closes or tab changes
  const resetRegistrationState = () => {
    setRegistrationStep(1)
    setRegisterEmail("")
    setName("")
    setPassword("")
    setOtp("")
    setOtpSent(false)
    setError(null)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setTab(value as "login" | "register")
    resetRegistrationState()
    setError(null)
  }

  // Handle modal close
  const handleModalClose = (value: boolean) => {
    if (!value) {
      resetRegistrationState()
      setLoginEmail("")
      setLoginPassword("")
      setError(null)
    }
    onOpenChange(value)
  }

  return (
    <>
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {tab === "login" 
              ? "Login" 
              : registrationStep === 1 
                ? "Create account - Step 1" 
                : "Create account - Step 2"
            }
          </DialogTitle>
          <DialogDescription>
            {tab === "login" 
              ? "Sign in to your account" 
              : registrationStep === 1
                ? "Enter your email to receive OTP"
                : "Complete your registration details"
            }
          </DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true)
                      onOpenChange(false)
                    }}
                    className="text-xs text-amber-600 hover:text-amber-700 underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <PasswordInput id="login-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in with Email"
                )}
              </Button>
            
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <GoogleLoginButton />
             
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            {registrationStep === 1 ? (
              // Step 1: Email Input
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input 
                    id="register-email" 
                    type="email" 
                    value={registerEmail} 
                    onChange={(e) => setRegisterEmail(e.target.value)} 
                    placeholder="Enter your email"
                    required 
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send a verification code to this email
                  </p>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button 
                  type="submit" 
                  className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </form>
            ) : (
              // Step 2: Name, Password, OTP
              <form onSubmit={handleCompleteRegistration} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email-readonly">Email</Label>
                  <Input 
                    id="register-email-readonly" 
                    type="email" 
                    value={registerEmail} 
                    readOnly 
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your full name"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput 
                    id="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Create a password"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <OTPInput 
                    value={otp} 
                    onChange={setOtp} 
                    length={6}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    OTP valid for 10 minutes
                  </p>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button 
                  type="submit" 
                  className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
    
    
    <ForgotPasswordModal
      open={showForgotPassword}
      onOpenChange={setShowForgotPassword}
      onBackToLogin={() => {
        setShowForgotPassword(false)
        onOpenChange(true)
      }}
    />
    </>
  )
}
