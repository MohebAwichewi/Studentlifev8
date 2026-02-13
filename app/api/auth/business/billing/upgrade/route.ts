import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  return NextResponse.json({ error: "Payment integration disabled." }, { status: 410 })
}