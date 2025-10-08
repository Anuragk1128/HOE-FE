"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
}

export function OTPInput({ value, onChange, length = 6, disabled = false }: OTPInputProps) {
  const [otp, setOtp] = React.useState<string[]>(Array(length).fill(""))
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Sync external value with internal state only when empty or completely different
  React.useEffect(() => {
    const currentValue = otp.join("")
    if (value !== currentValue && !currentValue) {
      // Only sync if current is empty
      if (value) {
        const digits = value.split("").slice(0, length)
        const newOtp = Array(length).fill("")
        digits.forEach((digit, i) => {
          newOtp[i] = digit
        })
        setOtp(newOtp)
      } else {
        setOtp(Array(length).fill(""))
      }
    }
  }, [value, length])

  const handleChange = (index: number, newValue: string) => {
    // Take only the last character if multiple chars are entered
    const digit = newValue.slice(-1)
    
    // Only allow digits
    if (digit && !/^\d$/.test(digit)) return

    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    // Notify parent immediately
    onChange(newOtp.join(""))

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus()
      } else if (otp[index]) {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
        onChange(newOtp.join(""))
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()
    const digits = pastedData.split("").filter((char) => /^\d$/.test(char)).slice(0, length)
    
    if (digits.length === 0) return

    const newOtp = Array(length).fill("")
    digits.forEach((digit, index) => {
      newOtp[index] = digit
    })
    
    setOtp(newOtp)
    onChange(newOtp.join(""))

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((digit) => !digit)
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(digits.length, length - 1)
    setTimeout(() => {
      inputRefs.current[focusIndex]?.focus()
    }, 0)
  }

  const handleFocus = (index: number) => {
    // Select the content when focused
    inputRefs.current[index]?.select()
  }

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-lg font-semibold",
            "border-2 rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all",
            digit ? "border-amber-400" : "border-gray-300"
          )}
        />
      ))}
    </div>
  )
}

