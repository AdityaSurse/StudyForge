import { useState } from 'react';
import type { Note } from '../types';
import { Folder, Search, FileText, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  notes: Note[];
  currentNoteId: string | null;
  setCurrentNoteId: (id: string | null) => void;
  deleteNote: (id: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ notes, currentNoteId, setCurrentNoteId, deleteNote, updateNote, isOpen, setIsOpen }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.folder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = Array.from(new Set(filteredNotes.map(n => n.folder)));

  const handleEditStart = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setEditingId(note.id);
    setEditTitle(note.title);
  };

  const handleEditSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      updateNote(id, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-card border-r w-64 text-card-foreground">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-bold text-xl tracking-tight text-primary-500">StudyForge</h2>
        <button onClick={() => setIsOpen(false)} className="md:hidden p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button 
          onClick={() => setCurrentNoteId(null)}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {folders.map(folder => (
          <div key={folder} className="mb-4">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Folder size={14} />
              {folder || 'Uncategorized'}
            </div>
            <div className="mt-1 space-y-1">
              {filteredNotes.filter(n => n.folder === folder).map(note => (
                <div 
                  key={note.id}
                  onClick={() => setCurrentNoteId(note.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${currentNoteId === note.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                  {editingId === note.id ? (
                    <div className="flex items-center gap-1 w-full">
                      <input 
                        autoFocus
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-sm outline-none"
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleEditSave(e as any, note.id);
                          if (e.key === 'Escape') handleEditCancel(e as any);
                        }}
                      />
                      <button onClick={e => handleEditSave(e, note.id)} className="text-green-600"><Check size={14} /></button>
                      <button onClick={handleEditCancel} className="text-red-500"><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={16} className="shrink-0 opacity-70" />
                        <span className="truncate text-sm font-medium">{note.title}</span>
                      </div>
                      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                        <button onClick={e => handleEditStart(e, note)} className="p-1 hover:text-primary-600 rounded">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); deleteNote(note.id); }} className="p-1 hover:text-red-600 rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.div 
        className="fixed inset-y-0 left-0 z-50 md:relative md:flex shrink-0"
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {sidebarContent}
      </motion.div>
    </>
  );
}
