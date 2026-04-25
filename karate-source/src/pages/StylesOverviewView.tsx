import React, { useState, useMemo } from 'react';
import { ChevronRight, Search, X } from 'lucide-react';
import Card from '../components/ui/Card';
import SectionHeader from '../components/ui/SectionHeader';
import stylesData from '../data/styleStats.json';
import type { StyleData } from '../types';

const styles = stylesData as unknown as StyleData[];


interface StylesOverviewViewProps {
  navigate: (view: string, name?: string) => void;
}

const StylesOverviewView: React.FC<StylesOverviewViewProps> = ({ navigate }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return styles;
    return styles.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div>
      <SectionHeader
        title="Fighting Styles"
        subtitle="Browse and analyze every martial art available in Karate!."
        kanji="流派"
      />

      {/* Search / Filter Bar */}
      <div className="flex gap-4 mb-10">
        <div className="relative flex-grow">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none"
            size={18}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search styles..."
            className="w-full bg-[#0a0a0a] border-2 border-neutral-800 text-white font-mono tracking-wide rounded-none pl-12 pr-10 py-4 focus:outline-none focus:border-red-600 transition-colors placeholder:text-neutral-700"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Style Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((style, i) => (
            <Card key={style.name} onClick={() => navigate('details', style.name)}>
              {/* Style thumbnail — shows image if available, placeholder otherwise */}
              <div className="h-36 mb-6 relative overflow-hidden bg-[#050505] border border-neutral-800/50 flex items-center justify-center">
                <img
                  src={`${import.meta.env.BASE_URL}images/styles/${style.name.toLowerCase().replace(/ /g, '_')}.png`}
                  alt={style.name}
                  className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 transition-all duration-500 scale-110 group-hover:scale-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).parentElement!.classList.add('bg-neutral-900');
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                
                {/* Fallback pattern (visible if image fails) */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]"
                  style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-red-600 tracking-widest uppercase">
                      Style #{String(i + 1).padStart(2, '0')}
                    </span>
                    {style.type && (
                      <span className="text-[10px] font-bold border border-neutral-800 text-neutral-600 px-1.5 py-0.5 tracking-widest uppercase">
                        {style.type}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                    {style.name}
                  </h3>
                </div>
              </div>

              <p className="text-neutral-400 text-sm mb-6 leading-relaxed line-clamp-3">
                {style.description}
              </p>

              <div className="border-t border-neutral-800 pt-4 flex items-center justify-between text-sm transition-colors">
                <span className="text-neutral-500 font-mono tracking-widest uppercase group-hover:text-white transition-colors text-xs">
                  View Details
                </span>
                <ChevronRight size={16} className="text-red-600" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-neutral-800 py-20 text-center">
          <p className="text-neutral-500 font-mono text-sm tracking-widest uppercase mb-2">
            No results
          </p>
          <p className="text-neutral-700 text-sm">
            No styles match "<span className="text-neutral-500">{query}</span>".{' '}
            <button onClick={() => setQuery('')} className="text-red-600 hover:text-red-500 underline">
              Clear search
            </button>
          </p>
        </div>
      )}

      <p className="text-center text-neutral-800 font-mono text-xs tracking-widest uppercase mt-10">
        — {filtered.length} of {styles.length} style{styles.length !== 1 ? 's' : ''} shown —
      </p>
    </div>
  );
};

export default StylesOverviewView;
