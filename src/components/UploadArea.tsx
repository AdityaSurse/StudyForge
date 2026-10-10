import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Type, FileAudio, FileText, Loader2, Video } from 'lucide-react';

interface UploadAreaProps {
  onProcess: (content: string, type: 'text' | 'youtube' | 'pdf', file?: File) => Promise<void>;
}

export function UploadArea({ onProcess }: UploadAreaProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
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
      // If it's just a URL, they might want us to extract it, but since it's client-side, 
      // we assume they pasted the transcript text or we just pass it to Gemini to figure out.
      await onProcess(textInput, isYoutube ? 'youtube' : 'text');
    } catch (err: any) {
      setError(err.message || 'Failed to process text');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500">
          Supercharge Your Studies
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Upload lectures, drop PDFs, or paste text to instantly generate smart notes, flashcards, and quizzes.
        </p>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden transition-all">
        <div className="flex border-b bg-slate-50/50 dark:bg-slate-800/50">
          <button 
            className={`flex-1 py-4 flex justify-center items-center gap-2 font-medium transition-colors ${activeTab === 'upload' ? 'text-primary-600 border-b-2 border-primary-600 bg-white dark:bg-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud size={18} /> File Upload
          </button>
          <button 
            className={`flex-1 py-4 flex justify-center items-center gap-2 font-medium transition-colors ${activeTab === 'text' ? 'text-primary-600 border-b-2 border-primary-600 bg-white dark:bg-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab('text')}
          >
            <Type size={18} /> Paste Text
          </button>
        </div>

        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {activeTab === 'upload' ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <input {...getInputProps()} />
              
              <div className="flex justify-center mb-4 text-primary-500">
                <UploadCloud size={48} strokeWidth={1.5} />
              </div>
              
              <h3 className="text-xl font-semibold mb-2">Drag & Drop your files here</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                Supported formats: PDF documents and Audio files (MP3, WAV).
              </p>
              
              <div className="flex justify-center gap-4 text-slate-400 text-sm">
                <div className="flex items-center gap-1"><FileText size={16} /> PDF</div>
                <div className="flex items-center gap-1"><FileAudio size={16} /> Audio</div>
              </div>

              {isProcessing && (
                <div className="mt-6 flex flex-col items-center gap-2 text-primary-600">
                  <Loader2 size={24} className="animate-spin" />
                  <span className="font-medium animate-pulse">Generating magic...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <textarea 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your notes, article text, or YouTube transcript here..."
                  className="w-full h-64 p-4 rounded-xl border bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  disabled={isProcessing}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-slate-500 flex gap-4">
                  <span className="flex items-center gap-1"><Video size={14} /> YT Transcript</span>
                  <span className="flex items-center gap-1"><Type size={14} /> Raw Text</span>
                </div>
                
                <button 
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || isProcessing}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  {isProcessing ? (
                    <><Loader2 size={18} className="animate-spin" /> Processing</>
                  ) : (
                    'Generate Notes'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
