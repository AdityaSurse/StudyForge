import { useState } from 'react';
import type { Note } from '../types';
import { Folder, Search, FileText, Plus, Trash2, Edit2, Check, X, Moon, Sun, Settings, LogOut, ChevronDown, ChevronRight, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  notes: Note[];
  currentNoteId: string | null;
  setCurrentNoteId: (id: string | null) => void;
  deleteNote: (id: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function Sidebar({ notes, currentNoteId, setCurrentNoteId, deleteNote, updateNote, isOpen, setIsOpen, theme, toggleTheme }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({'Recent': true});

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

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-card border-r w-[260px] text-card-foreground shadow-sm">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold text-lg">
            S
          </div>
          <h2 className="font-bold text-lg tracking-tight">StudyForge</h2>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="px-4 pb-4">
        <button 
          onClick={() => { setCurrentNoteId(null); setIsOpen(false); }}
          className="w-full flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus size={18} /> New Note
        </button>
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/50 border border-transparent focus:border-border focus:bg-card text-sm focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        {folders.map(folder => {
          const isExpanded = expandedFolders[folder] ?? true;
          return (
            <div key={folder} className="mb-1">
              <button 
                onClick={() => toggleFolder(folder)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-2 uppercase tracking-wider">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {folder || 'Uncategorized'}
                </div>
                <FolderPlus size={14} className="opacity-0 group-hover:opacity-100 hover:text-primary-500 transition-opacity" />
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 space-y-0.5">
                      {filteredNotes.filter(n => n.folder === folder).map(note => (
                        <div 
                          key={note.id}
                          onClick={() => { setCurrentNoteId(note.id); setIsOpen(false); }}
                          className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${currentNoteId === note.id ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                        >
                          {editingId === note.id ? (
                            <div className="flex items-center gap-1 w-full">
                              <input 
                                autoFocus
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                className="flex-1 bg-card border rounded px-2 py-1 text-sm outline-none ring-1 ring-primary-500"
                                onClick={e => e.stopPropagation()}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleEditSave(e as any, note.id);
                                  if (e.key === 'Escape') handleEditCancel(e as any);
                                }}
                              />
                              <button onClick={e => handleEditSave(e, note.id)} className="text-green-500 p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"><Check size={14} /></button>
                              <button onClick={handleEditCancel} className="text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><X size={14} /></button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <FileText size={16} className={`shrink-0 ${currentNoteId === note.id ? 'text-primary-500' : 'text-muted-foreground'}`} />
                                <span className="truncate text-sm">{note.title}</span>
                              </div>
                              <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 ml-2">
                                <button onClick={e => handleEditStart(e, note)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-card rounded-md transition-colors shadow-sm">
                                  <Edit2 size={13} />
                                </button>
                                <button onClick={e => { e.stopPropagation(); deleteNote(note.id); }} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-card rounded-md transition-colors shadow-sm">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t space-y-1">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            <span>Theme</span>
          </div>
          <span className="text-xs font-semibold uppercase">{theme}</span>
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors">
          <Settings size={16} /> Settings
        </button>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.div 
        className="fixed inset-y-0 left-0 z-50 md:relative md:flex shrink-0 h-full"
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      >
        {sidebarContent}
      </motion.div>
    </>
  );
}
