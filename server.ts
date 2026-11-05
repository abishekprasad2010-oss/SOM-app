import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Support Cloud Run / dynamic container deployment PORT environment variable
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint for Cloud Run deployment probes
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In-memory audio cache to prevent redundant generation and enhance responsiveness
const audioCache = new Map<string, string>();

// Initialize GoogleGenAI client with required header
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (initErr) {
    console.warn('Failed to initialize GoogleGenAI client:', initErr);
  }
}

/**
 * Text-to-Speech Endpoint using gemini-3.8-flash-tts
 */
app.post('/api/tts', async (req, res) => {
  try {
    const { 
      text, 
      questionNumber, 
      questionText, 
      answerText, 
      voice = 'Kore', 
      mode = 'single', 
      style = 'clear, professional engineering professor' 
    } = req.body;

    if (!text && (!questionText || !answerText)) {
      return res.status(400).json({ error: 'Text or question/answer content is required.' });
    }

    const cacheKey = `${mode}-${voice}-${questionNumber || text}`;
    if (audioCache.has(cacheKey)) {
      return res.json({
        audioData: audioCache.get(cacheKey),
        mimeType: 'audio/wav',
        cached: true,
      });
    }

    if (!aiClient) {
      return res.status(200).json({
        useClientFallback: true,
        message: 'Gemini API key not configured or client uninitialized. Using browser voice.',
      });
    }

    let response;

    if (mode === 'dialogue') {
      // Dual-speaker dialogue: Tutor asking, Student answering with natural study cadence
      const qNumStr = questionNumber ? `Question ${questionNumber}. ` : '';
      const tutorText = `Professor: ${qNumStr}${questionText || text}`;
      const studentText = `Student: <breath> The correct answer is: ${answerText || text}. |mhm| That is correct!`;

      response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: tutorText,
                speechMetadata: {
                  speaker: 'Professor',
                  style: 'Authoritative, calm, clear mechanical engineering professor',
                },
              },
              {
                text: studentText,
                speechMetadata: {
                  speaker: 'Student',
                  style: 'Attentive, confident, enthusiastic engineering student',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: 'Professor',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice || 'Fenrir' },
                  },
                },
                {
                  speaker: 'Student',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                  },
                },
              ],
            },
          },
        },
      });
    } else {
      // Single speaker: Clear, pedagogical professor reading
      const spokenScript = text || `Question ${questionNumber}. ${questionText} The correct answer is: ${answerText}.`;

      response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: spokenScript,
                speechMetadata: {
                  speaker: 'Lecturer',
                  style: style || 'Clear, articulate, pedagogical engineering lecturer',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
            },
          },
        },
      });
    }

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('No audio content returned by gemini-3.8-flash-tts');
    }

    // Cache the resulting WAV base64
    audioCache.set(cacheKey, base64Audio);

    return res.json({
      audioData: base64Audio,
      mimeType: 'audio/wav',
      cached: false,
    });
  } catch (error: any) {
    console.warn('Gemini 3.8 Flash TTS request failed or blocked:', error?.message || error);
    // Gracefully signal the client to use browser SpeechSynthesis so the user experience is uninterrupted
    return res.status(200).json({
      useClientFallback: true,
      error: error?.message || 'TTS service unavailable, using browser speech engine',
    });
  }
});

/**
 * AI Professor Concept Explainer using gemini-3.8-flash
 */
app.post('/api/explain', async (req, res) => {
  try {
    const { question, answer, category, topic, formula } = req.body;

    if (!aiClient) {
      return res.status(200).json({
        explanation: `### Core Concept\n${question} → **${answer}**\n\nThis is a standard 1-mark requirement in **${category}** (${topic}).\n\n*Note: Configure or select a verified Gemini API Key to enable extended interactive AI explanations.*`,
      });
    }

    const prompt = `You are a distinguished Professor of Mechanical Engineering and Strength of Materials (Mechanics of Solids).
Provide a concise, crystal-clear, intuitive explanation for this exam question.

Question: "${question}"
Correct Answer: "${answer}"
Category: "${category}"
Topic: "${topic}"
${formula ? `Governing Formula: "${formula}"` : ''}

Respond in clean markdown formatted with these 4 brief sections:
1. **Core Concept & Physical Intuition**: Why this answer holds true from physics/mechanics perspective.
2. **Governing Formula & Key Terms**: Mathematical definition and relationship (with SI units).
3. **Real-World Engineering Application**: Practical component (e.g. shafts, pressure vessels, bolts, springs, aircraft).
4. **Exam Memory Trick / Common Trap**: Mnemonic or high-yield rule to remember during 1-mark competitive exams.

Keep it sharp, engaging, and under 250 words total.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const explanation = response.text || `### Core Concept\n${question} → **${answer}** (${topic})`;

    return res.json({
      explanation,
    });
  } catch (error: any) {
    console.warn('Error in /api/explain:', error?.message || error);
    const { question, answer, topic, formula } = req.body;
    // Provide structured fallback without crashing
    const fallbackText = `### Core Concept & Physical Intuition\n**${question}** leads directly to **${answer}**.\n\n### Governing Formula / Principle\n${formula ? `Formula: \`${formula}\`` : `Topic: ${topic}`}\n\n### Practical Application\nWidely applied in structural mechanical design, failure prevention, and materials specification for load-bearing members.\n\n### Exam Memory Tip\nRemember the fundamental definition for 1-mark rapid recall under exam timing.`;

    return res.status(200).json({
      explanation: fallbackText,
      warning: error?.message,
    });
  }
});

/**
 * Setup dev/production static and Vite middlewares
 */
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SOM AudioMaster server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
