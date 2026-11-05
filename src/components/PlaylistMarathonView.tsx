import React from 'react';
import { 
  Play, 
  Pause, 
  Headphones, 
  Bookmark, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ListOrdered,
  Shuffle
} from 'lucide-react';
import { Question, CATEGORIES } from '../data/questions';

interface PlaylistMarathonViewProps {
  questions: Question[];
  currentQuestionId: number | null;
  isPlaying: boolean;
  isLoading: boolean;
  onSelectAndPlay: (q: Question) => void;
  onTogglePlayPause: () => void;
  bookmarkedIds: number[];
  onToggleBookmark: (id: number) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  answerDelay: number;
  setAnswerDelay: (val: number) => void;
}

export const PlaylistMarathonView: React.FC<PlaylistMarathonViewProps> = ({
  questions,
  currentQuestionId,
  isPlaying,
  isLoading,
  onSelectAndPlay,
  onTogglePlayPause,
  bookmarkedIds,
  onToggleBookmark,
  selectedCategory,
  setSelectedCategory,
  answerDelay,
  setAnswerDelay,
}) => {
  const filteredQuestions = questions.filter(
    (q) => selectedCategory === 'All Categories' || q.category === selectedCategory
  );

  return (
    <div className="max-w-5xl mx-auto py-4">
      {/* Marathon Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold rounded-full mb-3">
              <Headphones className="w-3.5 h-3.5" />
              <span>Hands-Free Audio Marathon</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Listen & Master All 100 Questions
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl leading-relaxed">
              Continuous playback mode is ideal for daily commutes, workouts, or bedside revision. Set an active recall pause to test your mind before the answer is revealed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Play/Pause Master */}
            <button
              onClick={onTogglePlayPause}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Marathon</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span>Start Marathon</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Marathon Config Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Filter Playlist:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recall Pause:</span>
            </span>
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              {[0, 2, 3, 5].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setAnswerDelay(sec)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    answerDelay === sec
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sec === 0 ? 'Instant' : `${sec}s`}
                </button>
              ))}
            </div>
          </div>

          <div className="text-slate-400 font-medium">
            <span>Showing <strong className="text-white">{filteredQuestions.length}</strong> items in queue</span>
          </div>

        </div>
      </div>

      {/* Playlist Queue */}
      <div className="space-y-2">
        {filteredQuestions.map((q, idx) => {
          const isSelected = currentQuestionId === q.id;
          const isBookmarked = bookmarkedIds.includes(q.id);

          return (
            <div
              key={q.id}
              onClick={() => onSelectAndPlay(q)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-800/95 border-orange-500/70 shadow-lg shadow-orange-500/10'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isSelected 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {q.id}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {q.category}
                    </span>
                    {q.formula && (
                      <span className="text-[10px] text-cyan-400 font-mono hidden sm:inline truncate max-w-xs">
                        {q.formula}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium truncate mt-0.5">
                    {q.question}
                  </p>
                  <p className="text-xs text-emerald-400 font-semibold truncate mt-0.5">
                    Ans: {q.answer}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(q.id);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-slate-600 hover:text-slate-300'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>

                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected && isPlaying ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isSelected && isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
