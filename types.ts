export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 string
  timestamp: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  chatHistory: ChatMessage[]; // Persist chat per note
}

export type Theme = 'light' | 'dark';

export type AccentColor = 'emerald' | 'blue' | 'rose';

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  getAccentColorClass: (type: 'text' | 'bg' | 'border' | 'ring' | 'hover-bg' | 'hover-text') => string;
  voice: VoiceName;
  setVoice: (voice: VoiceName) => void;
}

export interface SelectionData {
  text: string;
  start: number;
  end: number;
}
