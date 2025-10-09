"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { sendPasswordResetOTP, resetPasswordWithOTP } from "@/lib/api"
import { toast } from "sonner"

interface ForgotPasswordModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onBackToLogin: () => void
}

export function ForgotPasswordModal({ open, onOpenChange, onBackToLogin }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"email" | "reset" | "success">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const resetForm = () => {
    setEmail("")
    setOtp("")
    setNewPassword("")
    setConfirmPassword("")
    setError(null)
    setStep("email")
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await sendPasswordResetOTP(email)
      toast.success(response.message || "OTP sent to your email")
      setStep("reset")
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP")
      toast.error(err?.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const response = await resetPasswordWithOTP(email, otp, newPassword)
      toast.success(response.message || "Password reset successful")
      setStep("success")
    } catch (err: any) {
      setError(err?.message || "Failed to reset password")
      toast.error(err?.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleBackToLogin = () => {
    resetForm()
    onOpenChange(false)
    onBackToLogin()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "email" && "Forgot Password"}
            {step === "reset" && "Reset Password"}
            {step === "success" && "Password Reset Successful"}
          </DialogTitle>
          <DialogDescription>
            {step === "email" && "Enter your email to receive a password reset OTP"}
            {step === "reset" && "Enter the OTP sent to your email and your new password"}
            {step === "success" && "Your password has been reset successfully"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Enter Email */}
        {step === "email" && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email Address</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleBackToLogin}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-400 text-slate-900 hover:bg-amber-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Enter OTP and New Password */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-display">Email</Label>
              <Input
                id="email-display"
                type="email"
                value={email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500">Check your email for the OTP code</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <PasswordInput
                id="new-password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <PasswordInput
                id="confirm-password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep("email")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-400 text-slate-900 hover:bg-amber-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="space-y-4 text-center py-4">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <p className="text-gray-600">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <Button
              className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300"
              onClick={handleBackToLogin}
            >
              Back to Login
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

