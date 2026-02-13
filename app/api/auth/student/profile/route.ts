import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'student-life-secret';

export async function PATCH(req: Request) {
    try {
        // 1. Verify Auth
        const headersList = await headers();
        const token = headersList.get('authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const studentId = decoded.id;

        // 2. Parse Body
        const body = await req.json();
        console.log("Profile Update Request:", { studentId, body }); // DEBUG LOG
        const { fullName, university } = body;

        // 3. Update Student
        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: {
                fullName: fullName !== undefined ? fullName : undefined,
                university: university !== undefined ? university : undefined,
                profilePicture: body.profilePicture !== undefined ? body.profilePicture : undefined,
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                university: true,
                isVerified: true,
                profilePicture: true,
            }
        });

        console.log("Student Updated:", updatedStudent.profilePicture); // DEBUG LOG

        return NextResponse.json({ success: true, user: updatedStudent });

    } catch (error: any) {
        console.error("Profile update error", error);
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
    }
}
