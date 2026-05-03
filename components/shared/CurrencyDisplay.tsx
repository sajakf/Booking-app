import { useLocale } from "@/hooks/useLocale"
import { cn } from "@/lib/utils"

interface CurrencyDisplayProps {
  amount: number
  className?: string
  size?: "sm" | "md" | "lg"
}

export function CurrencyDisplay({ amount, className, size = "md" }: CurrencyDisplayProps) {
  const { locale } = useLocale()
  const symbol = locale === "ar" ? "د.ك" : "KD"
  const formatted = amount.toFixed(3)

  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-xl",
        className,
      )}
    >
      {formatted} {symbol}
    </span>
  )
}
