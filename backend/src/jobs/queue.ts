import { Queue } from "bullmq";
import connection from "../utils/redis";

export const slaQueue = new Queue("sla-check", { connection });