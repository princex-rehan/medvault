import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const healthAssistant = {
  chat: async (message: string, history: { role: 'user' | 'model', text: string }[] = []) => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user' as const, parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "You are MedVault AI, a helpful health assistant. You provide clear, concise medical information and guidance. Always remind users that you are an AI and they should consult a real doctor for serious concerns. Keep responses formatted in simple markdown if needed.",
      },
    });
    return response.text;
  }
};
