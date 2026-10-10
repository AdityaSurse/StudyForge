import { useState } from 'react';
import type { Note, Flashcard } from '../types';
import { generateFlashcards } from '../lib/gemini';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, XCircle, Layers } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

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

  const handleReview = (quality: 'easy' | 'hard') => {
    if (flashcards.length === 0) return;
    
    const card = flashcards[currentIndex];
    let newInterval = card.interval;
    
    if (quality === 'easy') {
      newInterval = card.interval * 2;
    } else {
      newInterval = 1; // reset
    }
    
    const nextReview = Date.now() + newInterval * 24 * 60 * 60 * 1000; // in days
    
    const updatedCards = [...flashcards];
    updatedCards[currentIndex] = { ...card, interval: newInterval, nextReview };
    
    updateNote(note.id, { flashcards: updatedCards });
    
    handleNext();
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-primary-600 gap-4">
        <Loader2 size={40} className="animate-spin" />
        <p className="font-medium animate-pulse">Generating your flashcards...</p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-800/20">
        <Layers className="text-slate-400 mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-2">No flashcards yet</h3>
        <p className="text-slate-500 mb-6 max-w-sm">
          Generate smart Q&A flashcards directly from your notes to test your knowledge.
        </p>
        <button 
          onClick={handleGenerate}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          Generate Flashcards
        </button>
        {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <span className="text-sm font-medium text-slate-500">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <button 
          onClick={handleGenerate}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <RefreshCw size={14} /> Regenerate
        </button>
      </div>

      {/* Card container with perspective */}
      <div 
        className="relative w-full aspect-[4/3] md:aspect-[3/2] perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d transition-all duration-500"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-card border shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest text-slate-400">Question</span>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-100">
              {currentCard.q}
            </h2>
            <p className="absolute bottom-4 text-sm text-slate-400 animate-pulse">Click to flip</p>
          </div>
          
          {/* Back */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center text-center rotate-y-180">
            <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest text-primary-500">Answer</span>
            <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-200">
              {currentCard.a}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 flex flex-col items-center w-full gap-6">
        <div className="flex items-center gap-4 w-full justify-center">
          <button 
            onClick={handlePrev}
            className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex gap-4 opacity-0 transition-opacity duration-300" style={{ opacity: isFlipped ? 1 : 0, pointerEvents: isFlipped ? 'auto' : 'none' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); handleReview('hard'); }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 font-medium transition-colors"
            >
              <XCircle size={18} /> Review Again
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleReview('easy'); }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60 font-medium transition-colors"
            >
              <CheckCircle size={18} /> Got it!
            </button>
          </div>

          <button 
            onClick={handleNext}
            className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
