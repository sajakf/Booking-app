import { config } from "dotenv"
config()

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@camp.kw"
  const password = process.env.ADMIN_PASSWORD ?? "Admin1234!"

  const existing = await prisma.adminUser.findUnique({ where: { email } })
  if (existing) {
    console.log(`Admin already exists: ${email}`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.adminUser.create({
    data: { email, passwordHash, name: "Camp Admin", role: "ADMIN" },
  })

  console.log(`Admin created: ${email} / ${password}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
