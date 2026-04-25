import React, { useState, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import { StyleData } from '../../types';

interface StyleSelectorProps {
  styles: StyleData[];
  selectedStyle: string;
  onSelect: (name: string) => void;
  label?: string;
  sideColor?: 'red' | 'neutral';
}

const TYPE_COLORS: Record<string, string> = {
  'Offensive': 'text-orange-400 border-orange-900/50 bg-orange-950/20',
  'Counter-Offensive': 'text-sky-400 border-sky-900/50 bg-sky-950/20',
  'Defensive': 'text-emerald-400 border-emerald-900/50 bg-emerald-950/20',
};

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  styles,
  selectedStyle,
  onSelect,
  label,
  sideColor = 'neutral',
}) => {
  const [search, setSearch] = useState('');

  const filteredStyles = useMemo(() => {
    return styles.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.type?.toLowerCase().includes(search.toLowerCase())
    );
  }, [styles, search]);

  const activeBorderColor = sideColor === 'red' ? 'border-red-600' : 'border-white';
  const activeGlow = sideColor === 'red' ? 'shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'shadow-[0_0_15px_rgba(255,255,255,0.1)]';

  return (
    <div className="space-y-4">
      {label && (
        <label className={`text-xs font-bold uppercase tracking-widest block ${sideColor === 'red' ? 'text-red-500' : 'text-neutral-400'}`}>
          {label}
        </label>
      )}

      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-red-500 transition-colors" size={16} />
        <input
          type="text"
          placeholder="Search styles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-neutral-800 focus:border-red-900/50 text-sm py-2.5 pl-10 pr-4 outline-none transition-all placeholder:text-neutral-700"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredStyles.map((style) => {
          const isSelected = style.name === selectedStyle;
          const typeColor = style.type ? TYPE_COLORS[style.type] : 'text-neutral-400 border-neutral-700 bg-neutral-900/20';

          return (
            <button
              key={style.name}
              onClick={() => onSelect(style.name)}
              className={`relative flex flex-col items-start p-3 border text-left transition-all group ${
                isSelected
                  ? `${activeBorderColor} bg-neutral-900 ${activeGlow}`
                  : 'border-neutral-900 bg-[#070707] hover:border-neutral-700'
              }`}
            >
              <div className="flex justify-between items-start w-full mb-2">
                <span className={`text-[9px] font-black uppercase tracking-tighter border px-1 py-0.5 rounded-sm ${typeColor}`}>
                  {style.type || 'Unknown'}
                </span>
                {isSelected && <Check size={12} className={sideColor === 'red' ? 'text-red-500' : 'text-white'} />}
              </div>

              {/* Style Image Preview */}
              <div className="w-full h-12 mb-2 bg-neutral-950 overflow-hidden border border-neutral-800/30">
                <img 
                  src={`${import.meta.env.BASE_URL}images/styles/${style.name.toLowerCase().replace(/ /g, '_')}.png`} 
                  alt={style.name}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              
              <span className={`text-[10px] font-black uppercase tracking-wider truncate w-full ${isSelected ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
                {style.name}
              </span>

              {/* Selection Indicator */}
              {isSelected && (
                <div className={`absolute bottom-0 left-0 h-1 w-full ${sideColor === 'red' ? 'bg-red-600' : 'bg-white'}`} />
              )}
            </button>
          );
        })}
      </div>
      
      {filteredStyles.length === 0 && (
        <div className="py-8 text-center border border-dashed border-neutral-800">
          <p className="text-neutral-600 text-xs font-mono uppercase tracking-widest">No styles found</p>
        </div>
      )}
    </div>
  );
};
