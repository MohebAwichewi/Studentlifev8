import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { businessId, currentPassword, newPassword } = body;

        if (!businessId || !currentPassword || !newPassword) {
            return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
        }

        // 1. Fetch Business
        const business = await prisma.business.findUnique({
            where: { id: businessId }
        });

        if (!business) {
            return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
        }

        // 2. Verify Current Password
        const isValid = await bcrypt.compare(currentPassword, business.password);
        if (!isValid) {
            return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 401 });
        }

        // 3. Hash New Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Update Password
        await prisma.business.update({
            where: { id: businessId },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.error("Password Update Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
