export type Note = {
  id: string;
  title: string;
  content: string;
  flashcards?: Flashcard[];
  quiz?: Quiz;
  createdAt: number;
  updatedAt: number;
  folder: string;
};

export type Flashcard = {
  id: string;
  q: string;
  a: string;
  nextReview: number;
  interval: number;
};

export type Quiz = {
  questions: QuizQuestion[];
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  hint: string;
  explanation: string;
};
