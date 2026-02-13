import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'


const prisma = new PrismaClient()

export async function PUT(req: Request) {
  // 1. Check Security (Protect the route)
  // const session = await getServerSession()
  // if (!session) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // }

  const body = await req.json()
  const { name, newPassword, email } = body // Assuming you might want to change email too later

  // 2. Prepare update data
  const updateData: any = {
    name: name, // If you have a 'name' field in your Admin table
  }

  // 3. If password provided, hash it
  if (newPassword && newPassword.length > 0) {
    const hashedPassword = await hash(newPassword, 12)
    updateData.password = hashedPassword
  }

  try {
    // 4. Update the Admin (Hardcoded to the logged-in user's email, or pass email in body)
    // Ideally, get the email from the session: session.user.email
    const userEmail = 'admin@s7.agency'

    const updatedUser = await prisma.admin.update({
      where: { email: userEmail },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}