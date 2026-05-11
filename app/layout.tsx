import type { Metadata } from "next"
import { Bebas_Neue, Inter } from "next/font/google"
import "./globals.css"

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Little Stars Summer Camp",
  description: "Book your child's spot at Little Stars Summer Camp, Kuwait",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
