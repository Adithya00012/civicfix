import { Worker } from "bullmq";
import prisma from "../prisma";
import { classifyImage } from "../utils/classify";
import { getDistanceMeters } from "../utils/distance";
import { getEmbedding, cosineSimilarity } from "../utils/similarity";
import { assignDepartment } from "../utils/department";
import { calculateSlaDeadline } from "../utils/sla";
import { getImageHash, compareHashes } from "../utils/imageHash";   

const worker = new Worker(
    "complaint-processing",
    async (job) => {
        const { complaintId } = job.data;

        const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
        if (!complaint) return;

        let category = complaint.category;
        let severity = complaint.severity;

        if (complaint.imageUrl) {
            try {
                const result = await classifyImage(complaint.imageUrl);
                // Respect user's chosen category always; AI only refines severity
                severity = result.severity;
            } catch (err) {
                console.error("Classification failed, keeping provided values", err);
            }
        }

        let isDuplicate = false;
        let duplicateOfId: string | null = null;
        let imageHash: string | null = null;

        if (complaint.imageUrl) {
            try {
                imageHash = await getImageHash(complaint.imageUrl);
            } catch (err) {
                console.error("Image hashing failed", err);
            }
        }

        try {
            const nearbyComplaints = await prisma.complaint.findMany({
                where: { category, id: { not: complaintId } },
            });

            const candidates = nearbyComplaints.filter(
                (c) => getDistanceMeters(complaint.latitude, complaint.longitude, c.latitude, c.longitude) < 200
            );

            if (candidates.length > 0) {
                const newEmbedding = await getEmbedding(`${complaint.title} ${complaint.description}`);

                for (const c of candidates) {
                    const existingEmbedding = await getEmbedding(`${c.title} ${c.description}`);
                    const textSimilarity = cosineSimilarity(newEmbedding, existingEmbedding);

                    let imageSimilarity = 0;
                    if (imageHash && c.imageHash) {
                        imageSimilarity = compareHashes(imageHash, c.imageHash) / 100;
                    }

                    // Duplicate if text is very similar, OR both text and image are moderately similar
                    if (textSimilarity > 0.85 || imageSimilarity > 0.95 || (textSimilarity > 0.5 && imageSimilarity > 0.8)) {
                        isDuplicate = true;
                        duplicateOfId = c.id;
                        break;
                    }
                }
            }
        } catch (err) {
            console.error("Duplicate check failed", err);
        }

        const department = assignDepartment(category);
        const slaDeadline = calculateSlaDeadline(severity);

        await prisma.complaint.update({
            where: { id: complaintId },
            data: {
                category,
                severity,
                department,
                slaDeadline,
                isDuplicate,
                duplicateOfId,
                imageHash,
                processed: true,
            },
        });

        console.log(`Processed complaint: ${complaintId}`);
    },
    { connection: { host: "localhost", port: 6379 } }
);

worker.on("failed", (job, err) => {
    console.error("Complaint processing job failed:", err);
});

export default worker;