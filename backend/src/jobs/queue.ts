import { Queue } from "bullmq";

export const slaQueue = new Queue("sla-check", {
    connection: { host: "localhost", port: 6379 },
});