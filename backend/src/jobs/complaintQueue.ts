import { Queue } from "bullmq";
import connection from "../utils/redis";

export const complaintQueue = new Queue("complaint-processing", { connection });