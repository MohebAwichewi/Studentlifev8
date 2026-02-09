import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

test.describe('OTP Verification Flow', () => {

    test('Full Signup -> OTP -> Verify Cycle', async ({ request }) => {
        const timestamp = Date.now();
        const email = `otp.test.${timestamp}@university.edu`;
        const password = 'TestPassword123!';

        console.log(`Starting test for email: ${email}`);

        // 1. Signup
        const signupResponse = await request.post(`${BASE_URL}/api/auth/student/signup`, {
            multipart: {
                fullName: 'OTP Test Student',
                email: email,
                password: password,
                university: 'Test University',
                dob: '2000-01-01',
                hometown: 'Test City'
            }
        });

        const signupBody = await signupResponse.json();
        console.log('Signup Response:', signupBody);

        expect(signupResponse.status()).toBe(200);
        expect(signupBody.success).toBe(true);

        // 2. Fetch OTP from Database
        // We wait a bit to ensure DB is updated (though await above should be enough)
        const student = await prisma.student.findUnique({
            where: { email }
        });

        expect(student).not.toBeNull();
        expect(student?.otp).toBeTruthy();

        const otp = student?.otp;
        console.log(`Retrieved OTP from DB: ${otp}`);

        // 3. Verify OTP
        const verifyResponse = await request.post(`${BASE_URL}/api/auth/student/verify`, {
            data: {
                email: email,
                code: otp
            }
        });

        const verifyBody = await verifyResponse.json();
        console.log('Verify Response:', verifyBody);

        expect(verifyResponse.status()).toBe(200);
        expect(verifyBody.success).toBe(true);
        expect(verifyBody.studentName).toBe('OTP Test Student');

        // 4. Verify DB state (isVerified should be true, otp should be null)
        const verifiedStudent = await prisma.student.findUnique({
            where: { email }
        });

        expect(verifiedStudent?.isVerified).toBe(true);
        expect(verifiedStudent?.otp).toBeNull();
    });
});
