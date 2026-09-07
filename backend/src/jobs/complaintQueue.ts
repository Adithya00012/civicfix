import { Queue } from "bullmq";

export const complaintQueue = new Queue("complaint-processing", {
    connection: { host: "localhost", port: 6379 },
});