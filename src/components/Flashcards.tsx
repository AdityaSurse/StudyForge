import { useState, useEffect, useCallback } from 'react';
import type { Note, Flashcard } from '../types';
import { generateFlashcards } from '../lib/gemini';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, Check, X, Layers, Lightbulb, Play } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardsProps {
  note: Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
}

export function Flashcards({ note, updateNote }: FlashcardsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const flashcards = note.flashcards || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await generateFlashcards(note.content);
      const newCards: Flashcard[] = data.map((item: any) => ({
        id: uuidv4(),
        q: item.q,
        a: item.a,
        nextReview: Date.now(),
        interval: 1
      }));
      updateNote(note.id, { flashcards: newCards });
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      setError(err.message || 'Failed to generate flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  }, [flashcards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  }, [flashcards.length]);

  const handleReview = useCallback((quality: 'easy' | 'hard') => {
    if (flashcards.length === 0) return;
    
    const card = flashcards[currentIndex];
    let newInterval = card.interval;
    
    if (quality === 'easy') {
      newInterval = card.interval * 2;
    } else {
      newInterval = 1; // reset
    }
    
    const nextReview = Date.now() + newInterval * 24 * 60 * 60 * 1000;
    
    const updatedCards = [...flashcards];
    updatedCards[currentIndex] = { ...card, interval: newInterval, nextReview };
    
    updateNote(note.id, { flashcards: updatedCards });
    handleNext();
  }, [flashcards, currentIndex, handleNext, note.id, updateNote]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (flashcards.length === 0) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'Digit1' && isFlipped) {
        e.preventDefault();
        handleReview('hard');
      } else if (e.code === 'Digit2' && isFlipped) {
        e.preventDefault();
        handleReview('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flashcards.length, handleNext, handlePrev, handleReview, isFlipped]);


  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-foreground animate-in fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-20 animate-pulse" />
          <Loader2 size={48} className="animate-spin text-primary-500 relative z-10" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Generating flashcards...</h3>
          <p className="text-muted-foreground">Extracting key concepts and questions.</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Layers className="text-muted-foreground" size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-3">No flashcards yet</h3>
        <p className="text-muted-foreground mb-8 text-lg">
          Transform these notes into an interactive flashcard deck for active recall testing.
        </p>
        <button 
          onClick={handleGenerate}
          className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all active:scale-95"
        >
          <Play size={18} className="fill-current" /> Generate Flashcards
        </button>
        {error && <p className="text-red-500 mt-6 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-900/30 text-sm font-medium">{error}</p>}
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center py-4 md:py-8 w-full animate-in fade-in duration-500">
      
      {/* Header & Progress */}
      <div className="w-full mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span className="bg-muted px-3 py-1 rounded-lg text-sm font-bold text-foreground">
              {currentIndex + 1} / {flashcards.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
              Press <kbd className="px-2 py-0.5 bg-card border rounded shadow-sm text-xs mx-1">Space</kbd> to flip
            </span>
          </div>
          <button 
            onClick={handleGenerate}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw size={14} /> Rebuild Deck
          </button>
        </div>
        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-primary-500 h-full transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 3D Card */}
      <div 
        className="relative w-full aspect-[4/3] md:aspect-[2/1] perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
        >
          {/* Front (Question) */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-card border-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center group-hover:border-primary-200 transition-colors">
            <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-500/10 px-3 py-1 rounded-full">Question</span>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">
              {currentCard.q}
            </h2>
            <p className="absolute bottom-6 text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lightbulb size={16} /> Click to reveal answer
            </p>
          </div>
          
          {/* Back (Answer) */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-card border-2 border-primary-100 dark:border-primary-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center rotate-y-180">
            <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">Answer</span>
            <p className="text-xl md:text-3xl text-foreground font-medium leading-relaxed">
              {currentCard.a}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mt-10 flex flex-col items-center w-full gap-6">
        <div className="flex items-center gap-3 w-full justify-center relative">
          
          {/* Prev Button */}
          <button 
            onClick={handlePrev}
            className="absolute left-0 md:static p-4 rounded-full bg-card border shadow-sm hover:shadow-md hover:bg-muted text-foreground transition-all active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          
          {/* Spaced Repetition Buttons */}
          <div className={`flex gap-3 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); handleReview('hard'); }}
              className="flex items-center gap-2 px-6 md:px-8 py-4 rounded-2xl bg-card border-2 border-red-100 hover:border-red-200 dark:border-red-900/30 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 font-bold transition-all shadow-sm active:scale-95 group"
            >
              <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform"><X size={14} /></div>
              Still learning <span className="hidden md:inline font-normal text-red-400 text-xs ml-1">(1)</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleReview('easy'); }}
              className="flex items-center gap-2 px-6 md:px-8 py-4 rounded-2xl bg-card border-2 border-emerald-100 hover:border-emerald-200 dark:border-emerald-900/30 dark:hover:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 text-emerald-600 font-bold transition-all shadow-sm active:scale-95 group"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform"><Check size={14} /></div>
              Got it! <span className="hidden md:inline font-normal text-emerald-400 text-xs ml-1">(2)</span>
            </button>
          </div>

          {/* Next Button */}
          <button 
            onClick={handleNext}
            className="absolute right-0 md:static p-4 rounded-full bg-card border shadow-sm hover:shadow-md hover:bg-muted text-foreground transition-all active:scale-95"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
