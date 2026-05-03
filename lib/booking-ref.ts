const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function generateBookingRef(): string {
  const year = new Date().getFullYear()
  let suffix = ""
  for (let i = 0; i < 6; i++) {
    suffix += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return `CAMP-${year}-${suffix}`
}
