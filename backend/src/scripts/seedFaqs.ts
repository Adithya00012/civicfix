import "dotenv/config";
import prisma from "../prisma";
import { getEmbedding } from "../utils/similarity";

const faqs = [
    "Pothole repairs are typically completed within 7 to 14 days of being reported, depending on severity and department workload.",
    "Garbage collection happens twice a week in residential areas, usually on Monday and Thursday mornings.",
    "Streetlight repairs are prioritized by safety risk. High-severity reports near schools or accident-prone areas are addressed within 48 hours.",
    "Water leak complaints are handled by the Water Board and typically resolved within 3 to 5 business days.",
    "Citizens can escalate unresolved complaints after the SLA deadline passes; the system automatically flags these for supervisor review.",
    "To report a civic issue, citizens must register an account, then submit a complaint with location, category, and severity level.",
    "The municipal corporation does not charge citizens for filing complaints or for standard repair services covered under civic maintenance.",
];

async function seed() {
    for (const content of faqs) {
        const embedding = await getEmbedding(content);
        await prisma.faqChunk.create({
            data: { content, embedding },
        });
        console.log(`Seeded: ${content.slice(0, 50)}...`);
    }
    console.log("Done seeding FAQs.");
}

seed();