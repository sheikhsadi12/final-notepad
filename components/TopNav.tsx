import React from 'react';
import { Menu, Mic, MessageSquare, Speaker } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TopNavProps {
  toggleSidebar: () => void;
  toggleChat: () => void;
  isChatOpen: boolean;
  onSpeak: () => void;
  title?: string;
  isSpeaking?: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ toggleSidebar, toggleChat, isChatOpen, onSpeak, title, isSpeaking }) => {
  const { getAccentColorClass } = useTheme();
  
  const accentText = getAccentColorClass('text');
  const accentBg = getAccentColorClass('bg');

  const NavButton = ({ icon: Icon, label, onClick, active, disabled, loading }: { icon: any, label: string, onClick?: () => void, active?: boolean, disabled?: boolean, loading?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2.5 rounded-lg transition-colors 
        ${active ? `${accentBg} text-white shadow-md` : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={label}
    >
      <Icon className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
    </button>
  );

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 truncate max-w-[200px] sm:max-w-md">
          {title || "Smart Teacher Notepad"}
        </h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        <NavButton 
            icon={Speaker} 
            label="Read Note Aloud" 
            onClick={onSpeak}
            loading={isSpeaking}
        />
        <NavButton icon={Mic} label="Voice Input (Soon)" disabled />
        <NavButton 
            icon={MessageSquare} 
            label="Chat Assistant" 
            onClick={toggleChat}
            active={isChatOpen}
        />
      </div>
    </header>
  );
};

export default TopNav;