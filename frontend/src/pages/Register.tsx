import { useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await api.post("/auth/register", { email, password, name });
            localStorage.setItem("token", res.data.token);
            setMessage(`Registered: ${res.data.email}`);
            setTimeout(() => navigate("/"), 1500);
        } catch (err) {
            setMessage("Registration failed");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80 space-y-4">
                <h1 className="text-xl font-bold">Register</h1>
                <input
                    className="w-full border p-2 rounded"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    className="w-full border p-2 rounded"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className="w-full border p-2 rounded"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="w-full bg-blue-600 text-white p-2 rounded">
                    Register
                </button>
                {message && <p className="text-sm text-gray-600">{message}</p>}
            </form>
        </div>
    );
}

export default Register;