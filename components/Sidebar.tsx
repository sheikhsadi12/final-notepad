import React, { useState } from 'react';
import { Plus, Trash2, Edit2, FileText, X, Check, Settings } from 'lucide-react';
import { Note } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  isOpen: boolean;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onRenameNote: (id: string, newTitle: string) => void;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  isOpen,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onRenameNote,
  onCloseMobile,
  onOpenSettings,
}) => {
  const { getAccentColorClass } = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setEditingId(note.id);
    setEditTitle(note.title);
  };

  const handleFinishRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingId) {
      onRenameNote(editingId, editTitle);
      setEditingId(null);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDeleteNote(id);
    }
  };

  // Base classes for sidebar
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out
    bg-gray-100/90 dark:bg-gray-900/90 backdrop-blur-md border-r border-gray-200 dark:border-gray-800
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:static md:inset-auto md:w-80 md:flex-shrink-0
    flex flex-col
  `;

  const accentText = getAccentColorClass('text');
  const accentBg = getAccentColorClass('bg');
  const accentHoverBg = getAccentColorClass('hover-bg');

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={sidebarClasses}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <FileText className={`w-5 h-5 ${accentText}`} />
              My Notes
            </h2>
            <button onClick={onCloseMobile} className="md:hidden p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Note Button */}
          <div className="p-4 shrink-0">
            <button
              onClick={onCreateNote}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium shadow-lg transition-all ${accentBg} ${accentHoverBg}`}
            >
              <Plus className="w-5 h-5" />
              New Note
            </button>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
            {notes.length === 0 && (
              <div className="text-center py-10 px-4 text-gray-400 dark:text-gray-600">
                <p className="text-sm">No notes yet.</p>
                <p className="text-xs mt-1">Click "New Note" to get started.</p>
              </div>
            )}

            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  onSelectNote(note.id);
                  onCloseMobile();
                }}
                className={`
                  group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border border-transparent
                  ${
                    activeNoteId === note.id
                      ? `bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700`
                      : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-400'
                  }
                `}
              >
                {editingId === note.id ? (
                  <form onSubmit={handleFinishRename} className="flex-1 flex items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleFinishRename()}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none text-sm text-gray-900 dark:text-white"
                    />
                    <button type="submit" className={`p-1 ${accentText}`}>
                      <Check className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="flex-1 min-w-0 pr-2">
                    <h3
                      className={`text-sm font-medium truncate ${
                        activeNoteId === note.id ? 'text-gray-900 dark:text-white' : ''
                      }`}
                    >
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {new Date(note.updatedAt).toLocaleDateString()} • {note.content.substring(0, 20).replace(/\n/g, ' ')}...
                    </p>
                  </div>
                )}

                {!editingId && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                      onClick={(e) => handleStartRename(e, note)}
                      className="p-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, note.id)}
                      className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                
                {activeNoteId === note.id && !editingId && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full ${accentBg}`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Settings Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
             <button
               onClick={() => {
                   onOpenSettings();
                   onCloseMobile();
               }}
               className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
             >
                <Settings className="w-5 h-5" />
                Settings
             </button>
          </div>
      </aside>
    </>
  );
};

export default Sidebar;