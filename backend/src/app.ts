import cors from "cors";
import "dotenv/config";
import express from "express";
import bcrypt from "bcrypt";
import prisma from "./prisma";
import { signToken } from "./utils/jwt";
import { authMiddleware, AuthRequest } from "./middleware/auth";
import multer from "multer";
import cloudinary from "./utils/cloudinary";
import { getEmbedding, cosineSimilarity } from "./utils/similarity";
import { slaQueue } from "./jobs/queue";
import "./jobs/slaWorker";
import { sendStatusEmail } from "./utils/email";
import session from "express-session";
import passport from "./utils/passport";
import { complaintQueue } from "./jobs/complaintQueue";
import "./jobs/complaintWorker";
import webpush from "./utils/push";

const app = express();
app.use(cors({
    origin: [
        "http://localhost:5173",
        process.env.FRONTEND_URL || "",
    ],
    credentials: true,
}));
app.use(
    session({
        secret: process.env.JWT_SECRET || "dev_secret_change_this",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
const upload = multer({ storage: multer.memoryStorage() });
const PORT = 5000;

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/auth/register", async (req, res) => {
    const { email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { email, password: hashedPassword, name },
    });

    res.json({ id: user.id, email: user.email });
});

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user.id);
    res.json({ id: user.id, email: user.email, token });
});

app.get("/me", authMiddleware, (req: AuthRequest, res) => {
    res.json({ userId: req.userId });
});

app.post("/complaints", authMiddleware, async (req: AuthRequest, res) => {
    const { title, description, category, severity, latitude, longitude, imageUrl } = req.body;

    const complaint = await prisma.complaint.create({
        data: {
            title,
            description,
            category,
            severity,
            latitude,
            longitude,
            imageUrl,
            userId: req.userId!,
        },
    });

    await complaintQueue.add("process-complaint", { complaintId: complaint.id });

    res.json(complaint);
});

app.get("/complaints", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
        prisma.complaint.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.complaint.count(),
    ]);

    res.json({
        complaints,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    });
});

app.get("/admin/analytics", authMiddleware, async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }

    const total = await prisma.complaint.count();
    const resolved = await prisma.complaint.count({ where: { status: "Resolved" } });
    const escalated = await prisma.complaint.count({ where: { escalated: true } });

    const byDepartment = await prisma.complaint.groupBy({
        by: ["department"],
        _count: { id: true },
    });

    const byCategory = await prisma.complaint.groupBy({
        by: ["category"],
        _count: { id: true },
    });

    const byStatus = await prisma.complaint.groupBy({
        by: ["status"],
        _count: { id: true },
    });

    const resolvedComplaints = await prisma.complaint.findMany({
        where: { status: "Resolved", resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
    });

    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
        const totalHours = resolvedComplaints.reduce((sum, c) => {
            const diff = c.resolvedAt!.getTime() - c.createdAt.getTime();
            return sum + diff / (1000 * 60 * 60);
        }, 0);
        avgResolutionHours = totalHours / resolvedComplaints.length;
    }

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentComplaints = await prisma.complaint.findMany({
        where: { createdAt: { gte: fourteenDaysAgo } },
        select: { createdAt: true },
    });

    const trendMap: Record<string, number> = {};
    for (const c of recentComplaints) {
        const day = c.createdAt.toISOString().split("T")[0];
        trendMap[day] = (trendMap[day] || 0) + 1;
    }

    const trends = Object.entries(trendMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    const allComplaints = await prisma.complaint.findMany({
        select: { latitude: true, longitude: true, severity: true },
    });

    const gridMap: Record<string, { lat: number; lng: number; count: number; highSeverityCount: number }> = {};

    for (const c of allComplaints) {
        const gridLat = Math.round(c.latitude * 100) / 100;
        const gridLng = Math.round(c.longitude * 100) / 100;
        const key = `${gridLat},${gridLng}`;

        if (!gridMap[key]) {
            gridMap[key] = { lat: gridLat, lng: gridLng, count: 0, highSeverityCount: 0 };
        }
        gridMap[key].count++;
        if (c.severity === "high") {
            gridMap[key].highSeverityCount++;
        }
    }

    const hotspots = Object.values(gridMap)
        .sort((a, b) => b.highSeverityCount - a.highSeverityCount || b.count - a.count)
        .slice(0, 5);

    res.json({ total, resolved, escalated, avgResolutionHours, trends, hotspots, byDepartment, byCategory, byStatus });
});

app.patch("/complaints/:id/status", authMiddleware, async (req: AuthRequest, res) => {
    const { status } = req.body;
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }

    const updateData: any = { status };
    if (status === "Resolved") {
        updateData.resolvedAt = new Date();
    }

    const complaint = await prisma.complaint.update({
        where: { id },
        data: updateData,
        include: { user: true },
    });

    if (complaint.user.email) {
        sendStatusEmail(complaint.user.email, complaint.title, status);
    }

    if (complaint.user.email) {
        sendStatusEmail(complaint.user.email, complaint.title, status);
    }

    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: complaint.userId },
    });

    console.log(`Found ${subscriptions.length} push subscription(s) for user ${complaint.userId}`);

    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth },
                },
                JSON.stringify({
                    title: "CivicFix Update",
                    body: `Your complaint "${complaint.title}" is now ${status}`,
                })
            );
            console.log("Push notification sent successfully");
        } catch (err) {
            console.error("Push notification failed:", err);
        }
    }

    res.json(complaint);
});

app.delete("/complaints/:id", authMiddleware, async (req: AuthRequest, res) => {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }

    await prisma.complaint.delete({ where: { id } });
    res.json({ success: true });
});

app.post("/upload", authMiddleware, upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
    }

    const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ folder: "civicfix" }, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
            .end(req.file!.buffer);
    });

    res.json(uploadResult);
});

app.post("/assistant/ask", async (req, res) => {
    const { question } = req.body;

    try {
        const questionEmbedding = await getEmbedding(question);

        const allChunks = await prisma.faqChunk.findMany();

        const scored = allChunks.map((chunk) => ({
            content: chunk.content,
            score: cosineSimilarity(questionEmbedding, chunk.embedding),
        }));

        scored.sort((a, b) => b.score - a.score);
        const topChunks = scored.slice(0, 3).map((c) => c.content);

        const context = topChunks.join("\n\n");

        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `You are a helpful municipal assistant. Answer the citizen's question using ONLY the context below. If the answer isn't in the context, say you don't have that information.

Context:
${context}

Question: ${question}`,
                        },
                    ],
                },
            ],
        });

        res.json({ answer: response.text, sources: topChunks });
    } catch (err) {
        console.error("Assistant error:", err);
        res.status(500).json({ error: "Failed to get answer" });
    }
});

app.get("/public/complaints", async (req, res) => {
    const complaints = await prisma.complaint.findMany({
        select: {
            id: true,
            title: true,
            category: true,
            severity: true,
            status: true,
            department: true,
            latitude: true,
            longitude: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
    res.json(complaints);
});

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    (req, res) => {
        const user = req.user as { id: string };
        const token = signToken(user.id);
        res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
    }
);

app.post("/push/subscribe", authMiddleware, async (req: AuthRequest, res) => {
    const { endpoint, keys } = req.body;

    await prisma.pushSubscription.upsert({
        where: { endpoint },
        update: { p256dh: keys.p256dh, auth: keys.auth, userId: req.userId! },
        create: {
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
            userId: req.userId!,
        },
    });

    res.json({ success: true });
});

app.get("/push/vapid-public-key", (req, res) => {
    res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

export default app;