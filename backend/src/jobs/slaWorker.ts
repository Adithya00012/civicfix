import { Worker } from "bullmq";
import prisma from "../prisma";

const worker = new Worker(
    "sla-check",
    async () => {
        const now = new Date();

        const breached = await prisma.complaint.findMany({
            where: {
                slaDeadline: { lt: now },
                escalated: false,
                status: { notIn: ["Resolved"] },
            },
        });

        for (const complaint of breached) {
            await prisma.complaint.update({
                where: { id: complaint.id },
                data: { escalated: true },
            });
            console.log(`Escalated complaint: ${complaint.title} (${complaint.id})`);
        }

        console.log(`SLA check complete. ${breached.length} complaints escalated.`);
    },
    { connection: { host: "localhost", port: 6379 } }
);

worker.on("failed", (job, err) => {
    console.error(`SLA job failed:`, err);
});

export default worker;