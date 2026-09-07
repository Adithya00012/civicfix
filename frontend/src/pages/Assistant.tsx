import { useState } from "react";
import api from "../lib/api";

interface Message {
    role: "user" | "assistant";
    text: string;
}

function Assistant() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    async function handleAsk(e: React.FormEvent) {
        e.preventDefault();
        if (!question.trim()) return;

        const userMsg: Message = { role: "user", text: question };
        setMessages((prev) => [...prev, userMsg]);
        setQuestion("");
        setLoading(true);

        try {
            const res = await api.post("/assistant/ask", { question: userMsg.text });
            setMessages((prev) => [...prev, { role: "assistant", text: res.data.answer }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, something went wrong." }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">Municipal Assistant</h1>
            <div className="bg-white w-full max-w-lg rounded shadow flex flex-col h-[500px]">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`p-2 rounded max-w-[80%] text-sm ${m.role === "user"
                                    ? "bg-blue-600 text-white ml-auto"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                        >
                            {m.text}
                        </div>
                    ))}
                    {loading && <div className="text-xs text-gray-400">Thinking...</div>}
                </div>
                <form onSubmit={handleAsk} className="border-t p-3 flex gap-2">
                    <input
                        className="flex-1 border rounded p-2 text-sm"
                        placeholder="Ask about civic policies..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                    <button className="bg-blue-600 text-white px-4 rounded text-sm">Ask</button>
                </form>
            </div>
        </div>
    );
}

export default Assistant;