import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: List all categories (Hierarchical)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // Get Main Categories
      include: { children: true } // Include Subcategories
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

// POST: Create a Category
export async function POST(req: Request) {
  try {
    const { name, parentId } = await req.json()
    
    const category = await prisma.category.create({
      data: {
        name,
        type: parentId ? "SUB" : "MAIN",
        parentId: parentId ? Number(parentId) : null
      }
    })
    return NextResponse.json({ success: true, category })
  } catch (error) {
    return NextResponse.json({ error: "Creation failed" }, { status: 500 })
  }
}

// DELETE: Remove a Category
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    await prisma.category.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}