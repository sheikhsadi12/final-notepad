import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import TopNav from './components/TopNav';
import SettingsModal from './components/SettingsModal';
import ChatPanel from './components/ChatPanel';
import AudioPlayer from './components/AudioPlayer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './context/ThemeContext';
import { Note, SelectionData, ChatMessage } from './types';
import { fetchTTS } from './services/ttsService';
import { cleanTextForSpeech } from './utils/textCleaner';

// Simple ID generator utility
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('stn-notes', []);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // Chat panel state
  const [selectedText, setSelectedText] = useState<SelectionData | null>(null);
  
  // Audio State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isFetchingAudio, setIsFetchingAudio] = useState(false);
  const { voice } = useTheme();

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  useEffect(() => {
    // If no active note but notes exist, select the first one (optional, good UX)
    // Disabled to allow "Empty State" in editor
  }, [notes]);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: generateId(),
      title: '',
      content: '',
      updatedAt: Date.now(),
      chatHistory: [], // Initialize empty chat
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setIsSidebarOpen(false); // Close mobile sidebar on creation to focus editor
  };

  const handleDeleteNote = (id: string) => {
    const newNotes = notes.filter((n) => n.id !== id);
    setNotes(newNotes);
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  const handleUpdateNote = (id: string, content: string) => {
    const updatedNotes = notes.map((note) => {
      if (note.id === id) {
        // Auto-generate title from first line if untitled or previously auto-generated
        const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
        const title = firstLine.substring(0, 30) || 'Untitled Note';
        
        return { ...note, content, title, updatedAt: Date.now() };
      }
      return note;
    });
    setNotes(updatedNotes);
  };

  const handleUpdateChat = (id: string, messages: ChatMessage[]) => {
    const updatedNotes = notes.map((note) => {
        if (note.id === id) {
            return { ...note, chatHistory: messages };
        }
        return note;
    });
    setNotes(updatedNotes);
  };

  const handleRenameNote = (id: string, newTitle: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, title: newTitle } : n)));
  };

  const handleSpeak = async (text: string) => {
      if (!text || isFetchingAudio) return;
      
      const cleaned = cleanTextForSpeech(text);
      if (!cleaned) return;

      setIsFetchingAudio(true);
      const url = await fetchTTS(cleaned, voice);
      setIsFetchingAudio(false);

      if (url) {
          setAudioUrl(url);
      }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        isOpen={isSidebarOpen}
        onSelectNote={setActiveNoteId}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onRenameNote={handleRenameNote}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
        <TopNav 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            toggleChat={() => setIsChatOpen(!isChatOpen)}
            isChatOpen={isChatOpen}
            title={activeNote?.title || "Smart Teacher Notepad"}
            onSpeak={() => activeNote && handleSpeak(activeNote.content)}
            isSpeaking={isFetchingAudio}
        />
        
        <main className="flex-1 flex overflow-hidden relative">
            <div className="flex-1 relative h-full">
                 <Editor 
                    note={activeNote} 
                    onUpdateNote={handleUpdateNote} 
                    onSelectionChange={setSelectedText}
                />
            </div>
            
            <ChatPanel 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)}
                activeNote={activeNote}
                selectedText={selectedText}
                onUpdateChat={handleUpdateChat}
                onSpeak={handleSpeak}
            />
            
            {isChatOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 sm:hidden"
                    onClick={() => setIsChatOpen(false)}
                />
            )}
        </main>
      </div>

      <AudioPlayer 
        audioUrl={audioUrl} 
        onClose={() => setAudioUrl(null)}
        autoPlay={true}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      
    </div>
  );
};

export default App;