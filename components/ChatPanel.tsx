import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Loader2, Sparkles, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ChatMessage, Note, SelectionData } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import ChatBubble from './ChatBubble';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeNote: Note | null;
  selectedText: SelectionData | null;
  onUpdateChat: (noteId: string, messages: ChatMessage[]) => void;
  onSpeak: (text: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, activeNote, selectedText, onUpdateChat, onSpeak }) => {
  const { getAccentColorClass } = useTheme();
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const accentText = getAccentColorClass('text');
  const accentBg = getAccentColorClass('bg');

  const messages = activeNote?.chatHistory || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !image) || isThinking || !activeNote) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      image: image || undefined,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    onUpdateChat(activeNote.id, newHistory);
    
    setInput('');
    setImage(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsThinking(true);

    const noteContext = `Title: ${activeNote.title}\nContent:\n${activeNote.content}`;
    const selectionContext = selectedText ? selectedText.text : '';

    const responseText = await sendMessageToGemini(
      userMsg.text,
      newHistory,
      userMsg.image || null,
      noteContext,
      selectionContext
    );

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now(),
    };

    onUpdateChat(activeNote.id, [...newHistory, botMsg]);
    setIsThinking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const panelClasses = `
    fixed inset-y-0 right-0 z-30 w-full sm:w-[400px] bg-white dark:bg-black
    border-l border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
  `;

  return (
    <aside className={panelClasses}>
      {/* Header */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Sparkles className={`w-5 h-5 ${accentText}`} />
          AI Teacher
        </h2>
        <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800">
        {!activeNote ? (
             <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                <p>Please select a note to start a chat.</p>
             </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 dark:text-gray-600 opacity-70">
            <div className={`w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4 transform rotate-3`}>
                <Sparkles className={`w-6 h-6 ${accentText}`} />
            </div>
            <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Teacher Assistant</h3>
            <p className="text-sm max-w-[240px]">
              Ask questions about your note, solve math problems, or generate summaries.
            </p>
          </div>
        ) : (
          messages.map(msg => <ChatBubble key={msg.id} message={msg} onSpeak={onSpeak} />)
        )}
        
        {isThinking && (
          <div className="flex justify-start mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-900 rounded-2xl rounded-tl-none px-4 py-3">
                <Loader2 className={`w-4 h-4 animate-spin ${accentText}`} />
                <span className="text-sm text-gray-500 font-medium">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-black shrink-0">
        {image && (
          <div className="relative inline-block mb-3 animate-in fade-in zoom-in duration-200">
            <img src={image} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm" />
            <button 
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 hover:bg-black shadow-md border border-white dark:border-gray-800"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {selectedText && (
             <div className="mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2">
                 <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider shrink-0">Context</span>
                    <span className="text-xs text-blue-700 dark:text-blue-300 truncate">
                        "{selectedText.text.substring(0, 40)}..."
                    </span>
                 </div>
                 <button onClick={() => {}} className="text-blue-400 hover:text-blue-600"><X className="w-3 h-3"/></button>
             </div>
        )}
        
        <div className="relative flex items-end gap-2 bg-gray-100 dark:bg-gray-900 rounded-[26px] p-1.5 border border-transparent focus-within:border-gray-300 dark:focus-within:border-gray-700 transition-all shadow-sm">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleImageUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors hover:bg-gray-200 dark:hover:bg-gray-800"
            title="Upload Image"
          >
            {image ? <span className={`block w-2.5 h-2.5 rounded-full ${accentBg}`} /> : <Plus className="w-5 h-5" />}
          </button>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[24px] py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
            rows={1}
            disabled={!activeNote}
          />
          
          <button 
            onClick={handleSend}
            disabled={(!input.trim() && !image) || isThinking || !activeNote}
            className={`p-2.5 rounded-full transition-all duration-200 
                ${(!input.trim() && !image) || isThinking || !activeNote
                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                    : `${accentBg} text-white hover:opacity-90 shadow-md transform hover:scale-105 active:scale-95`
                }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-gray-300 dark:text-gray-700">AI can make mistakes.</p>
        </div>
      </div>
    </aside>
  );
};

export default ChatPanel;