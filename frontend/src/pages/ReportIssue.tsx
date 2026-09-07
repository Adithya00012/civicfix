import { useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

function ReportIssue() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("road");
    const [severity, setSeverity] = useState("medium");
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [message, setMessage] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const [customCategory, setCustomCategory] = useState("");   

    function getLocation() {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            () => {
                setMessage("Could not get location");
            }
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!location) {
            setMessage("Please get your location first");
            return;
        }

        setSubmitting(true);
        try {
            let imageUrl = "";

            if (imageFile) {
                const formData = new FormData();
                formData.append("image", imageFile);
                const uploadRes = await api.post("/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                imageUrl = uploadRes.data.secure_url;
            }

            const finalCategory = category === "other" && customCategory.trim() ? customCategory.trim() : category;

            const res = await api.post("/complaints", {
                title,
                description,
                category: finalCategory,
                severity,
                latitude: location.lat,
                longitude: location.lng,
                imageUrl,
            });

            setMessage("Complaint submitted! We're analyzing it now — check the dashboard shortly.");
            setTimeout(() => navigate("/"), 1500);
        } catch (err) {
            setMessage("Submission failed");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-96 space-y-4">
                <h1 className="text-xl font-bold">Report an Issue</h1>
                <input
                    className="w-full border p-2 rounded"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    className="w-full border p-2 rounded"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <select
                    className="w-full border p-2 rounded"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="road">Road / Pothole</option>
                    <option value="garbage">Garbage</option>
                    <option value="streetlight">Streetlight</option>
                    <option value="water">Water Leak</option>
                    <option value="other">Other</option>
                </select>
                {category === "other" && (
                    <input
                        className="w-full border p-2 rounded"
                        placeholder="Please specify the issue type"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                    />
                )}
                <select
                    className="w-full border p-2 rounded"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full"
                />
                <button
                    type="button"
                    onClick={getLocation}
                    className="w-full bg-gray-200 p-2 rounded"
                >
                    {location ? `Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Get Location"}
                </button>
                <button
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
                >
                    {submitting ? "Submitting..." : "Submit"}
                </button>
                {message && <p className="text-sm text-gray-600">{message}</p>}
            </form>
        </div>
    );
}

export default ReportIssue;