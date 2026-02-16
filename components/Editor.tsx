import React, { useState, useEffect, useRef } from 'react';
import { Note, SelectionData } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Save } from 'lucide-react';

interface EditorProps {
  note: Note | null;
  onUpdateNote: (id: string, content: string) => void;
  onSelectionChange: (selection: SelectionData | null) => void;
}

const Editor: React.FC<EditorProps> = ({ note, onUpdateNote, onSelectionChange }) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { theme, getAccentColorClass } = useTheme();
  
  // Ref to track if the update comes from the parent (switching notes) or local typing
  const isTypingRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state when note prop changes (switching notes)
  useEffect(() => {
    if (note) {
      setContent(note.content);
      isTypingRef.current = false;
    } else {
      setContent('');
    }
  }, [note?.id]); // Only re-run if ID changes to avoid cursor jumps on save

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    isTypingRef.current = true;
    setIsSaving(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (note) {
      // Auto-save logic
      saveTimeoutRef.current = setTimeout(() => {
        onUpdateNote(note.id, newContent);
        setIsSaving(false);
      }, 2000);
    }
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (target.selectionStart !== target.selectionEnd) {
        const text = target.value.substring(target.selectionStart, target.selectionEnd);
        onSelectionChange({
            text,
            start: target.selectionStart,
            end: target.selectionEnd
        });
    } else {
        onSelectionChange(null);
    }
  };

  const accentText = getAccentColorClass('text');

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-black text-gray-400 p-8">
        <div className="max-w-md text-center">
            <h3 className="text-xl font-semibold mb-2">No Note Selected</h3>
            <p>Select a note from the sidebar or create a new one to start writing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="flex-1 relative">
        <textarea
          className="w-full h-full resize-none p-6 md:p-10 text-lg leading-relaxed bg-transparent text-gray-800 dark:text-gray-200 outline-none font-mono"
          placeholder="# Start typing your markdown here..."
          value={content}
          onChange={handleChange}
          onSelect={handleSelect}
          spellCheck={false}
        />
        
        {/* Status Indicator */}
        <div className="absolute bottom-4 right-6 flex items-center gap-2 text-xs font-mono pointer-events-none transition-opacity duration-500">
             <span className={`flex items-center gap-1.5 ${isSaving ? accentText : 'text-gray-400'}`}>
                {isSaving ? (
                    <>
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getAccentColorClass('bg')}`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${getAccentColorClass('bg')}`}></span>
                        </span>
                        Saving...
                    </>
                ) : (
                    <span className="text-gray-400 dark:text-gray-600 flex items-center gap-1">
                        <Save className="w-3 h-3" />
                        Saved
                    </span>
                )}
             </span>
        </div>
      </div>
    </div>
  );
};

export default Editor;