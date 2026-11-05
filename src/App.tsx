import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Bookmark, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Eye, 
  EyeOff, 
  ArrowUpDown, 
  BookOpen,
  Headphones,
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';

import { SOM_QUESTIONS, Question, CATEGORIES } from './data/questions';
import { Header, TabType } from './components/Header';
import { QuestionCard } from './components/QuestionCard';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { QuizView } from './components/QuizView';
import { FormulasView } from './components/FormulasView';
import { PlaylistMarathonView } from './components/PlaylistMarathonView';
import { AIExplainerModal } from './components/AIExplainerModal';
import { ScriptExportModal } from './components/ScriptExportModal';
import { fetchTTSAudio, playWebSpeechFallback } from './services/audioService';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('script');

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [onlyBookmarks, setOnlyBookmarks] = useState<boolean>(false);
  const [revealedByDefault, setRevealedByDefault] = useState<boolean>(false);

  // Audio & Playback State
  const [currentQuestion, setCurrentQuestion] = useState<Question>(SOM_QUESTIONS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [voice, setVoice] = useState<string>('Kore');
  const [audioMode, setAudioMode] = useState<'single' | 'dialogue'>('single');
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [autoplay, setAutoplay] = useState<boolean>(false);
  const [answerDelay, setAnswerDelay] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals & Storage
  const [explainerQuestion, setExplainerQuestion] = useState<Question | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('som_bookmarks');
      return saved ? JSON.parse(saved) : [5, 23, 44, 66, 86]; // defaults to high-yield questions
    } catch {
      return [5, 23, 44, 66, 86];
    }
  });

  // Audio element reference & cleanup
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('som_bookmarks', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.warn('Unable to save bookmarks to localStorage', e);
    }
  }, [bookmarkedIds]);

  const toggleBookmark = (id: number) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Stop currently playing audio
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (cancelSpeechRef.current) {
      cancelSpeechRef.current();
      cancelSpeechRef.current = null;
    }
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    setIsPlaying(false);
  };

  // Play question audio using Gemini 3.8 Flash TTS with resilient fallback
  const playQuestionAudio = async (question: Question) => {
    stopAudio();
    setCurrentQuestion(question);
    setIsLoadingAudio(true);

    try {
      let promptText = question.audioPrompt;
      
      // If answer delay is active, we can separate question from answer
      if (answerDelay > 0 && audioMode === 'single') {
        promptText = `Question ${question.id}. ${question.question}`;
      }

      const res = await fetchTTSAudio({
        text: promptText,
        questionNumber: question.id,
        questionText: question.question,
        answerText: question.answer,
        voice: voice,
        mode: audioMode,
      });

      setIsLoadingAudio(false);

      if (res.audioUrl && !res.isFallback) {
        // Play synthesized Gemini 3.8 Flash TTS WAV
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        const audio = audioRef.current;
        audio.src = res.audioUrl;
        audio.playbackRate = playbackRate;
        audio.muted = isMuted;

        audio.onended = () => {
          if (answerDelay > 0 && audioMode === 'single') {
            // Wait for delay, then play the answer
            delayTimerRef.current = setTimeout(async () => {
              const answerPrompt = `The correct answer is: ${question.answer}.`;
              const ansRes = await fetchTTSAudio({
                text: answerPrompt,
                voice: voice,
                mode: 'single',
              });

              if (ansRes.audioUrl) {
                audio.src = ansRes.audioUrl;
                audio.playbackRate = playbackRate;
                audio.muted = isMuted;
                audio.onended = () => {
                  handlePlaybackFinished(question.id);
                };
                audio.play();
              } else {
                handlePlaybackFinished(question.id);
              }
            }, answerDelay * 1000);
          } else {
            handlePlaybackFinished(question.id);
          }
        };

        await audio.play();
        setIsPlaying(true);
      } else {
        // Fallback to browser Web Speech API
        const cancel = playWebSpeechFallback(
          question.audioPrompt,
          playbackRate,
          () => handlePlaybackFinished(question.id),
          () => setIsPlaying(true)
        );
        cancelSpeechRef.current = cancel;
      }
    } catch (err) {
      console.error('Audio playback error', err);
      setIsLoadingAudio(false);
      setIsPlaying(false);
    }
  };

  // Called when audio finishes
  const handlePlaybackFinished = (finishedId: number) => {
    setIsPlaying(false);
    if (autoplay) {
      const nextIndex = SOM_QUESTIONS.findIndex((q) => q.id === finishedId) + 1;
      if (nextIndex < SOM_QUESTIONS.length) {
        setTimeout(() => {
          playQuestionAudio(SOM_QUESTIONS[nextIndex]);
        }, 800);
      }
    }
  };

  // Play custom arbitrary spoken text (e.g. for Formulas or AI Explanations)
  const speakCustomText = async (text: string, title?: string) => {
    stopAudio();
    setIsLoadingAudio(true);

    try {
      const res = await fetchTTSAudio({
        text: text,
        voice: voice,
        mode: 'single',
      });

      setIsLoadingAudio(false);

      if (res.audioUrl && !res.isFallback) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        const audio = audioRef.current;
        audio.src = res.audioUrl;
        audio.playbackRate = playbackRate;
        audio.muted = isMuted;
        audio.onended = () => setIsPlaying(false);
        await audio.play();
        setIsPlaying(true);
      } else {
        const cancel = playWebSpeechFallback(
          text,
          playbackRate,
          () => setIsPlaying(false),
          () => setIsPlaying(true)
        );
        cancelSpeechRef.current = cancel;
      }
    } catch (err) {
      console.error('TTS error', err);
      setIsLoadingAudio(false);
      setIsPlaying(false);
    }
  };

  // Audio Player Bar event handlers
  const handlePlayPause = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playQuestionAudio(currentQuestion);
    }
  };

  const handleNext = () => {
    const currentIndex = SOM_QUESTIONS.findIndex((q) => q.id === currentQuestion.id);
    if (currentIndex + 1 < SOM_QUESTIONS.length) {
      playQuestionAudio(SOM_QUESTIONS[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const currentIndex = SOM_QUESTIONS.findIndex((q) => q.id === currentQuestion.id);
    if (currentIndex > 0) {
      playQuestionAudio(SOM_QUESTIONS[currentIndex - 1]);
    }
  };

  const handleReplay = () => {
    playQuestionAudio(currentQuestion);
  };

  // Update speed in real time
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Update mute in real time
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Filter questions for the Script feed
  const filteredQuestions = SOM_QUESTIONS.filter((q) => {
    const matchesCategory =
      selectedCategory === 'All Categories' || q.category === selectedCategory;
    const matchesBookmark = !onlyBookmarks || bookmarkedIds.includes(q.id);

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory && matchesBookmark;

    const matchesSearch =
      q.id.toString() === query ||
      q.question.toLowerCase().includes(query) ||
      q.answer.toLowerCase().includes(query) ||
      q.topic.toLowerCase().includes(query) ||
      (q.formula && q.formula.toLowerCase().includes(query));

    return matchesCategory && matchesBookmark && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col pb-28">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(t) => {
          if (t === 'export') {
            setIsExportModalOpen(true);
          } else {
            setActiveTab(t);
          }
        }}
        voice={voice}
        setVoice={setVoice}
        bookmarkedCount={bookmarkedIds.length}
        totalQuestions={SOM_QUESTIONS.length}
        completedQuizCount={0}
        isPlaying={isPlaying}
        currentQNum={currentQuestion.id}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: 100 AUDIO SCRIPT & REVISION FEED */}
        {activeTab === 'script' && (
          <div>
            {/* Hero Revision Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by keyword, formula, or question number (e.g. hoop stress, 44, torsion)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Controls: Reveal All Answers & Bookmark filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setRevealedByDefault(!revealedByDefault)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      revealedByDefault
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {revealedByDefault ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{revealedByDefault ? 'Hide All Answers' : 'Reveal All Answers'}</span>
                  </button>

                  <button
                    onClick={() => setOnlyBookmarks(!onlyBookmarks)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      onlyBookmarks
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarks ? 'fill-current text-amber-400' : ''}`} />
                    <span>Saved ({bookmarkedIds.length})</span>
                  </button>
                </div>

              </div>

              {/* Category Pills Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const count =
                    cat === 'All Categories'
                      ? SOM_QUESTIONS.length
                      : SOM_QUESTIONS.filter((q) => q.category === cat).length;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-black/20 text-white' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Results Counter Bar */}
            <div className="flex items-center justify-between mb-4 px-1 text-xs text-slate-400">
              <span>
                Showing <strong className="text-white">{filteredQuestions.length}</strong> of 100 questions
              </span>
              <span className="flex items-center gap-1 text-orange-400">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini 3.8 Flash TTS Voice: <strong>{voice}</strong>
              </span>
            </div>

            {/* Questions Grid */}
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
                <p className="text-slate-400 text-sm">No questions matched your search criteria.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Categories');
                    setOnlyBookmarks(false);
                  }}
                  className="mt-3 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    isCurrentPlaying={isPlaying && currentQuestion.id === q.id}
                    isLoadingAudio={isLoadingAudio && currentQuestion.id === q.id}
                    onPlay={playQuestionAudio}
                    onExplain={(qToExplain) => setExplainerQuestion(qToExplain)}
                    isBookmarked={bookmarkedIds.includes(q.id)}
                    onToggleBookmark={toggleBookmark}
                    revealedByDefault={revealedByDefault}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERACTIVE QUIZ MODE */}
        {activeTab === 'quiz' && (
          <QuizView
            onPlayTTS={playQuestionAudio}
            onExplain={(q) => setExplainerQuestion(q)}
            isPlayingAudio={isPlaying}
            activeQuestionId={currentQuestion?.id ?? null}
            bookmarkedIds={bookmarkedIds}
          />
        )}

        {/* TAB 3: HIGH YIELD FORMULAS */}
        {activeTab === 'formulas' && (
          <FormulasView
            onSpeakText={speakCustomText}
            isPlayingAudio={isPlaying}
          />
        )}

        {/* TAB 4: MARATHON AUDIO PLAYLIST */}
        {activeTab === 'playlist' && (
          <PlaylistMarathonView
            questions={SOM_QUESTIONS}
            currentQuestionId={currentQuestion.id}
            isPlaying={isPlaying}
            isLoading={isLoadingAudio}
            onSelectAndPlay={(q) => {
              setAutoplay(true);
              playQuestionAudio(q);
            }}
            onTogglePlayPause={handlePlayPause}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            answerDelay={answerDelay}
            setAnswerDelay={setAnswerDelay}
          />
        )}

      </main>

      {/* Sticky Bottom Audio Player Bar */}
      <AudioPlayerBar
        currentQuestion={currentQuestion}
        isPlaying={isPlaying}
        isLoading={isLoadingAudio}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onReplay={handleReplay}
        autoplay={autoplay}
        setAutoplay={setAutoplay}
        playbackRate={playbackRate}
        setPlaybackRate={setPlaybackRate}
        audioMode={audioMode}
        setAudioMode={setAudioMode}
        answerDelay={answerDelay}
        setAnswerDelay={setAnswerDelay}
        totalQuestions={SOM_QUESTIONS.length}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* AI Concept Explainer Modal (Powered by gemini-3.8-flash) */}
      {explainerQuestion && (
        <AIExplainerModal
          question={explainerQuestion}
          onClose={() => setExplainerQuestion(null)}
          onSpeakExplanation={speakCustomText}
        />
      )}

      {/* Audio Script Export Modal */}
      {isExportModalOpen && (
        <ScriptExportModal onClose={() => setIsExportModalOpen(false)} />
      )}
    </div>
  );
}
