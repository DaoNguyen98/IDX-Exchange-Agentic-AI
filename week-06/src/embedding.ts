import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function getEmbedding(text: string): Promise<number[]> {
  const cleaned = text.replace(/\n/g, " ").trim();

  if (!cleaned) {
    throw new Error("Cannot create embedding for empty text.");
  }

  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: cleaned,
  });

  const values = result.embeddings?.[0]?.values;

  if (!values) {
    throw new Error("Gemini did not return an embedding.");
  }

  return values;
}