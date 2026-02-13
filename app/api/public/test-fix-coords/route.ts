import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Find businesses with missing coordinates (0 or null)
        const badBusinesses = await prisma.business.findMany({
            where: {
                OR: [
                    { latitude: 0 },
                    { latitude: null },
                    { longitude: 0 },
                    { longitude: null }
                ]
            }
        });

        // Update them to Geneva (near user) for testing purposes
        const updates = badBusinesses.map(b =>
            prisma.business.update({
                where: { id: b.id },
                data: {
                    latitude: 46.2044 + (Math.random() * 0.01), // Add slight random offset
                    longitude: 6.1432 + (Math.random() * 0.01)
                }
            })
        );

        await Promise.all(updates);

        return NextResponse.json({
            success: true,
            fixedCount: updates.length,
            names: badBusinesses.map(b => b.businessName)
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
