import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    console.log("🚀 [API] /student/upload-id started...");

    try {
        const formData = await req.formData();
        console.log("📂 FormData Received Keys:", Array.from(formData.keys()));

        const idImage = formData.get('idImage') as File | null;
        const email = formData.get('email') as string;

        console.log("📧 Email:", email);
        console.log("🖼️ File:", idImage ? `Name: ${idImage.name}, Size: ${idImage.size}, Type: ${idImage.type}` : "NULL");

        if (!idImage || !email) {
            console.error("❌ Missing file or email");
            return NextResponse.json({ error: "Missing file or email" }, { status: 400 });
        }

        // Verify user exists
        const user = await prisma.student.findUnique({ where: { email } });
        if (!user) {
            console.error("❌ User not found:", email);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Process File Upload
        console.log("🔄 Processing buffer...");
        const bytes = await idImage.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const filename = `id_${timestamp}_${idImage.name.replace(/\s+/g, '_')}`; // Sanitize filename
        const filepath = path.join(process.cwd(), 'public', 'uploads', 'ids', filename);
        console.log("💾 Saving to:", filepath);

        // Create directory if it doesn't exist
        const dir = path.dirname(filepath);
        await mkdir(dir, { recursive: true });

        // Save file
        await writeFile(filepath, buffer);
        console.log("✅ File written successfully");

        const idCardUrl = `/uploads/ids/${filename}`;

        console.log("✅ [API] ID Card uploaded:", idCardUrl);

        // Update User in DB
        const updatedUser = await prisma.student.update({
            where: { email },
            data: {
                idCardUrl: idCardUrl,
                isVerified: false
            }
        });

        return NextResponse.json({
            success: true,
            message: "ID uploaded successfully",
            user: updatedUser
        });

    } catch (error: any) {
        console.error("❌ [API] Upload Error Stack:", error.stack);
        console.error("❌ [API] Upload Error Message:", error.message);
        return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
    }
}
