import { useEffect, useState } from "react";
import api from "../lib/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface Complaint {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string;
    status: string;
    createdAt: string;
    latitude: number;
    longitude: number;
    imageUrl: string | null;
    processed: boolean;
}

function Dashboard() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        api.get(`/complaints?page=${page}&limit=5`).then((res) => {
            setComplaints(res.data.complaints);
            setTotalPages(res.data.totalPages);
            setLoading(false);
        });
    }, [page]);

    async function updateStatus(id: string, status: string) {
        try {
            await api.patch(`/complaints/${id}/status`, { status });
            setComplaints((prev) =>
                prev.map((c) => (c.id === id ? { ...c, status } : c))
            );
        } catch (err) {
            alert("Failed to update status (admin only)");
        }
    }

    async function deleteComplaint(id: string) {
        if (!confirm("Delete this complaint?")) return;
        try {
            await api.delete(`/complaints/${id}`);
            setComplaints((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            alert("Failed to delete (admin only)");
        }
    }

    if (loading) return <p className="p-6">Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold mb-4">Reported Issues</h1>
            <div className="mb-6 h-80 rounded overflow-hidden shadow">
                <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    <MarkerClusterGroup
                        singleMarkerMode={true}
                        iconCreateFunction={(cluster : any) => {
                            const count = cluster.getChildCount();
                            return L.divIcon({
                                html: `<div style="background:#2563eb;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:bold;">${count}</div>`,
                                className: "",
                                iconSize: [36, 36],
                            });
                        }}
                    >
                        {complaints.map((c) => (
                            <Marker key={c.id} position={[c.latitude, c.longitude]}>
                                <Popup>
                                    <strong>{c.title}</strong>
                                    <br />
                                    {c.category} • {c.severity}
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>
                </MapContainer>
            </div>
            <div className="space-y-3">
                {complaints.map((c) => (
                    <div key={c.id} className="bg-white p-4 rounded shadow">
                        <div className="flex justify-between">
                            <h2 className="font-semibold">{c.title}</h2>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">{c.status}</span>
                            {!c.processed && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded ml-1">
                                    Analyzing...
                                </span>
                            )}
                        </div>
                        {c.imageUrl && (
                            <img
                                src={c.imageUrl}
                                alt={c.title}
                                onClick={() => setExpandedImage(c.imageUrl)}
                                className="w-full h-40 object-cover rounded my-2 cursor-pointer hover:opacity-90"
                            />
                        )}
                        <p className="text-sm text-gray-600">{c.description}</p>
                        <div className="text-xs text-gray-500 mt-2">
                            {c.category} • {c.severity} severity
                        </div>
                        <select
                            value={c.status}
                            onChange={(e) => updateStatus(c.id, e.target.value)}
                            className="mt-2 text-xs border rounded p-1"
                        >
                            <option value="Reported">Reported</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                        <button
                            onClick={() => deleteComplaint(c.id)}
                            className="ml-2 text-xs text-red-600"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex justify-center gap-2 mt-4">
                <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-white rounded shadow disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="px-3 py-1 text-sm">Page {page} of {totalPages}</span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-white rounded shadow disabled:opacity-50"
                >
                    Next
                </button>
            </div>
            {expandedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setExpandedImage(null)}
                >
                    <img
                        src={expandedImage}
                        alt="Full view"
                        className="max-w-full max-h-full rounded"
                    />
                </div>
            )}
        </div>
    );
}

export default Dashboard;