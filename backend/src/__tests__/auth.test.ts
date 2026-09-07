import request from "supertest";
import app from "../app";
import prisma from "../prisma";

const testEmail = `test_${Date.now()}@example.com`;

afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
});

describe("Auth flow", () => {
    it("registers a new user", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ email: testEmail, password: "testpass123", name: "Test User" });

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(testEmail);
    });

    it("rejects duplicate registration", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ email: testEmail, password: "testpass123", name: "Test User" });

        expect(res.status).toBe(500); // Prisma unique constraint error, currently unhandled
    });

    it("logs in with correct credentials", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email: testEmail, password: "testpass123" });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it("rejects login with wrong password", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email: testEmail, password: "wrongpassword" });

        expect(res.status).toBe(401);
    });
});