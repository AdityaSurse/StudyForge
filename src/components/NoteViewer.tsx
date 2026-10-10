import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Note } from '../types';
import { Edit3, Check, MessageSquare, Layers, HelpCircle, BookOpen, Share, MoreHorizontal, Maximize2, Minimize2 } from 'lucide-react';
import { Flashcards } from './Flashcards';
import { Quiz } from './Quiz';
import { ChatPanel } from './ChatPanel';

interface NoteViewerProps {
  note: Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
}

type Tab = 'notes' | 'flashcards' | 'quiz' | 'chat';

export function NoteViewer({ note, updateNote }: NoteViewerProps) {
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editTitle, setEditTitle] = useState(note.title);
  
  const [activeTab, setActiveTab] = useState<Tab>('notes');
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync state if note changes
  useEffect(() => {
    setEditContent(note.content);
    setEditTitle(note.title);
  }, [note.id]);

  const handleSaveContent = () => {
    updateNote(note.id, { content: editContent });
    setIsEditingContent(false);
  };

  const handleTitleBlur = () => {
    if (editTitle.trim() !== note.title) {
      updateNote(note.id, { title: editTitle.trim() || 'Untitled' });
    }
  };

  return (
    <div className={`flex flex-col h-full bg-transparent transition-all ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'relative'}`}>
      
      {/* Top Bar */}
      <div className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0">
        <input 
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="text-xl md:text-2xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-primary-500/50 rounded-md px-2 py-1 max-w-[50%]"
        />
        
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors hidden md:flex">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted text-foreground hover:bg-muted/80 rounded-xl font-medium text-sm transition-colors">
            <Share size={16} /> Share
          </button>
          <button className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area with Chat Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Side: Tabs + Content */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          
          {/* Pill Tabs */}
          <div className="px-4 md:px-8 py-4 shrink-0 overflow-x-auto no-scrollbar border-b bg-card/40">
            <div className="flex items-center gap-2 p-1 bg-muted rounded-2xl w-max">
              <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<BookOpen size={16} />} label="Notes" />
              <TabButton active={activeTab === 'flashcards'} onClick={() => setActiveTab('flashcards')} icon={<Layers size={16} />} label="Flashcards" />
              <TabButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<HelpCircle size={16} />} label="Quiz" />
              {/* Mobile Only Chat Tab */}
              <div className="md:hidden">
                <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare size={16} />} label="Chat" />
              </div>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
            <div className={`mx-auto ${activeTab === 'notes' ? 'max-w-[760px]' : 'max-w-4xl'}`}>
              
              {activeTab === 'notes' && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex justify-end mb-4">
                    <button 
                      onClick={() => isEditingContent ? handleSaveContent() : setIsEditingContent(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-card border hover:shadow-md transition-all active:scale-95 text-foreground"
                    >
                      {isEditingContent ? <><Check size={16} className="text-green-500" /> Done Editing</> : <><Edit3 size={16} className="text-muted-foreground" /> Edit Notes</>}
                    </button>
                  </div>
                  
                  {isEditingContent ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full min-h-[60vh] p-6 text-sm font-mono border-2 rounded-2xl bg-card focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-y leading-relaxed shadow-sm"
                    />
                  ) : (
                    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:rounded-xl">
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
              
              {/* Mobile Chat View */}
              {activeTab === 'chat' && (
                <div className="md:hidden h-[70vh] border rounded-2xl overflow-hidden shadow-sm">
                  <ChatPanel note={note} onClose={() => setActiveTab('notes')} />
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Desktop Chat Panel Toggle Button (if closed) */}
        {!isChatPanelOpen && (
          <button 
            onClick={() => setIsChatPanelOpen(true)}
            className="hidden md:flex absolute right-6 bottom-6 h-14 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-xl shadow-primary-500/20 items-center justify-center px-6 gap-2 font-bold transition-transform hover:-translate-y-1 active:scale-95 z-20"
          >
            <MessageSquare size={20} /> Ask AI
          </button>
        )}

        {/* Desktop Chat Panel */}
        <div className={`hidden md:block w-[380px] shrink-0 border-l bg-card transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${isChatPanelOpen ? 'translate-x-0 opacity-100 shadow-2xl' : 'translate-x-[110%] opacity-0 absolute right-0 top-0 bottom-0 pointer-events-none'}`}>
          {isChatPanelOpen && <ChatPanel note={note} onClose={() => setIsChatPanelOpen(false)} />}
        </div>

      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
        active 
          ? 'bg-card text-foreground shadow-sm' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
