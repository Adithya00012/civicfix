import { useEffect, useState } from "react";
import axios from "axios";

interface PublicComplaint {
    id: string;
    title: string;
    category: string;
    severity: string;
    status: string;
    department: string;
    createdAt: string;
}

function PublicTransparency() {
    const [complaints, setComplaints] = useState<PublicComplaint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get("http://localhost:5000/public/complaints")
            .then((res) => {
                setComplaints(res.data);
                setLoading(false);
            });
    }, []);

    if (loading) return <p className="p-6">Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold mb-2">Public Transparency</h1>
            <p className="text-sm text-gray-600 mb-4">
                Live status of civic issues reported across the city. No personal information is shown.
            </p>
            <div className="space-y-2">
                {complaints.map((c) => (
                    <div key={c.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
                        <div>
                            <div className="font-semibold text-sm">{c.title}</div>
                            <div className="text-xs text-gray-500">
                                {c.department} • {c.category} • {c.severity} severity
                            </div>
                        </div>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">{c.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PublicTransparency;