import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    console.log("🚀 [API] /student/upload-id started...");

    try {
        const formData = await req.formData();
        const idImage = formData.get('idImage') as File | null;
        const email = formData.get('email') as string;

        if (!idImage || !email) {
            return NextResponse.json({ error: "Missing file or email" }, { status: 400 });
        }

        // Verify user exists
        const user = await prisma.student.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check for credentials
        if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY) {
            console.error("❌ Cloudinary credentials missing in .env");
            return NextResponse.json({ error: "Server Configuration Error: Cloudinary keys missing." }, { status: 500 });
        }

        // Convert File to Buffer
        const bytes = await idImage.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using data URI (serverless-compatible)
        console.log("☁️ Uploading to Cloudinary...");

        // Convert buffer to base64 data URI
        const base64Image = buffer.toString('base64');
        const dataURI = `data:${idImage.type || 'image/jpeg'};base64,${base64Image}`;

        // Upload using data URI (no filesystem required)
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
            folder: 'student-life/ids',
            resource_type: 'image',
        });

        const idCardUrl = uploadResult.secure_url;
        console.log("✅ Cloudinary Upload Success:", idCardUrl);

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
        console.error("❌ [API] Upload Error:", error);
        return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
    }
}
