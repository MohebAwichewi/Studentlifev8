import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = "admin@s7.tn"
  const rawPassword = "moheb_ceo_s7"

  // 1. Check if Admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email }
  })

  if (existingAdmin) {
    console.log(`⚠️  Admin account already exists: ${email}`)
    // Optional: Update password if you want to reset it
    const hashedPassword = await bcrypt.hash(rawPassword, 10)
    await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword }
    })
    console.log(`🔄 Password reset for: ${email}`)
  } else {
    // 2. Create new Admin
    const hashedPassword = await bcrypt.hash(rawPassword, 10)
    
    await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        role: "CEO"
      }
    })
    console.log(`✅ CEO Account Created: ${email}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })