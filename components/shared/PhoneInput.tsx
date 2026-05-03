"use client"

import { cn } from "@/lib/utils"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: string
}

export function PhoneInput({ value, onChange, placeholder = "5x xxx xxxx", className, error }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "")
    const truncated = raw.slice(0, 8)
    onChange(truncated ? `+965${truncated}` : "")
  }

  const displayValue = value.startsWith("+965") ? value.slice(4) : value

  return (
    <div>
      <div className="flex overflow-hidden rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        <span className="flex items-center bg-gray-50 px-3 text-sm font-medium text-gray-600 border-e border-gray-300">
          🇰🇼 +965
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          dir="ltr"
          autoComplete="off"
          className={cn(
            "flex-1 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-gray-400",
            className,
          )}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
