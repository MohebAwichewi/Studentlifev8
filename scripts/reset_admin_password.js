
const { PrismaClient } = require('@prisma/client')
// Use bcryptjs for consistency with the app
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    console.log('--- RESETTING ADMIN PASSWORDS ---')

    const emails = ['admin@s7.tn', 'admin@s7.agency']
    const newPassword = 'moheb_ceo_s7'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    for (const email of emails) {
        const existing = await prisma.admin.findUnique({ where: { email } })

        if (existing) {
            await prisma.admin.update({
                where: { email },
                data: { password: hashedPassword }
            })
            console.log(`✅ Updated password for existing admin: ${email}`)
        } else {
            // Option to Create if missing, but let's just log for now to see what's what.
            // Actually, let's CREATE it if it doesn't exist, to ensure they can login.
            await prisma.admin.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'SUPER_ADMIN'
                }
            })
            console.log(`✅ Created new admin: ${email}`)
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
