import { useState } from 'react';
import type { Note, Quiz as QuizType } from '../types';
import { generateQuiz } from '../lib/gemini';
import { Loader2, RefreshCw, HelpCircle, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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
    if (showResults) return;
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

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowHint(false);
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
      <div className="flex flex-col items-center justify-center h-64 text-primary-600 gap-4">
        <Loader2 size={40} className="animate-spin" />
        <p className="font-medium animate-pulse">Crafting your quiz...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-800/20">
        <HelpCircle className="text-slate-400 mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-2">No quiz available</h3>
        <p className="text-slate-500 mb-6 max-w-sm">
          Test your understanding with a custom-generated multiple choice quiz based on these notes.
        </p>
        <button 
          onClick={handleGenerate}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          Generate Quiz
        </button>
        {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center p-8 bg-card border rounded-2xl shadow-sm">
          <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
          <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary-500 to-indigo-600 my-6">
            {score} / {questions.length}
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            {percentage >= 80 ? 'Excellent work! You mastered this material.' : percentage >= 60 ? 'Good job! Keep reviewing to improve.' : 'Keep studying, you\'ll get it next time!'}
          </p>
          <button 
            onClick={handleGenerate}
            className="mt-6 flex items-center gap-2 mx-auto bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 px-6 py-3 rounded-full font-medium transition-colors"
          >
            <RefreshCw size={18} /> Take a New Quiz
          </button>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold border-b pb-2">Detailed Review</h3>
          {questions.map((q, idx) => {
            const isCorrect = selectedAnswers[idx] === q.correctAnswer;
            const didAnswer = selectedAnswers[idx] !== undefined;
            return (
              <div key={q.id} className={`p-6 border rounded-xl ${isCorrect ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'}`}>
                <div className="flex gap-4">
                  <div className="mt-1 shrink-0">
                    {isCorrect ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-4">{idx + 1}. {q.question}</p>
                    <div className="space-y-2 mb-4">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[idx] === optIdx;
                        const isActuallyCorrect = q.correctAnswer === optIdx;
                        let optionClass = 'border-slate-200 dark:border-slate-700 text-slate-500';
                        if (isActuallyCorrect) {
                          optionClass = 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/40 dark:border-green-800 dark:text-green-300 font-medium';
                        } else if (isSelected && !isCorrect) {
                          optionClass = 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/40 dark:border-red-800 dark:text-red-300 line-through opacity-70';
                        }
                        
                        return (
                          <div key={optIdx} className={`p-3 rounded-lg border ${optionClass}`}>
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                    {!didAnswer && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium mb-2">You didn't answer this question.</p>
                    )}
                    <div className="mt-4 p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-sm"><strong>Explanation:</strong> {q.explanation}</p>
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

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <span className="text-sm font-medium text-slate-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <button 
          onClick={handleGenerate}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <RefreshCw size={14} /> Regenerate
        </button>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-primary-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + (hasSelected ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="w-full bg-card border shadow-sm rounded-2xl p-6 md:p-8 mb-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-8">{currentQ.question}</h2>
        
        <div className="space-y-3 mb-6">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedAnswers[currentIndex] === idx ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {showHint && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-500 rounded-xl border border-yellow-200 dark:border-yellow-800 flex gap-3 text-sm animate-in fade-in">
            <Lightbulb size={18} className="shrink-0" />
            <p>{currentQ.hint}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-sm font-medium text-slate-500 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors flex items-center gap-1"
          >
            <Lightbulb size={16} /> Need a hint?
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
