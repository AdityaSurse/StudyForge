import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Part } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');

const generateWithRetry = async (model: any, request: any, retries = 1) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await model.generateContent(request);
    } catch (err: any) {
      const msg = err.message || '';
      if (i < retries && (msg.includes('429') || msg.includes('503') || msg.includes('overloaded'))) {
        await new Promise(r => setTimeout(r, 2000 * (i + 1))); // backoff
        continue;
      }
      if (msg.includes('400')) throw new Error('The AI rejected the input. The file might be too large or contain blocked content.');
      if (msg.includes('429')) throw new Error('AI rate limit exceeded. Please try again later.');
      throw new Error(msg || 'An unknown AI error occurred.');
    }
  }
};

export const generateNotes = async (
  content: string,
  _type: 'text' | 'youtube' | 'pdf',
  audioFile?: File
) => {
  if (!apiKey) throw new Error('Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env file.');
  
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  
  let parts: (string | Part)[] = [];
  
  const prompt = `You are an expert AI study assistant. Create comprehensive, well-structured study notes from the following content. 
Requirements for the notes:
- Use Markdown formatting with appropriate headings (##, ###).
- Use bullet points for readability.
- Create tables where it makes sense to compare concepts.
- **Bold** key terms.
- If there are mathematical equations or formulas, use KaTeX/LaTeX formatting wrapped in $ or $$ (e.g., $E=mc^2$).
- Make the notes concise but comprehensive.

Content:
${content}`;

  parts.push(prompt);

  if (audioFile) {
    const base64Data = await fileToBase64(audioFile);
    parts = [
      `You are an expert AI study assistant. Create comprehensive, well-structured study notes from the attached audio file. Follow the same Markdown and formatting requirements as for text.`,
      {
        inlineData: {
          data: base64Data.split(',')[1],
          mimeType: audioFile.type,
        },
      }
    ];
  }

  const result = await generateWithRetry(model, parts);
  return result.response.text();
};

export const generateFlashcards = async (notesContent: string) => {
  if (!apiKey) throw new Error('API key missing');
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-flash-latest',
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const prompt = `Generate 15-25 Q/A flashcards based on the following study notes.
Output strictly in JSON format as an array of objects, with each object having exactly two properties: "q" (the question string) and "a" (the answer string). Do not include any other markdown or text.

Notes:
${notesContent}`;

  const result = await generateWithRetry(model, prompt);
  const text = result.response.text();
  try {
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    console.error("Failed to parse flashcards JSON:", text);
    throw new Error('Failed to generate valid flashcards format.');
  }
};

export const generateQuiz = async (notesContent: string) => {
  if (!apiKey) throw new Error('API key missing');
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-flash-latest',
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const prompt = `Generate 10 multiple-choice questions based on the following study notes.
Output strictly in JSON format as an object with a "questions" array property. Each question object must have:
- "question" (string)
- "options" (array of exactly 4 strings)
- "correctAnswer" (integer, 0 to 3, representing the index of the correct option)
- "hint" (string, a small hint to help the user)
- "explanation" (string, explaining why the answer is correct)

Notes:
${notesContent}`;

  const result = await generateWithRetry(model, prompt);
  const text = result.response.text();
  try {
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    console.error("Failed to parse quiz JSON:", text);
    throw new Error('Failed to generate valid quiz format.');
  }
};

export const chatWithNotes = async (notesContent: string, history: {role: string, text: string}[], message: string) => {
  if (!apiKey) throw new Error('API key missing');
  
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  
  const systemInstruction = `You are a helpful study assistant. Answer the user's questions strictly based on the provided notes content. If the answer is not in the notes, say "I cannot find the answer to that in your notes."
  
Notes content:
${notesContent}`;

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemInstruction }] },
      { role: "model", parts: [{ text: "Understood. I will answer based on the notes." }] },
      ...history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      }))
    ],
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
