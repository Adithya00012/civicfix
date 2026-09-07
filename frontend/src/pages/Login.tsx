import { useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import { subscribeToPush } from "../lib/push";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            subscribeToPush();
            setMessage("Login successful");
            setTimeout(() => navigate("/"), 1500);
            setMessage("Login successful");
            setTimeout(() => navigate("/"), 1500);
        } catch (err) {
            setMessage("Login failed");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80 space-y-4">
                <h1 className="text-xl font-bold">Login</h1>
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
                    Login
                </button>
                <a href="http://localhost:5000/auth/google"
                className="block text-center text-sm text-blue-600 pt-2"
>
                Login with Google
            </a>
                {message && <p className="text-sm text-gray-600">{message}</p>}
            </form>
        </div>
    );
}

export default Login;