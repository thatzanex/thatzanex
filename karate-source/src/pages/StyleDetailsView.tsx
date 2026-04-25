import React from 'react';
import { ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import stylesData from '../data/styleStats.json';
import type { StyleData, StatValue } from '../types';
import { STAT_LABELS, MOVE_LABELS, formatStatValue } from '../types';

const styles = stylesData as unknown as StyleData[];


const TYPE_COLORS: Record<string, string> = {
  'Offensive':         'text-orange-400 border-orange-900/50 bg-orange-950/20',
  'Counter-Offensive': 'text-sky-400 border-sky-900/50 bg-sky-950/20',
  'Defensive':         'text-emerald-400 border-emerald-900/50 bg-emerald-950/20',
};

interface StyleDetailsViewProps {
  styleName: string | null;
  navigate: (view: string, name?: string) => void;
}



const StyleDetailsView: React.FC<StyleDetailsViewProps> = ({ styleName, navigate }) => {
  const style = styles.find((s) => s.name === styleName) ?? styles[0];
  const styleIndex = styles.findIndex((s) => s.name === style.name);
  const typeClass = style.type ? (TYPE_COLORS[style.type] ?? 'text-neutral-400 border-neutral-700 bg-neutral-900/20') : '';

  return (
    <div className="space-y-10 view-enter">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-600">
        <button onClick={() => navigate('home')} className="hover:text-neutral-400 transition-colors">Home</button>
        <ChevronRight size={12} className="text-neutral-800" />
        <button onClick={() => navigate('styles')} className="hover:text-neutral-400 transition-colors">Database</button>
        <ChevronRight size={12} className="text-neutral-800" />
        <span className="text-white">{style.name}</span>
      </nav>

      {/* Main Banner */}
      <div className="border border-neutral-800 bg-[#0a0a0a] overflow-hidden">
        <div className="h-72 relative overflow-hidden">
          <img 
            src={style.imageBanner || `${import.meta.env.BASE_URL}images/styles/${style.name.toLowerCase().replace(/ /g, '_')}.png`} 
            alt={`${style.name} banner`} 
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              // If image fails, the BannerPlaceholder logic below handles it
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          
          {/* Fallback visual if no image loads */}
          <div className="absolute inset-0 -z-10 bg-[#050505]">
             <div className="absolute inset-0 opacity-[0.05]" style={{
               backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
               backgroundSize: '30px 30px',
             }} />
             <div className="absolute inset-0 bg-gradient-to-br from-red-950/10 to-transparent" />
             <div className="absolute bottom-4 right-6 text-8xl text-neutral-900/50 font-black select-none leading-none">流派</div>
          </div>
        </div>

        <div className="p-8 md:p-12 border-t border-neutral-800">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-red-700 text-white text-xs font-bold px-2 py-1 tracking-widest uppercase">
              Verified Record
            </span>
            {style.type && (
              <span className={`border text-xs font-bold px-2 py-1 tracking-widest uppercase ${typeClass}`}>
                {style.type}
              </span>
            )}
            <span className="text-neutral-700 font-mono text-xs uppercase tracking-widest ml-auto">
              #{String(styleIndex + 1).padStart(2, '0')} / {styles.length}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-wider">{style.name}</h1>
          <p className="text-neutral-400 text-lg max-w-3xl leading-relaxed">{style.description}</p>
        </div>
      </div>

      {/* Moves & Techniques */}
      <div>
        <h2 className="text-2xl font-black text-white mb-6 pb-2 border-b-2 border-neutral-800 uppercase tracking-widest">
          Moves &amp; Techniques
        </h2>
        <div className="space-y-4">
          {(Object.entries(style.moves) as [string, Record<string, StatValue>][]).map(([moveName, moveData], idx) => {
            const statEntries = Object.entries(moveData) as [string, StatValue][];
            return (
              <Card key={moveName} className="!p-0">
                <div className="px-6 py-4 border-b border-neutral-800 bg-[#080808] flex items-center gap-3">
                  <span className="text-red-600 font-mono font-bold text-xs tracking-widest">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">
                    {MOVE_LABELS[moveName] ?? moveName}
                  </h3>
                  <span className="ml-auto font-mono text-xs text-neutral-700 tracking-widest uppercase hidden sm:block">
                    {moveName}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {statEntries.map(([key, value], statIdx) => (
                    <div
                      key={key}
                      className={`p-4 flex flex-col gap-1 ${
                        statIdx < statEntries.length - 1 ? 'border-b border-r border-neutral-800/50' : ''
                      }`}
                    >
                      <span className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest leading-tight">
                        {STAT_LABELS[key] ?? key.replace(/_/g, ' ')}
                      </span>
                      <span className={`font-mono font-bold text-sm ${
                        typeof value === 'boolean'
                          ? value ? 'text-emerald-400' : 'text-neutral-600'
                          : 'text-white'
                      }`}>
                        {formatStatValue(key, value)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-neutral-800">
        <Button onClick={() => navigate('guide')}>View Matchup Guides</Button>
        <Button variant="secondary" onClick={() => navigate('compare')}>Compare Styles</Button>
        <Button variant="outline" onClick={() => navigate('styles')}>← Back to Database</Button>
      </div>
    </div>
  );
};

export default StyleDetailsView;
