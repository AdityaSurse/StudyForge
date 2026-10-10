import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { UploadArea } from './components/UploadArea';
import { NoteViewer } from './components/NoteViewer';
import { useStore } from './lib/store';
import { generateNotes } from './lib/gemini';
import { Moon, Sun, Menu } from 'lucide-react';

function App() {
  const store = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleProcess = async (content: string, type: 'text' | 'youtube' | 'pdf', file?: File) => {
    try {
      const generatedMarkdown = await generateNotes(content, type, file);
      
      const title = file ? file.name : (content.slice(0, 30) + '...');
      
      store.addNote({
        title,
        content: generatedMarkdown,
        folder: 'Recent'
      });
    } catch (err: any) {
      throw err;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        notes={store.notes}
        currentNoteId={store.currentNoteId}
        setCurrentNoteId={store.setCurrentNoteId}
        deleteNote={store.deleteNote}
        updateNote={store.updateNote}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-14 border-b bg-card/50 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu size={20} />
            </button>
            {store.currentNote && (
              <h1 className="font-semibold text-sm truncate max-w-[200px] md:max-w-md">
                {store.currentNote.title}
              </h1>
            )}
          </div>
          
          <button 
            onClick={store.toggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            {store.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {!store.currentNote ? (
            <div className="h-full flex items-center justify-center p-4">
              <UploadArea onProcess={handleProcess} />
            </div>
          ) : (
            <NoteViewer note={store.currentNote} updateNote={store.updateNote} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
