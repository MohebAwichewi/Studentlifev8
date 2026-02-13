import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { name, parentId } = await req.json()
        const categoryId = parseInt(params.id)

        const category = await prisma.category.update({
            where: { id: categoryId },
            data: {
                name,
                type: parentId ? "SUB" : "MAIN",
                parentId: parentId ? Number(parentId) : null
            }
        })

        return NextResponse.json({ success: true, category })
    } catch (error) {
        console.error('Failed to update category:', error)
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const categoryId = parseInt(params.id)

        // Delete category and its children (cascade)
        await prisma.category.delete({
            where: { id: categoryId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete category:', error)
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}
