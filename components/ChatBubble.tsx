import React from 'react';
import { Copy, Bot, User, Check, Speaker } from 'lucide-react';
import { ChatMessage } from '../types';
import { useTheme } from '../context/ThemeContext';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatBubbleProps {
  message: ChatMessage;
  onSpeak: (text: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onSpeak }) => {
  const { getAccentColorClass } = useTheme();
  const [copied, setCopied] = React.useState(false);

  const isUser = message.role === 'user';
  const accentBg = getAccentColorClass('bg');
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[85%] md:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
            w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1
            ${isUser ? 'bg-gray-200 dark:bg-gray-700' : `${accentBg} text-white`}
        `}>
            {isUser ? <User className="w-5 h-5 text-gray-500 dark:text-gray-300" /> : <Bot className="w-5 h-5" />}
        </div>

        {/* Bubble */}
        <div className={`
            relative p-4 rounded-2xl shadow-sm border
            ${isUser 
                ? `bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-tr-none` 
                : `bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none`
            }
        `}>
            {/* Image Attachment */}
            {message.image && (
                <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={message.image} alt="Uploaded context" className="max-w-full h-auto max-h-48 object-cover" />
                </div>
            )}

            {/* Text Content */}
            <MarkdownRenderer content={message.text} />

            {/* Footer Actions (Timestamp + Copy + Speak) */}
            <div className={`flex items-center gap-2 mt-2 ${isUser ? 'justify-end' : 'justify-between'}`}>
                 <span className="text-[10px] text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>

                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isUser && (
                        <button 
                            onClick={() => onSpeak(message.text)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            title="Read Aloud"
                        >
                            <Speaker className="w-3 h-3" />
                        </button>
                    )}
                     <button 
                        onClick={handleCopy}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title="Copy to clipboard"
                     >
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                     </button>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;