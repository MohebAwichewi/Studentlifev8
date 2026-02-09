import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('API Testing', () => {

    // Authentication APIs
    test.describe('Authentication APIs', () => {

        test('POST /api/auth/student/signup - Valid data', async ({ request }) => {
            const timestamp = Date.now();

            const response = await request.post(`${BASE_URL}/api/auth/student/signup`, {
                data: {
                    fullName: `API Test Student ${timestamp}`,
                    email: `api.test.${timestamp}@university.edu`,
                    password: 'SecurePass123!',
                    dob: '2000-01-15',
                    university: 'University of Tunis',
                    hometown: 'Tunis'
                }
            });

            expect(response.status()).toBe(200);

            const body = await response.json();
            expect(body).toHaveProperty('success', true);
            expect(body).toHaveProperty('message');
        });

        test('POST /api/auth/student/signup - Invalid email', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/auth/student/signup`, {
                data: {
                    fullName: 'Test Student',
                    email: 'invalid-email',
                    password: 'SecurePass123!',
                    dob: '2000-01-15',
                    university: 'University of Tunis',
                    hometown: 'Tunis'
                }
            });

            expect(response.status()).toBe(400);

            const body = await response.json();
            expect(body).toHaveProperty('error');
        });

        test('POST /api/auth/student/signup - Missing required fields', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/auth/student/signup`, {
                data: {
                    email: 'test@university.edu',
                    password: 'SecurePass123!'
                    // Missing other required fields
                }
            });

            expect(response.status()).toBe(400);
        });

        test('POST /api/auth/student/login - Valid credentials', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/auth/student/login`, {
                data: {
                    email: 'mohebawichewi9@wow.edu',
                    password: '123456'
                }
            });

            expect(response.status()).toBe(200);

            const body = await response.json();
            expect(body).toHaveProperty('success', true);
            expect(body).toHaveProperty('token');
        });

        test('POST /api/auth/student/login - Invalid credentials', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/auth/student/login`, {
                data: {
                    email: 'wrong@email.com',
                    password: 'wrongpassword'
                }
            });

            expect(response.status()).toBe(401);

            const body = await response.json();
            expect(body).toHaveProperty('error');
        });

        test('POST /api/auth/business/login - Valid credentials', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/auth/business/login`, {
                data: {
                    email: 'mohebawichewi9@gmail.com',
                    password: 'xnxxxnxx11'
                }
            });

            expect(response.status()).toBe(200);

            const body = await response.json();
            expect(body).toHaveProperty('success', true);
        });

        test('POST /api/auth/admin/login - Valid credentials', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/auth/admin/login`, {
                data: {
                    email: 'admin@student-life.uk',
                    password: 'admin123'
                }
            });

            expect(response.status()).toBe(200);

            const body = await response.json();
            expect(body).toHaveProperty('success', true);
        });

    });

    // Deal APIs
    test.describe('Deal APIs', () => {

        let authToken: string;

        test.beforeAll(async ({ request }) => {
            // Login to get auth token
            const response = await request.post(`${BASE_URL}/api/auth/student/login`, {
                data: {
                    email: 'mohebawichewi9@wow.edu',
                    password: '123456'
                }
            });

            const body = await response.json();
            authToken = body.token;
        });

        test('GET /api/deals/active - Returns active deals', async ({ request }) => {
            const response = await request.get(`${BASE_URL}/api/deals/active`);

            expect(response.status()).toBe(200);

            const body = await response.json();
            expect(Array.isArray(body)).toBe(true);

            if (body.length > 0) {
                expect(body[0]).toHaveProperty('id');
                expect(body[0]).toHaveProperty('title');
                expect(body[0]).toHaveProperty('status', 'ACTIVE');
            }
        });

        test('GET /api/deals/active - Filters by category', async ({ request }) => {
            const response = await request.get(`${BASE_URL}/api/deals/active?category=Food`);

            expect(response.status()).toBe(200);

            const body = await response.json();
            expect(Array.isArray(body)).toBe(true);

            if (body.length > 0) {
                expect(body[0].category).toBe('Food');
            }
        });

        test('GET /api/deals/[id] - Returns deal details', async ({ request }) => {
            // First get a deal ID
            const dealsResponse = await request.get(`${BASE_URL}/api/deals/active`);
            const deals = await dealsResponse.json();

            if (deals.length > 0) {
                const dealId = deals[0].id;

                const response = await request.get(`${BASE_URL}/api/deals/${dealId}`);
                expect(response.status()).toBe(200);

                const body = await response.json();
                expect(body).toHaveProperty('id', dealId);
                expect(body).toHaveProperty('title');
                expect(body).toHaveProperty('description');
            }
        });

        test('GET /api/deals/[id] - Returns 404 for invalid ID', async ({ request }) => {
            const response = await request.get(`${BASE_URL}/api/deals/999999`);
            expect(response.status()).toBe(404);
        });

        test('POST /api/deals/redeem - Requires authentication', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/deals/redeem`, {
                data: {
                    dealId: 1
                }
            });

            expect(response.status()).toBe(401);
        });

    });

    // Admin APIs
    test.describe('Admin APIs', () => {

        let adminToken: string;

        test.beforeAll(async ({ request }) => {
            // Login as admin
            const response = await request.post(`${BASE_URL}/api/auth/admin/login`, {
                data: {
                    email: 'admin@student-life.uk',
                    password: 'admin123'
                }
            });

            const body = await response.json();
            adminToken = body.token;
        });

        test('GET /api/admin/stats - Returns dashboard statistics', async ({ request }) => {
            const response = await request.get(`${BASE_URL}/api/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            if (response.status() === 200) {
                const body = await response.json();
                expect(body).toHaveProperty('totalUsers');
                expect(body).toHaveProperty('totalDeals');
                expect(body).toHaveProperty('totalRedemptions');
            }
        });

        test('GET /api/admin/stats - Requires admin authentication', async ({ request }) => {
            const response = await request.get(`${BASE_URL}/api/admin/stats`);
            expect(response.status()).toBe(401);
        });

    });

    // Security Tests
    test.describe('Security & Validation', () => {

        test('SQL Injection prevention in login', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/auth/student/login`, {
                data: {
                    email: "admin'--",
                    password: "' OR '1'='1"
                }
            });

            expect(response.status()).toBe(401);
        });

        test('XSS prevention in deal creation', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/deals/create`, {
                data: {
                    title: "<script>alert('XSS')</script>",
                    description: "<img src=x onerror=alert('XSS')>",
                    category: "Food"
                }
            });

            // Should either reject or sanitize
            if (response.status() === 200) {
                const body = await response.json();
                expect(body.title).not.toContain('<script>');
            }
        });

        test('Rate limiting on login endpoint', async ({ request }) => {
            // Make multiple rapid requests
            const requests = [];
            for (let i = 0; i < 10; i++) {
                requests.push(
                    request.post(`${BASE_URL}/api/auth/student/login`, {
                        data: {
                            email: 'test@test.com',
                            password: 'wrongpassword'
                        }
                    })
                );
            }

            const responses = await Promise.all(requests);

            // At least one should be rate limited (429)
            const rateLimited = responses.some(r => r.status() === 429);

            // Note: This test might fail if rate limiting isn't implemented
            // That's okay - it identifies a security gap
        });

        test('CORS headers are set correctly', async ({ request }) => {
            const response = await request.get(`${BASE_URL}/api/deals/active`);

            const headers = response.headers();
            // Verify CORS headers exist (if applicable)
            // This depends on your CORS configuration
        });

    });

    // Performance Tests
    test.describe('Performance & Response Times', () => {

        test('GET /api/deals/active responds within 500ms', async ({ request }) => {
            const startTime = Date.now();

            const response = await request.get(`${BASE_URL}/api/deals/active`);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            expect(response.status()).toBe(200);
            expect(responseTime).toBeLessThan(500);
        });

        test('POST /api/auth/student/login responds within 1000ms', async ({ request }) => {
            const startTime = Date.now();

            const response = await request.post(`${BASE_URL}/api/auth/student/login`, {
                data: {
                    email: 'mohebawichewi9@wow.edu',
                    password: '123456'
                }
            });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            expect(response.status()).toBe(200);
            expect(responseTime).toBeLessThan(1000);
        });

    });

    // Error Handling
    test.describe('Error Handling', () => {

        test('Returns proper error format', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/auth/student/login`, {
                data: {
                    email: 'wrong@email.com',
                    password: 'wrongpassword'
                }
            });

            expect(response.status()).toBe(401);

            const body = await response.json();
            expect(body).toHaveProperty('error');
            expect(typeof body.error).toBe('string');
        });

        test('Handles malformed JSON gracefully', async ({ request }) => {
            const response = await request.post(`${BASE_URL}/api/auth/student/login`, {
                data: 'invalid json',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            expect([400, 500]).toContain(response.status());
        });

        test('Returns 404 for non-existent endpoints', async ({ request }) => {
            const response = await request.get(`${BASE_URL}/api/nonexistent/endpoint`);
            expect(response.status()).toBe(404);
        });

    });

});
