import React from 'react';
import { Layers, Volume2, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { SOM_FORMULAS, SOMFormula } from '../data/formulas';

interface FormulasViewProps {
  onSpeakText: (text: string, title: string) => void;
  isPlayingAudio: boolean;
}

export const FormulasView: React.FC<FormulasViewProps> = ({
  onSpeakText,
  isPlayingAudio,
}) => {
  return (
    <div className="max-w-6xl mx-auto py-4">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Strength of Materials High-Yield Formulas</h2>
            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-semibold rounded-full">
              Exam Sheet
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Master governing formulas frequently tested across 1-mark questions. Click the audio button to hear the mathematical verbalization!
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/60">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Formulas are spoken using standard engineering phrasing.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOM_FORMULAS.map((item) => (
          <div 
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
          >
            <div>
              {/* Category & Badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.importance === 'Critical'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {item.importance} Yield
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-white mb-3">
                {item.name}
              </h3>

              {/* Formula display box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mb-4 text-center">
                <span className="font-mono text-base sm:text-lg font-bold text-amber-300 tracking-wide select-all">
                  {item.formula}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                {item.description}
              </p>

              {/* Variables breakdown */}
              <div className="bg-slate-800/40 border border-slate-800/80 rounded-xl p-3 mb-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Variables:</span>
                {item.variables.map((v, i) => (
                  <div key={i} className="flex items-baseline text-xs gap-2">
                    <span className="font-mono font-bold text-cyan-400 w-6 flex-shrink-0">{v.symbol}</span>
                    <span className="text-slate-400 text-[11px]">{v.meaning}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Pronunciation Button */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 italic truncate max-w-[220px]">
                "{item.spokenText}"
              </span>

              <button
                onClick={() => onSpeakText(item.spokenText, item.name)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-semibold transition-all"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Formula</span>
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
