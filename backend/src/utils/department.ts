export function assignDepartment(category: string): string {
    const map: Record<string, string> = {
        road: "Public Works Department",
        garbage: "Sanitation Department",
        streetlight: "Electrical Department",
        water: "Water Board",
        other: "General Complaints",
    };
    return map[category] || "General Complaints";
}