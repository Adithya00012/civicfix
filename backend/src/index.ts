import "dotenv/config";
import app from "./app";
import { slaQueue } from "./jobs/queue";

const PORT = 5000;

slaQueue.upsertJobScheduler(
    "sla-recurring-check",
    { every: 60000 },
    { name: "check-sla" }
);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});