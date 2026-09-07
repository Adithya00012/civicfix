export function calculateSlaDeadline(severity: string): Date {
    const now = new Date();
    const hours = severity === "high" ? 24 : severity === "medium" ? 72 : 168;
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
}