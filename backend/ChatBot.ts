import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.CHATAI_API_KEY as string);

// 🧠 Define your app context once here
const SYSTEM_CONTEXT = `
You are JanBol AI — an intelligent civic assistant built to help users report, track, 
and understand civic issues in their community. 
Your tone is polite, helpful, and professional. 

You can answer questions about:
- reporting civic issues (like road damage, sanitation, electricity, etc.)
- checking issue status and resolutions
- navigating the JanBol platform (like dashboard, reports, analytics)
- explaining how the civic reporting process works.

If the user asks something unrelated (like entertainment, general chat, etc.),
politely redirect them back to civic issue assistance.

Keep responses short, contextual, and easy to understand.
`;

export async function askGemini(userPrompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Combine system context + user prompt
    const fullPrompt = `${SYSTEM_CONTEXT}\n\nUser: ${userPrompt}\nJanBol AI:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn’t process your request at the moment.";
  }
}
