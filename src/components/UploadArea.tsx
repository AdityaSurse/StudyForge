import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Type, FileAudio, FileText, Loader2, Video, Search, ChevronRight, Mic } from 'lucide-react';
import type { Note } from '../types';

interface UploadAreaProps {
  onProcess: (content: string, type: 'text' | 'youtube' | 'pdf', file?: File) => Promise<void>;
  recentNotes: Note[];
  onNoteClick: (id: string) => void;
}

export function UploadArea({ onProcess, recentNotes, onNoteClick }: UploadAreaProps) {
  const [activeModal, setActiveModal] = useState<'upload' | 'text' | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    try {
      const isPdf = file.type === 'application/pdf';
      const isAudio = file.type.startsWith('audio/');
      
      if (!isPdf && !isAudio) {
        throw new Error('Unsupported file type. Please upload PDF or Audio files.');
      }

      await onProcess(file.name, isPdf ? 'pdf' : 'text', file);
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
    } finally {
      setIsProcessing(false);
      setActiveModal(null);
    }
  }, [onProcess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg']
    },
    maxFiles: 1
  });

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const isYoutube = textInput.includes('youtube.com') || textInput.includes('youtu.be');
      await onProcess(textInput, isYoutube ? 'youtube' : 'text');
    } catch (err: any) {
      setError(err.message || 'Failed to process text');
    } finally {
      setIsProcessing(false);
      if (!error) setActiveModal(null);
    }
  };

  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-6 md:px-10 py-12 min-h-screen flex flex-col">
      
      {/* Centered Greeting with Radial Scrim */}
      <div className="relative text-center mb-12 animate-in slide-in-from-bottom-4 duration-500 fade-in flex flex-col items-center">
        <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55),transparent_70%)] blur-md scale-150 pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)] text-balance">
          What do you want to learn today?
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-white/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
          Upload any material to generate smart notes, flashcards, and quizzes instantly.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-16">
        <ActionCard 
          icon={<FileText className="text-blue-500" size={24} />} 
          title="Upload PDF" 
          description="Extract notes from documents"
          onClick={() => setActiveModal('upload')}
          delay={100}
        />
        <ActionCard 
          icon={<Mic className="text-purple-500" size={24} />} 
          title="Record Lecture" 
          description="Transcribe live audio"
          onClick={() => alert('Recording coming soon!')}
          delay={200}
        />
        <ActionCard 
          icon={<Type className="text-orange-500" size={24} />} 
          title="Paste Text or URL" 
          description="From articles or YouTube"
          onClick={() => setActiveModal('text')}
          delay={300}
        />
        <ActionCard 
          icon={<FileAudio className="text-green-500" size={24} />} 
          title="Upload Audio" 
          description="MP3 or WAV files"
          onClick={() => setActiveModal('upload')}
          delay={400}
        />
      </div>

      {/* Recent Notes */}
      <div className="w-full animate-in fade-in duration-700 delay-500 fill-mode-both">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">Recent notes</h2>
        </div>
        
        {recentNotes.length === 0 ? (
          <div className="bg-zinc-900/70 backdrop-blur-md border border-white/10 rounded-2xl p-12 flex flex-col items-center text-center text-white/80 w-full">
            <Search size={40} className="mb-4 opacity-50" />
            <p className="font-bold text-white">Your library is empty</p>
            <p className="text-sm mt-1">Create your first note by uploading a file above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {recentNotes.map((note) => (
              <div 
                key={note.id}
                onClick={() => onNoteClick(note.id)}
                className="bg-zinc-900/70 backdrop-blur-md border border-white/10 rounded-2xl p-5 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group flex flex-col h-48"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
                    <FileText size={18} />
                  </div>
                  <ChevronRight size={18} className="text-white/50 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0" />
                </div>
                <h3 className="font-bold text-white mb-1 line-clamp-1">{note.title}</h3>
                <p className="text-sm text-white/70 line-clamp-3 mb-auto">
                  {note.content.substring(0, 100)}...
                </p>
                <div className="mt-4 text-xs text-white/50 font-medium uppercase tracking-wider">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals for Upload / Text */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen" onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) setActiveModal(null); }}>
          <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 text-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{activeModal === 'upload' ? 'Upload File' : 'Paste Content'}</h3>
              <button onClick={() => !isProcessing && setActiveModal(null)} className="text-white/50 hover:text-white">✕</button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-900/40 text-red-400 text-sm border border-red-500/30">
                {error}
              </div>
            )}

            {activeModal === 'upload' ? (
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-primary-500 bg-primary-500/20' : 'border-white/20 hover:border-primary-400 hover:bg-white/5'}`}
              >
                <input {...getInputProps()} />
                <div className="flex justify-center mb-4 text-primary-400">
                  <UploadCloud size={48} strokeWidth={1.5} />
                </div>
                <h4 className="text-xl font-bold mb-2">Drag & Drop files</h4>
                <p className="text-white/60 mb-6 max-w-sm mx-auto">
                  Supported: PDF, MP3, WAV
                </p>
                {isProcessing && (
                  <div className="mt-6 flex flex-col items-center gap-3 text-primary-400 bg-primary-900/30 p-4 rounded-xl">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="font-bold animate-pulse">Generating your notes...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <textarea 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your notes, article text, or YouTube transcript here..."
                  className="w-full h-64 p-4 rounded-2xl border border-white/10 bg-black/40 text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  disabled={isProcessing}
                />
                
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-white/50 flex gap-4">
                    <span className="flex items-center gap-1.5"><Video size={14} /> YT Transcript</span>
                    <span className="flex items-center gap-1.5"><Type size={14} /> Raw Text</span>
                  </div>
                  
                  <button 
                    onClick={handleTextSubmit}
                    disabled={!textInput.trim() || isProcessing}
                    className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
                  >
                    {isProcessing ? (
                      <><Loader2 size={18} className="animate-spin" /> Generating...</>
                    ) : (
                      'Generate Notes'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ icon, title, description, onClick, delay }: any) {
  return (
    <div 
      onClick={onClick}
      className={`bg-zinc-900/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-primary-400/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 fill-mode-both group`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-white text-lg mb-1">{title}</h3>
      <p className="text-sm text-white/70 font-medium">{description}</p>
    </div>
  );
}
