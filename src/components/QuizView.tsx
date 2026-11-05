import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  ArrowRight, 
  Flame,
  Award,
  BookOpen,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, SOM_QUESTIONS, CATEGORIES } from '../data/questions';

interface QuizViewProps {
  onPlayTTS: (q: Question) => void;
  onExplain: (q: Question) => void;
  isPlayingAudio: boolean;
  activeQuestionId: number | null;
  bookmarkedIds: number[];
}

export const QuizView: React.FC<QuizViewProps> = ({
  onPlayTTS,
  onExplain,
  isPlayingAudio,
  activeQuestionId,
  bookmarkedIds,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [quizPool, setQuizPool] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [autoSpeakQuestion, setAutoSpeakQuestion] = useState<boolean>(true);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<Question[]>([]);

  // Filter pool based on category or bookmarks
  const initQuiz = (category: string, onlyBookmarks = false) => {
    let pool = [...SOM_QUESTIONS];
    if (onlyBookmarks) {
      pool = pool.filter(q => bookmarkedIds.includes(q.id));
      if (pool.length === 0) pool = [...SOM_QUESTIONS];
    } else if (category !== 'All Categories') {
      pool = pool.filter(q => q.category === category);
    }

    // Shuffle question order for fresh active recall
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuizPool(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setQuizFinished(false);
    setWrongAnswers([]);
  };

  useEffect(() => {
    initQuiz(selectedCategory);
  }, [selectedCategory]);

  const currentQ = quizPool[currentIndex];

  // Shuffle options for current question
  useEffect(() => {
    if (currentQ) {
      setShuffledOptions([...currentQ.options].sort(() => Math.random() - 0.5));
      setSelectedOption(null);
      setIsAnswered(false);

      if (autoSpeakQuestion) {
        onPlayTTS(currentQ);
      }
    }
  }, [currentIndex, currentQ]);

  const handleSelectOption = (option: string) => {
    if (isAnswered || !currentQ) return;
    
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.answer;

    if (isCorrect) {
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);

      // Celebrate streaks with confetti
      if (newStreak > 0 && newStreak % 5 === 0) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } else {
      setStreak(0);
      setWrongAnswers(prev => [...prev, currentQ]);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < quizPool.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setQuizFinished(true);
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 },
      });
    }
  };

  if (!currentQ && !quizFinished) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>No questions found in this category.</p>
        <button 
          onClick={() => initQuiz('All Categories')}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold"
        >
          Reset to All Questions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4">
      {/* Quiz Category & Config Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 shadow-lg backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-orange-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500 font-medium"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSpeakQuestion}
                onChange={(e) => setAutoSpeakQuestion(e.target.checked)}
                className="rounded border-slate-700 text-orange-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                Auto-read question
              </span>
            </label>

            <button
              onClick={() => initQuiz(selectedCategory)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>

        </div>

        {/* Progress & Live Score Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Question <strong className="text-white">{currentIndex + 1}</strong> of <strong className="text-white">{quizPool.length}</strong>
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Score: {score}
            </span>
            {streak > 1 && (
              <span className="flex items-center gap-1 text-amber-400 font-bold animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {streak} Streak!
              </span>
            )}
          </div>

          <span className="text-slate-500 text-[11px] font-mono">
            {Math.round(((currentIndex + 1) / quizPool.length) * 100)}% Completed
          </span>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / quizPool.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Quiz Finished Summary View */}
      {quizFinished ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
            <Trophy className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Quiz Completed!</h2>
          <p className="text-slate-400 text-sm mb-6">
            You scored <strong className="text-emerald-400 font-bold">{score}</strong> out of <strong className="text-white">{quizPool.length}</strong> ({Math.round((score / quizPool.length) * 100)}% accuracy).
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto mb-6 text-center">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="text-[11px] text-slate-400">Accuracy</span>
              <p className="text-lg font-bold text-white mt-0.5">
                {Math.round((score / quizPool.length) * 100)}%
              </p>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="text-[11px] text-slate-400">Best Streak</span>
              <p className="text-lg font-bold text-amber-400 mt-0.5">
                {highestStreak} 🔥
              </p>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400">Questions Answered</span>
              <p className="text-lg font-bold text-cyan-400 mt-0.5">
                {quizPool.length}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => initQuiz(selectedCategory)}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/25 transition-all"
            >
              Retry Quiz
            </button>
            {wrongAnswers.length > 0 && (
              <button
                onClick={() => {
                  setQuizPool([...wrongAnswers]);
                  setCurrentIndex(0);
                  setSelectedOption(null);
                  setIsAnswered(false);
                  setScore(0);
                  setStreak(0);
                  setQuizFinished(false);
                  setWrongAnswers([]);
                }}
                className="px-5 py-2.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 rounded-xl font-bold text-sm transition-all"
              >
                Review {wrongAnswers.length} Mistakes
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Active Quiz Question Card */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative">
          
          {/* Question Header & Spoken trigger */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-lg text-xs font-bold">
                Q{currentQ.id}
              </span>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {currentQ.category}
              </span>
            </div>

            <button
              onClick={() => onPlayTTS(currentQ)}
              title="Hear question audio"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeQuestionId === currentQ.id && isPlayingAudio
                  ? 'bg-orange-500 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeQuestionId === currentQ.id && isPlayingAudio ? 'Playing...' : 'Read Aloud'}</span>
            </button>
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Formula pill */}
          {currentQ.formula && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-950/40 border border-blue-800/40 rounded-lg text-xs font-mono text-cyan-300">
              <span className="text-blue-400 font-sans text-[10px] font-bold uppercase">Formula:</span>
              <span>{currentQ.formula}</span>
            </div>
          )}

          {/* 4 Interactive Option Buttons */}
          <div className="grid grid-cols-1 gap-2.5 my-6">
            {shuffledOptions.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQ.answer;

              let btnStyle = "bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 text-slate-200 hover:border-slate-600";

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold ring-1 ring-emerald-500/40";
                } else if (isSelected) {
                  btnStyle = "bg-rose-950/60 border-rose-500 text-rose-200 line-through ring-1 ring-rose-500/40";
                } else {
                  btnStyle = "bg-slate-800/20 border-slate-800/40 text-slate-500 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 text-xs flex items-center justify-center font-mono text-slate-300 flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
          {isAnswered && (
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="text-xs">
                {selectedOption === currentQ.answer ? (
                  <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Correct! Spot on.
                  </p>
                ) : (
                  <p className="text-rose-400 font-bold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    Incorrect! The correct answer is: <span className="text-emerald-400 underline ml-1">{currentQ.answer}</span>
                  </p>
                )}
                <p className="text-slate-400 text-xs mt-1 max-w-lg">
                  {currentQ.explanation}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onExplain(currentQ)}
                  className="px-3 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Explain Concept</span>
                </button>

                <button
                  onClick={handleNext}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 flex items-center gap-1.5 transition-all"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
