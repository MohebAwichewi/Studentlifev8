
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const admins = await prisma.admin.findMany()
    console.log('--- ADMIN USERS ---')
    admins.forEach(a => {
        console.log(`Email: ${a.email}, ID: ${a.id}, Role: ${a.role}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
