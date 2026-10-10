import { useState, useEffect } from 'react';
import type { Note, Quiz as QuizType } from '../types';
import { generateQuiz } from '../lib/gemini';
import { Loader2, RefreshCw, HelpCircle, CheckCircle2, XCircle, Lightbulb, Play, ChevronRight, Trophy } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import confetti from 'canvas-confetti';

interface QuizProps {
  note: Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
}

export function Quiz({ note, updateNote }: QuizProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const quiz = note.quiz;
  const questions = quiz?.questions || [];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Trigger confetti when showing results
  useEffect(() => {
    if (showResults) {
      const score = calculateScore();
      if (score / questions.length >= 0.7) {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
        
        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          const particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
      }
    }
  }, [showResults]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await generateQuiz(note.content);
      const newQuiz: QuizType = {
        questions: data.questions.map((q: any) => ({
          ...q,
          id: uuidv4()
        }))
      };
      updateNote(note.id, { quiz: newQuiz });
      setCurrentIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setShowHint(false);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (showResults || selectedAnswers[currentIndex] !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowHint(false);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-foreground animate-in fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-20 animate-pulse" />
          <Loader2 size={48} className="animate-spin text-primary-500 relative z-10" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Crafting your quiz...</h3>
          <p className="text-muted-foreground">Generating challenging MCQs.</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <HelpCircle className="text-muted-foreground" size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-3">No quiz available</h3>
        <p className="text-muted-foreground mb-8 text-lg">
          Test your understanding with a custom multiple-choice quiz tailored to your notes.
        </p>
        <button 
          onClick={handleGenerate}
          className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all active:scale-95"
        >
          <Play size={18} className="fill-current" /> Generate Quiz
        </button>
        {error && <p className="text-red-500 mt-6 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-900/30 text-sm font-medium">{error}</p>}
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="max-w-3xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="text-center p-12 bg-card border rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-muted">
            <div className={`h-full ${percentage >= 80 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }} />
          </div>
          
          <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} className="text-primary-500" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
          <div className="text-7xl font-black text-foreground my-6 tracking-tighter">
            {score} <span className="text-4xl text-muted-foreground font-bold">/ {questions.length}</span>
          </div>
          <p className="text-xl text-muted-foreground font-medium mb-10">
            {percentage >= 80 ? 'Excellent work! You mastered this material. 🎯' : percentage >= 60 ? 'Good job! Keep reviewing to improve. 📚' : 'Keep studying, you\'ll get it next time! 💪'}
          </p>
          <button 
            onClick={handleGenerate}
            className="flex items-center gap-2 mx-auto bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-95"
          >
            <RefreshCw size={18} /> Take a New Quiz
          </button>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-6">Detailed Review</h3>
          {questions.map((q, idx) => {
            const isCorrect = selectedAnswers[idx] === q.correctAnswer;
            const didAnswer = selectedAnswers[idx] !== undefined;
            return (
              <div key={q.id} className="p-6 md:p-8 border rounded-3xl bg-card">
                <div className="flex gap-4">
                  <div className="mt-1 shrink-0">
                    {isCorrect ? <CheckCircle2 className="text-emerald-500" size={28} /> : <XCircle className="text-red-500" size={28} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xl mb-6 text-foreground">{idx + 1}. {q.question}</p>
                    <div className="space-y-3 mb-6">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[idx] === optIdx;
                        const isActuallyCorrect = q.correctAnswer === optIdx;
                        let optionClass = 'border bg-muted/30 text-muted-foreground';
                        
                        if (isActuallyCorrect) {
                          optionClass = 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 font-semibold shadow-sm';
                        } else if (isSelected && !isCorrect) {
                          optionClass = 'bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400 opacity-80';
                        }
                        
                        return (
                          <div key={optIdx} className={`p-4 rounded-xl border-2 transition-all ${optionClass}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${isActuallyCorrect ? 'border-emerald-500 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50' : isSelected ? 'border-red-500 text-red-600 bg-red-100 dark:bg-red-900/50' : 'border-muted-foreground/30'}`}>
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              {opt}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {!didAnswer && (
                      <p className="text-sm text-amber-600 dark:text-amber-500 font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb size={16} /> You didn't answer this question.
                      </p>
                    )}
                    <div className="p-5 rounded-2xl bg-muted/50 border">
                      <p className="text-sm font-medium leading-relaxed">
                        <span className="font-bold text-foreground block mb-1">Explanation:</span> 
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const hasSelected = selectedAnswers[currentIndex] !== undefined;
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center py-4 md:py-8 w-full animate-in fade-in duration-300">
      
      {/* Header & Progress */}
      <div className="w-full mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="bg-muted px-3 py-1 rounded-lg text-sm font-bold text-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <button 
            onClick={handleGenerate}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw size={14} /> Restart
          </button>
        </div>
        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-primary-500 h-full transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-full bg-card border shadow-sm rounded-3xl p-6 md:p-10 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-10 leading-tight text-foreground">{currentQ.question}</h2>
        
        <div className="space-y-4 mb-8">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedAnswers[currentIndex] === idx;
            const isCorrect = currentQ.correctAnswer === idx;
            const showAnswer = hasSelected;
            
            let btnClass = "border-border hover:border-primary-300 hover:bg-muted/50 text-foreground";
            let letterClass = "border-muted-foreground/30 text-muted-foreground bg-card";
            
            if (showAnswer) {
              if (isCorrect) {
                btnClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-medium shadow-sm ring-1 ring-emerald-500";
                letterClass = "border-emerald-500 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50";
              } else if (isSelected) {
                btnClass = "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-400 opacity-80 ring-1 ring-red-500";
                letterClass = "border-red-500 text-red-600 bg-red-100 dark:bg-red-900/50";
              } else {
                btnClass = "border-border opacity-50";
              }
            }

            return (
              <button
                key={idx}
                disabled={hasSelected}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${btnClass} ${!hasSelected && 'hover:scale-[1.01] active:scale-[0.99]'}`}
              >
                <div className={`w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${letterClass}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-lg">{opt}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showHint && !hasSelected && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-5 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-500 rounded-2xl border border-amber-200 dark:border-amber-800/30 flex gap-3 text-sm font-medium">
                <Lightbulb size={20} className="shrink-0 text-amber-500" />
                <p leading-relaxed>{currentQ.hint}</p>
              </div>
            </motion.div>
          )}

          {hasSelected && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-5 bg-muted/50 rounded-2xl border text-sm"
            >
              <p className="font-bold text-foreground mb-1">Explanation:</p>
              <p className="text-muted-foreground leading-relaxed">{currentQ.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center pt-6 border-t mt-auto">
          {!hasSelected ? (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-sm font-bold text-muted-foreground hover:text-amber-500 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted"
            >
              <Lightbulb size={18} /> {showHint ? 'Hide Hint' : 'Need a hint?'}
            </button>
          ) : (
            <div />
          )}
          
          <button
            onClick={handleNext}
            disabled={!hasSelected}
            className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all ${hasSelected ? 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/20 active:scale-95' : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'}`}
          >
            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            {currentIndex !== questions.length - 1 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
