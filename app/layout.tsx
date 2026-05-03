import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Little Stars Summer Camp",
  description: "Book your child's spot at Little Stars Summer Camp, Kuwait",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
