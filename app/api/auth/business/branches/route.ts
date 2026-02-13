import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List Branches for a Business
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json({ success: false, error: "Business ID required" }, { status: 400 });
        }

        const branches = await prisma.location.findMany({
            where: { businessId },
            include: {
                _count: {
                    select: { deals: true }
                },
                deals: {
                    select: { id: true } // Return IDs of assigned deals
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, branches });
    } catch (error) {
        console.error("Fetch Branches Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create New Branch
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { businessId, name, address, phone, googleMapUrl, assignedDealIds } = body;

        if (!businessId || !name || !address) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Prepare deal connections if any
        const dealConnects = (assignedDealIds || []).map((id: number) => ({ id }));

        const newBranch = await prisma.location.create({
            data: {
                businessId,
                name,
                address,
                // lat/lng would typically come from geocoding, defaulting for now as schema requires them
                lat: 0,
                lng: 0,
                deals: {
                    connect: dealConnects
                }
            },
            include: {
                _count: { select: { deals: true } },
                deals: { select: { id: true } }
            }
        });

        return NextResponse.json({ success: true, branch: newBranch });

    } catch (error) {
        console.error("Create Branch Error:", error);
        return NextResponse.json({ success: false, error: "Failed to create branch" }, { status: 500 });
    }
}

// PUT: Update Branch & Deal Assignment
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, name, address, assignedDealIds } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: "Branch ID required" }, { status: 400 });
        }

        // Prepare deal connections
        // First, we need to disconnect all deals not in the new list, then connect new ones.
        // However, Prisma 'set' is cleaner for many-to-many replacements.
        const dealConnects = (assignedDealIds || []).map((dealId: number) => ({ id: dealId }));

        const updatedBranch = await prisma.location.update({
            where: { id },
            data: {
                name,
                address,
                deals: {
                    set: dealConnects // Key Logic for "Assign Deals" (Replaces existing list)
                }
            },
            include: {
                _count: { select: { deals: true } },
                deals: { select: { id: true } }
            }
        });

        return NextResponse.json({ success: true, branch: updatedBranch });

    } catch (error) {
        console.error("Update Branch Error:", error);
        return NextResponse.json({ success: false, error: "Failed to update branch" }, { status: 500 });
    }
}

// DELETE: Remove Branch
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: "Branch ID required" }, { status: 400 });
        }

        await prisma.location.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true, message: "Branch deleted" });

    } catch (error) {
        console.error("Delete Branch Error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete branch" }, { status: 500 });
    }
}
