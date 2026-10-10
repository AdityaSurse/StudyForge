import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Note } from '../types';
import { Edit3, Check, MessageSquare, Layers, HelpCircle, BookOpen } from 'lucide-react';
import { Flashcards } from './Flashcards';
import { Quiz } from './Quiz';
import { ChatPanel } from './ChatPanel';

interface NoteViewerProps {
  note: Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
}

type Tab = 'notes' | 'flashcards' | 'quiz';

export function NoteViewer({ note, updateNote }: NoteViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [activeTab, setActiveTab] = useState<Tab>('notes');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSave = () => {
    updateNote(note.id, { content: editContent });
    setIsEditing(false);
  };

  return (
    <div className="flex h-full relative">
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isChatOpen ? 'mr-80' : ''}`}>
        
        {/* Tab Navigation */}
        <div className="flex border-b bg-card px-4 md:px-8 gap-6 overflow-x-auto shrink-0">
          <button 
            onClick={() => setActiveTab('notes')}
            className={`py-4 px-2 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'notes' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <BookOpen size={18} /> Notes
          </button>
          <button 
            onClick={() => setActiveTab('flashcards')}
            className={`py-4 px-2 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'flashcards' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Layers size={18} /> Flashcards
          </button>
          <button 
            onClick={() => setActiveTab('quiz')}
            className={`py-4 px-2 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'quiz' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <HelpCircle size={18} /> Quiz
          </button>
          
          <div className="flex-1" />
          
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`py-4 px-2 font-medium flex items-center gap-2 transition-colors ${isChatOpen ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <MessageSquare size={18} /> Chat
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'notes' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold">{note.title}</h1>
                  <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                  >
                    {isEditing ? <><Check size={16} className="text-green-600" /> Save</> : <><Edit3 size={16} /> Edit</>}
                  </button>
                </div>
                
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-[60vh] p-4 font-mono text-sm border rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                  />
                ) : (
                  <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary-600 dark:prose-a:text-primary-400">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {note.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'flashcards' && (
              <Flashcards note={note} updateNote={updateNote} />
            )}

            {activeTab === 'quiz' && (
              <Quiz note={note} updateNote={updateNote} />
            )}
          </div>
        </div>
      </div>

      {/* Chat Panel - slide in from right */}
      <div className={`absolute top-0 right-0 h-full w-80 bg-card border-l transform transition-transform duration-300 ease-in-out ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {isChatOpen && <ChatPanel note={note} onClose={() => setIsChatOpen(false)} />}
      </div>
    </div>
  );
}
