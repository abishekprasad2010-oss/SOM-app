import React, { useState, useEffect } from 'react';
import { X, Sparkles, Volume2, Loader2, BookOpen, Lightbulb, ShieldAlert, Cpu } from 'lucide-react';
import { Question } from '../data/questions';

interface AIExplainerModalProps {
  question: Question | null;
  onClose: () => void;
  onSpeakExplanation: (text: string) => void;
}

export const AIExplainerModal: React.FC<AIExplainerModalProps> = ({
  question,
  onClose,
  onSpeakExplanation,
}) => {
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!question) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchExplanation = async () => {
      try {
        const res = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: question.question,
            answer: question.answer,
            category: question.category,
            topic: question.topic,
            formula: question.formula,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to retrieve concept explanation.');
        }

        const data = await res.json();
        if (isMounted) {
          setExplanation(data.explanation || 'No explanation returned.');
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Unable to generate explanation right now.');
          setIsLoading(false);
        }
      }
    };

    fetchExplanation();

    return () => {
      isMounted = false;
    };
  }, [question]);

  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-orange-400">Q{question.id}</span>
                <h3 className="text-sm font-bold text-white">AI Professor Explanation</h3>
              </div>
              <p className="text-[11px] text-slate-400">{question.category} • {question.topic}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Question Summary Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Question Statement</span>
            <p className="text-sm font-semibold text-slate-100 mt-1">
              {question.question}
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400">Correct Answer:</span>
                <span className="text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                  {question.answer}
                </span>
              </div>
              {question.formula && (
                <div className="text-xs font-mono text-cyan-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/50">
                  {question.formula}
                </div>
              )}
            </div>
          </div>

          {/* AI Generated Detailed Insights */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-xs text-slate-400 font-medium animate-pulse">
                Consulting Gemini 3.8 Flash for physical intuition & exam tricks...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              <p className="font-semibold mb-1">Notice</p>
              <p>{error}</p>
              <p className="mt-2 text-slate-400">
                Fallback Concept: {question.explanation}
              </p>
            </div>
          ) : (
            <div className="prose prose-invert prose-xs max-w-none space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
              <div className="bg-slate-850/50 border border-slate-800 p-4 rounded-2xl whitespace-pre-line font-normal text-slate-200">
                {explanation}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <button
            onClick={() => onSpeakExplanation(explanation || question.explanation)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Volume2 className="w-4 h-4" />
            <span>Read Explanation Aloud</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
