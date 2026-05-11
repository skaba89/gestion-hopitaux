'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = true,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState(0)

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [length, autoFocus])

  const handleChange = useCallback(
    (index: number, char: string) => {
      // Only allow digits
      if (char && !/^\d$/.test(char)) return

      const newValue = value.split('')
      // Pad with empty strings if needed
      while (newValue.length < length) newValue.push('')

      newValue[index] = char
      const result = newValue.join('').slice(0, length)
      onChange(result)

      // Auto-focus next input
      if (char && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
        setFocusedIndex(index + 1)
      }
    },
    [value, length, onChange]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (!value[index] && index > 0) {
          // Move to previous input and clear it
          const newValue = value.split('')
          newValue[index - 1] = ''
          onChange(newValue.join(''))
          inputRefs.current[index - 1]?.focus()
          setFocusedIndex(index - 1)
        } else {
          // Clear current input
          const newValue = value.split('')
          newValue[index] = ''
          onChange(newValue.join(''))
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus()
        setFocusedIndex(index - 1)
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
        setFocusedIndex(index + 1)
      } else if (e.key === 'Enter') {
        // Submit if all digits entered
        if (value.length === length) {
          const form = inputRefs.current[0]?.closest('form')
          if (form) form.requestSubmit()
        }
      }
    },
    [value, length, onChange]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
      if (pastedData) {
        onChange(pastedData)
        // Focus the next empty input or the last one
        const nextIndex = Math.min(pastedData.length, length - 1)
        inputRefs.current[nextIndex]?.focus()
        setFocusedIndex(nextIndex)
      }
    },
    [length, onChange]
  )

  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index)
    // Select the content for easy replacement
    inputRefs.current[index]?.select()
  }, [])

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={`w-11 h-13 text-center text-lg font-bold rounded-lg border-2 transition-all duration-200 ${
            focusedIndex === index
              ? 'border-teal-500 ring-2 ring-teal-500/20 bg-white dark:bg-slate-900'
              : value[index]
                ? 'border-teal-300 bg-teal-50/50 dark:bg-teal-950/20 dark:border-teal-800'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={`Chiffre ${index + 1} du code OTP`}
        />
      ))}
    </div>
  )
}
