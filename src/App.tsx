import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { UploadArea } from './components/UploadArea'; // This will be redesigned as the dashboard
import { NoteViewer } from './components/NoteViewer';
import { useStore } from './lib/store';
import { generateNotes } from './lib/gemini';
import { Menu } from 'lucide-react';

import { ShaderBackground } from './components/ShaderBackground';

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
    <>
      <ShaderBackground />
      <div className="flex h-screen w-full overflow-hidden bg-transparent">
      {/* Dynamic unmount/remount on mobile is not necessary, just use the CSS positioning inside Sidebar */}
      <Sidebar 
        notes={store.notes}
        currentNoteId={store.currentNoteId}
        setCurrentNoteId={store.setCurrentNoteId}
        deleteNote={store.deleteNote}
        updateNote={store.updateNote}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        theme={store.theme}
        toggleTheme={store.toggleTheme}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all">
        {/* Only show this mobile header if sidebar is closed and we need to open it */}
        <div className="md:hidden p-4 border-b bg-card/80 backdrop-blur-md flex items-center gap-3 sticky top-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl text-muted-foreground hover:bg-muted"
          >
            <Menu size={20} />
          </button>
          <div className="font-bold tracking-tight flex-1">
            {store.currentNote ? store.currentNote.title : 'StudyForge'}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full relative">
          {!store.currentNote ? (
            <UploadArea onProcess={handleProcess} recentNotes={store.notes.slice(0, 4)} onNoteClick={store.setCurrentNoteId} />
          ) : (
            <NoteViewer note={store.currentNote} updateNote={store.updateNote} />
          )}
        </div>
      </main>
    </div>
    </>
  );
}

export default App;
