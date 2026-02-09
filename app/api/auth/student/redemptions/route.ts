import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Using shared client

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
        }

        // Fetch redemptions for this student
        // Include deal details to show in History tab
        const redemptions = await prisma.redemption.findMany({
            where: {
                studentId: studentId
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                deal: {
                    select: {
                        id: true,
                        title: true,
                        image: true,
                        discountValue: true,
                        isMultiUse: true,
                        business: {
                            select: {
                                businessName: true,
                                logo: true
                            }
                        }
                    }
                }
            }
        });

        // Fetch Active Vouchers (Prizes won but not used)
        const activeVouchers = await prisma.voucher.findMany({
            where: {
                studentId: studentId,
                isUsed: false,
                // Optional: Check expiry? Or show expired ones too?
                // User said "If they don't use it in 2 weeks, it must automatically say 'Expired'"
                // So we should fetch them and let UI decide or filter out expired ones?
                // Let's fetch all unused vouchers and handle display in UI (or filter here)
                // Better to filter expired ones out of "Active" list, or show them as "Expired"
                // For now, let's just get all unused ones.
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                deal: {
                    select: {
                        id: true,
                        title: true,
                        image: true,
                        business: {
                            select: {
                                businessName: true,
                                logo: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            redemptions,
            activeVouchers // ✅ Return Active Prizes
        });

    } catch (error) {
        console.error("Redemption History Error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
