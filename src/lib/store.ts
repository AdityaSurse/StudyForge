import { useState, useEffect } from 'react';
import type { Note } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useStore = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('studyforge_notes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('studyforge_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('studyforge_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('studyforge_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setCurrentNoteId(newNote.id);
    return newNote.id;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (currentNoteId === id) setCurrentNoteId(null);
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const currentNote = notes.find(n => n.id === currentNoteId) || null;

  return {
    notes,
    currentNote,
    currentNoteId,
    theme,
    setCurrentNoteId,
    addNote,
    updateNote,
    deleteNote,
    toggleTheme
  };
};
