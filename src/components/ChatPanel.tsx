import { useState, useRef, useEffect } from 'react';
import type { Note } from '../types';
import { chatWithNotes } from '../lib/gemini';
import { Send, X, Bot, Loader2, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatPanelProps {
  note: Note;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function ChatPanel({ note, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I am your AI study assistant. I have full context on **' + note.title + '**. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.slice(1);
      const response = await chatWithNotes(note.content, history, userMessage);
      
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: `Error: ${err.message || 'Failed to get a response.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent md:bg-card/50">
      <div className="p-4 border-b flex items-center justify-between shrink-0 bg-card">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Study Assistant</h3>
            <p className="text-xs text-muted-foreground">Always ready to help</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors md:hidden"
        >
          <X size={18} />
        </button>
        <button 
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors hidden md:flex"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[95%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-2xl rounded-tr-sm' : 'bg-card border rounded-2xl rounded-tl-sm text-foreground'}`}>
              {msg.role === 'user' ? (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              ) : (
                <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:text-foreground">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[95%]">
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400">
              <Bot size={16} />
            </div>
            <div className="p-4 bg-card border rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
              <div className="w-2 h-2 rounded-full bg-primary-500/50 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary-500/50 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary-500/50 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t shrink-0 bg-card">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..." 
            className="w-full bg-muted rounded-2xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-background border border-transparent focus:border-border transition-all shadow-sm"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-xl bg-primary-500 text-white disabled:opacity-50 disabled:bg-muted-foreground disabled:text-background hover:bg-primary-600 transition-colors shadow-sm active:scale-95"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
