import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Lazy initialization to prevent crash on module load if process is undefined
let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    // Safe access to process.env
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

const SYSTEM_INSTRUCTION = `You are an expert Teacher. You are fluent in English and Bangla. 
Answer questions clearly, use examples, and provide step-by-step explanations. 
If the user provides a note context, base your answers on that note.
Be concise but thorough. Use Markdown for formatting.`;

export const sendMessageToGemini = async (
  currentMessage: string,
  history: ChatMessage[],
  imageBase64: string | null,
  noteContext: string,
  selectedText: string
): Promise<string> => {
  try {
    const ai = getAiClient();

    // 1. Construct the Prompt with Context
    let fullPrompt = "";
    
    if (noteContext) {
      fullPrompt += `[CONTEXT - CURRENT NOTE CONTENT]:\n${noteContext}\n\n`;
    }
    
    if (selectedText) {
      fullPrompt += `[CONTEXT - USER SELECTED TEXT]:\n${selectedText}\n\n`;
    }

    fullPrompt += `[USER QUESTION]:\n${currentMessage}`;

    // 2. Prepare Contents
    const parts: any[] = [];
    
    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    }

    parts.push({ text: fullPrompt });

    // 3. Call API
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "I couldn't generate a response. Please try again.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error connecting to the AI teacher. Please check your connection.";
  }
};