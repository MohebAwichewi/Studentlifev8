import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  try {
    const { id, status, plan } = await req.json()

    const updated = await prisma.business.update({
      where: { id },
      data: { 
        status, 
        // If you have a 'plan' column (Basic/Pro), un-comment this:
        // plan: plan 
      }
    })

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}