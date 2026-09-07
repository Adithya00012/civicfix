import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function classifyImage(imageUrl: string) {
    const imageRes = await fetch(imageUrl);
    const imageBuffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `Classify this civic issue image. Respond ONLY with JSON in this exact format, no markdown, no explanation:
{"category": "road" | "garbage" | "streetlight" | "water" | "other", "severity": "low" | "medium" | "high"}`,
                    },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: base64Image,
                        },
                    },
                ],
            },
        ],
    });

    const text = response.text ?? "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
}