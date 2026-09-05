import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Lazy initialize Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    genAIClient = new GoogleGenAI({ apiKey: key });
  }
  return genAIClient;
}

// Map reflection mode to tailored system guidance
function getSystemInstruction(mode: string): string {
  const baseInstruction = `You are Solitude AI, a compassionate, thoughtful, and deeply empathetic personal reflection and journaling partner.
Your role is to listen attentively, validate the user's emotions, encourage constructive self-discovery, and help the user find clarity and emotional grounding.
Maintain a warm, calm, supportive, non-clinical, and authentic tone. Never be dismissive, robotic, or preachy. Keep responses focused and digestible (around 2-4 paragraphs).`;

  switch (mode) {
    case 'summarize':
      return `${baseInstruction}
Focus mode: Summarization. Identify the core emotional themes, key insights, and central takeaways from what the user shared. Provide a gentle, clear distillation of their thoughts.`;
    case 'brainstorm':
      return `${baseInstruction}
Focus mode: Brainstorming. Offer creative, gentle perspectives, alternative reframing, and constructive small possibilities without imposing answers or giving unsolicited rigid advice.`;
    case 'explore':
      return `${baseInstruction}
Focus mode: Socratic Exploration. Ask 2-3 deep, open-ended, and illuminating questions that invite the user to look beneath the surface of their initial feelings and uncover root motivations.`;
    case 'reflect':
    default:
      return `${baseInstruction}
Focus mode: Deep Reflection. Reflect back the emotional essence of what was written with empathy and insight, offering a safe space to process and breathe.`;
  }
}

// POST /api/reflect - Secure Gemini reflection endpoint
app.post('/api/reflect', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Missing Bearer token.' });
    }

    const { prompt, mode = 'reflect', history = [] } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ message: 'Prompt is required and must be a non-empty string.' });
    }

    if (prompt.length > 8000) {
      return res.status(400).json({ message: 'Prompt exceeds maximum length limit of 8000 characters.' });
    }

    // Prepare contents with conversation history
    const contents: any[] = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item && item.text && typeof item.text === 'string') {
          contents.push({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt.trim() }],
    });

    const ai = getGeminiClient();
    const systemInstruction = getSystemInstruction(mode);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'Thank you for sharing your thoughts. What aspect of this would you like to explore deeper?';

    return res.json({
      text: replyText,
      mode,
    });
  } catch (error: any) {
    console.error('Reflection API Error:', error);
    const statusCode = error.message?.includes('GEMINI_API_KEY') ? 503 : 500;
    return res.status(statusCode).json({
      message: error.message || 'Failed to generate reflection.',
    });
  }
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
