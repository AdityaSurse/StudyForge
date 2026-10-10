# StudyForge
> Your AI-powered study workspace. Turn any material into smart notes, flashcards, and quizzes instantly.

![React](https://img.shields.io/badge/react-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/typescript-6-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Gemini AI](https://img.shields.io/badge/AI-Gemini_Flash-orange?style=flat-square&logo=google)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

<!-- Add screenshot: docs/screenshot.png -->

## Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements & Contact](#acknowledgements--contact)

---

## About
**StudyForge** is a fully client-side, privacy-focused AI study workspace designed for students and continuous learners. By leveraging the power of the Google Gemini API, it can ingest PDFs, YouTube transcripts, audio files, or raw text and automatically synthesize them into beautifully structured Markdown notes, interactive flashcards, and multiple-choice quizzes. It even includes a Chat panel so you can ask questions directly against your study materials.

---

## Features
- 📄 **Multi-format Uploads**: Upload PDFs, audio (MP3/WAV), paste raw text, or provide YouTube transcripts.
- 📝 **Smart Notes Generation**: Automatically generates Markdown-formatted notes with LaTeX math equations.
- 🗂️ **Interactive Flashcards**: 3D-flipping flashcard decks with spaced-repetition tracking (Got it / Review again).
- 🎓 **Quizzes with Confetti**: Auto-generates multiple-choice quizzes with hints, explanations, and score tracking.
- 💬 **Chat with Notes**: A sliding side panel that lets you query your current notes context directly.
- 💾 **Client-Side Persistence**: 100% local operation using `localStorage`. No database required.
- ✨ **Immersive UI**: Features a beautiful, animated WebGL "mesh drift" shader background and glassmorphism cards.
- 🎤 **Live Audio Recording**: Transcribe live lectures. *(Planned)*

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite 8 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4, Framer Motion, Lucide React |
| **AI Model** | Google Gemini API (`gemini-flash-latest`) via `@google/generative-ai` |
| **Parsing & Rendering** | PDF.js (`pdfjs-dist`), React Markdown, Remark/Rehype, KaTeX |
| **State Management** | React Hooks (`useState`, `useEffect`) + `localStorage` |
| **Backend / Database** | None (100% Client-Side) |

---

## Project Structure
\`\`\`text
StudyForge/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── ActionCard.tsx  # Dashboard feature buttons
│   │   ├── ChatPanel.tsx   # Sidebar for AI Q&A
│   │   ├── Flashcards.tsx  # 3D flashcard logic
│   │   ├── NoteViewer.tsx  # Main tabbed interface
│   │   ├── Quiz.tsx        # MCQ generator and player
│   │   ├── ShaderBackground.tsx # WebGL mesh drift animation
│   │   ├── Sidebar.tsx     # Navigation & folder tree
│   │   └── UploadArea.tsx  # Home screen dropzone & modal
│   ├── lib/
│   │   ├── gemini.ts       # Centralized Gemini API logic
│   │   └── store.ts        # LocalStorage state management hook
│   ├── App.tsx             # Root layout controller
│   ├── index.css           # Global styles and Tailwind entry
│   ├── main.tsx            # React DOM rendering
│   └── types.ts            # Global TypeScript interfaces
├── .env.example            # Example environment variables
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
└── vite.config.ts          # Vite bundler configuration
\`\`\`

---

## Getting Started

### Prerequisites
- Node.js (v24 or newer, matching package.json definitions)
- NPM or Yarn

### Installation
1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/AdityaSurse/StudyForge.git
   cd StudyForge
   \`\`\`
2. Install the dependencies:
   \`\`\`bash
   npm install
   \`\`\`

### Environment Variables
StudyForge requires a Google Gemini API key to function.

| Variable | Description | Required |
| :--- | :--- | :--- |
| \`VITE_GEMINI_API_KEY\` | Your Gemini API Key from Google AI Studio. | Yes |

1. Copy the example file to create your local `.env` file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
2. Add your key to the `.env` file. 
> **⚠️ WARNING:** Because this app is 100% client-side, the `VITE_` prefix exposes this key to the browser bundle. If deploying publicly, ensure you restrict your API key's HTTP referrers in the Google Cloud Console, or migrate the API calls to a secure backend wrapper.

### Run Locally
Start the Vite development server:
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build and Deploy (Vercel)
1. Build the project locally:
   \`\`\`bash
   npm run build
   \`\`\`
2. For Vercel deployment:
   - Import the GitHub repository into your Vercel dashboard.
   - In the **Environment Variables** section, add `VITE_GEMINI_API_KEY` with your actual key.
   - Click **Deploy**.

---

## Usage

1. **Upload Content**: On the home dashboard, click "Upload PDF", "Paste Text", or "Upload Audio".
2. **Generate Notes**: The Gemini AI will parse the content and generate structured Markdown notes. You can double-click to edit them.
3. **Study Flashcards**: Switch to the Flashcards tab to instantly generate a 15-25 card deck. Use the spacebar to flip and arrow keys to navigate.
4. **Take a Quiz**: Switch to the Quiz tab to generate a 10-question multiple-choice test based strictly on your notes.
5. **Chat with Notes**: Open the Chat Panel on the right side of the screen to ask specific questions about the material you uploaded.

---

## Screenshots

| Dashboard | Note Editor |
| :---: | :---: |
| <!-- Add screenshot: docs/dashboard.png --> | <!-- Add screenshot: docs/editor.png --> |
| **Flashcards** | **Quiz Mode** |
| <!-- Add screenshot: docs/flashcards.png --> | <!-- Add screenshot: docs/quiz.png --> |

---

## Roadmap
- [x] Initial UI setup & glassmorphism styling
- [x] Integrate Gemini Flash model
- [x] PDF parsing & Note Generation
- [x] 3D Flashcard Module
- [x] Interactive Quiz Module
- [x] Chat-with-Notes sidebar
- [x] WebGL Animated Background
- [ ] Live Audio Transcription via Mic
- [ ] Export to PDF / Notion
- [ ] Folder Management

---

## Contributing
Contributions are always welcome!

1. Fork the project
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

---

## License
Distributed under the MIT License. See \`LICENSE\` for more information.

---

## Acknowledgements & Contact
- Models powered by [Google Gemini](https://aistudio.google.com/)
- UI Icons by [Lucide](https://lucide.dev/)
- Confetti effects by [canvas-confetti](https://github.com/catdad/canvas-confetti)
- Shader background adapted from "Mesh drift".

**Aditya Surse** - [https://github.com/AdityaSurse](https://github.com/AdityaSurse)
