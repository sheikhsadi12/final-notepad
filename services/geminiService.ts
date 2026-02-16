import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    // We don't send the entire chat history as 'contents' to generateContent in a stateless way usually 
    // unless we use the ChatSession. For simplicity and context control, we'll use generateContent 
    // and just append relevant history or rely on the single turn with heavy context for this MVP.
    // However, to make it "Smart", let's include the last few turns if needed, but for now, 
    // we'll treat each request as a standalone query enriched with the full Note Context.
    
    const parts: any[] = [];
    
    if (imageBase64) {
      // Remove data URL prefix if present for the API call if needed, 
      // but the SDK usually handles raw base64 data in inlineData.
      // The format expected is just the base64 string.
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      
      parts.push({
        inlineData: {
          mimeType: "image/jpeg", // Assuming JPEG/PNG, SDK is flexible
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
