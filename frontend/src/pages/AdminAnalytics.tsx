import { useEffect, useState } from "react";
import api from "../lib/api";

interface Analytics {
    total: number;
    resolved: number;
    escalated: number;
    byDepartment: { department: string; _count: { id: number } }[];
    byCategory: { category: string; _count: { id: number } }[];
    byStatus: { status: string; _count: { id: number } }[];
    avgResolutionHours: number;
    trends: { date: string; count: number }[];
    hotspots: { lat: number; lng: number; count: number; highSeverityCount: number }[];
}

function AdminAnalytics() {
    const [data, setData] = useState<Analytics | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        api
            .get("/admin/analytics")
            .then((res) => setData(res.data))
            .catch(() => setError("Access denied or failed to load"));
    }, []);

    if (error) return <p className="p-6 text-red-600">{error}</p>;
    if (!data) return <p className="p-6">Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Analytics</h1>

            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow text-center">
                    <div className="text-3xl font-bold">{data.total}</div>
                    <div className="text-sm text-gray-500">Total Complaints</div>
                </div>
                <div className="bg-white p-4 rounded shadow text-center">
                    <div className="text-3xl font-bold text-green-600">{data.resolved}</div>
                    <div className="text-sm text-gray-500">Resolved</div>
                </div>
                <div className="bg-white p-4 rounded shadow text-center">
                    <div className="text-3xl font-bold text-red-600">{data.escalated}</div>
                    <div className="text-sm text-gray-500">Escalated</div>
                </div>
                <div className="bg-white p-4 rounded shadow text-center">
                    <div className="text-3xl font-bold text-blue-600">{data.avgResolutionHours.toFixed(1)}h</div>
                    <div className="text-sm text-gray-500">Avg Resolution Time</div>
                </div>
            </div>
            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="font-semibold mb-3">Complaint Trends (Last 14 Days)</h2>
                <div className="flex items-end gap-2 h-32">
                    {data.trends.map((t) => (
                        <div key={t.date} className="flex flex-col items-center flex-1">
                            <div
                                className="bg-blue-600 w-full rounded-t"
                                style={{ height: `${Math.max(t.count * 20, 4)}px` }}
                            ></div>
                            <span className="text-[10px] text-gray-500 mt-1">{t.date.slice(5)}</span>
                            <span className="text-xs font-semibold">{t.count}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="font-semibold mb-3">High-Priority Areas</h2>
                <div className="space-y-2">
                    {data.hotspots.map((h, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b pb-2">
                            <span>{h.lat.toFixed(2)}, {h.lng.toFixed(2)}</span>
                            <span className="text-gray-500">{h.count} complaints</span>
                            {h.highSeverityCount > 0 && (
                                <span className="text-red-600 font-semibold">{h.highSeverityCount} high severity</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-semibold mb-2">By Department</h2>
                    {data.byDepartment.map((d) => (
                        <div key={d.department} className="flex justify-between text-sm py-1">
                            <span>{d.department}</span>
                            <span>{d._count.id}</span>
                        </div>
                    ))}
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-semibold mb-2">By Category</h2>
                    {data.byCategory.map((c) => (
                        <div key={c.category} className="flex justify-between text-sm py-1">
                            <span>{c.category}</span>
                            <span>{c._count.id}</span>
                        </div>
                    ))}
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-semibold mb-2">By Status</h2>
                    {data.byStatus.map((s) => (
                        <div key={s.status} className="flex justify-between text-sm py-1">
                            <span>{s.status}</span>
                            <span>{s._count.id}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminAnalytics;