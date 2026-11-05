// Audio Service handling Gemini 3.8 Flash TTS and resilient browser fallback

export interface TTSRequest {
  text?: string;
  questionNumber?: number;
  questionText?: string;
  answerText?: string;
  voice?: string;
  mode?: 'single' | 'dialogue';
  style?: string;
}

export interface TTSResponse {
  audioUrl: string;
  isFallback: boolean;
}

const audioBlobCache = new Map<string, string>();

/**
 * Converts Base64 WAV string to an Object URL for high-performance audio playback
 */
function base64ToBlobUrl(base64Data: string, mimeType = 'audio/wav'): string {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Request speech audio from server endpoint using gemini-3.8-flash-tts
 */
export async function fetchTTSAudio(req: TTSRequest): Promise<TTSResponse> {
  const cacheKey = `${req.mode || 'single'}-${req.voice || 'Kore'}-${req.questionNumber || req.text}`;
  
  if (audioBlobCache.has(cacheKey)) {
    return {
      audioUrl: audioBlobCache.get(cacheKey)!,
      isFallback: false,
    };
  }

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(`TTS server responded with status: ${res.status}`);
    }

    const data = await res.json();
    if (data.audioData) {
      const url = base64ToBlobUrl(data.audioData, data.mimeType || 'audio/wav');
      audioBlobCache.set(cacheKey, url);
      return {
        audioUrl: url,
        isFallback: false,
      };
    }

    if (data.useClientFallback) {
      return {
        audioUrl: '',
        isFallback: true,
      };
    }

    throw new Error(data.error || 'No audio returned');
  } catch (err) {
    console.warn('TTS request fallback activated:', err);
    return {
      audioUrl: '',
      isFallback: true,
    };
  }
}

/**
 * Fallback browser speech synthesis for zero-friction offline/free mode
 */
export function playWebSpeechFallback(
  text: string,
  rate = 1.0,
  onEnd?: () => void,
  onStart?: () => void
): () => void {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported in this browser.');
    onEnd?.();
    return () => {};
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1.0;

  // Prefer English natural voices if available
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (e) => {
    console.error('Speech synthesis error', e);
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}
