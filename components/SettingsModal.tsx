import React from 'react';
import { Moon, Sun, Settings, X, Mic } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AccentColor, VoiceName } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme, accent, setAccent, getAccentColorClass, voice, setVoice } = useTheme();

  if (!isOpen) return null;

  const accentText = getAccentColorClass('text');
  const accentBorder = getAccentColorClass('border');

  const voices: VoiceName[] = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
         <div className="p-6">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings className={`w-5 h-5 ${accentText}`} />
                  Settings
               </h2>
               <button 
                  onClick={onClose}
                  className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>

            <div className="space-y-6">
               {/* Theme Section */}
               <div>
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Theme Preference</label>
                   <button 
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                   >
                       <span className="font-medium text-gray-700 dark:text-gray-200">
                           {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                       </span>
                       {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                   </button>
               </div>

               {/* Voice Section */}
               <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">AI Voice</label>
                  <div className="grid grid-cols-2 gap-2">
                      {voices.map((v) => (
                          <button
                            key={v}
                            onClick={() => setVoice(v)}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border
                                ${voice === v 
                                    ? `bg-gray-100 dark:bg-gray-800 ${accentText} ${accentBorder}` 
                                    : 'bg-transparent border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}
                            `}
                          >
                            <Mic className="w-3.5 h-3.5" />
                            {v}
                          </button>
                      ))}
                  </div>
               </div>

               {/* Accent Section */}
               <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Accent Color</label>
                  <div className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 justify-center">
                      {(['emerald', 'blue', 'rose'] as AccentColor[]).map((c) => (
                          <button
                              key={c}
                              onClick={() => setAccent(c)}
                              className={`
                                  group relative w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 focus:outline-none ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900
                                  ${c === 'emerald' ? 'bg-emerald-500' : c === 'blue' ? 'bg-blue-500' : 'bg-rose-500'}
                                  ${accent === c ? 'ring-gray-400 dark:ring-gray-500 scale-110' : 'ring-transparent'}
                              `}
                              title={c.charAt(0).toUpperCase() + c.slice(1)}
                          >
                              {accent === c && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />}
                          </button>
                      ))}
                  </div>
               </div>
            </div>
         </div>
         
         {/* Footer */}
         <div className="bg-gray-50 dark:bg-gray-800/50 p-4 text-center border-t border-gray-200 dark:border-gray-800">
             <p className="text-xs text-gray-400">Smart Teacher Notepad v1.1</p>
         </div>
      </div>
    </div>
  );
};

export default SettingsModal;