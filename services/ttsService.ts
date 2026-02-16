import { GoogleGenAI } from "@google/genai";
import { VoiceName } from "../types";

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

// PCM to WAV converter
const createWavUrl = (pcmData: Uint8Array, sampleRate: number = 24000): string => {
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * 2; // 16-bit = 2 bytes
  const blockAlign = numChannels * 2;
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // PCM Data
  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

export const fetchTTS = async (text: string, voice: VoiceName): Promise<string | null> => {
  try {
    const ai = getAiClient();

    // Prepend instruction to text instead of using systemInstruction in config
    const instruction = "Read this naturally as a teacher. Smooth flow between English and Bangla. No robotic pauses. ";
    const fullText = instruction + text;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        role: "user",
        parts: [{ text: fullText }]
      },
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      console.warn("No audio data returned from Gemini.");
      return null;
    }

    // Decode Base64
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert to WAV URL for easy playback
    return createWavUrl(bytes, 24000);

  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};