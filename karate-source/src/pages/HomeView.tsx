import React from 'react';
import { ChevronRight, ExternalLink } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import stylesData from '../data/styleStats.json';
import type { StyleData } from '../types';

const styles = stylesData as unknown as StyleData[];


const GAME_URL = 'https://www.roblox.com/games/6336491204/Karate';

interface HomeViewProps {
  navigate: (view: string, name?: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ navigate }) => (
  <div className="space-y-20">

    {/* ── Hero ── */}
    <div className="border-l-4 border-red-700 pl-6 md:pl-10 py-8 relative">
      <div className="absolute right-0 top-0 text-[10rem] text-neutral-900/25 font-black select-none hidden md:block leading-none">
        空手
      </div>
      <p className="text-red-600 font-bold tracking-[0.3em] uppercase mb-4 text-xs relative z-10">
        Welcome to KarateHub
      </p>
      <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-[1.05] relative z-10">
        Master The <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">
          Art of Combat.
        </span>
      </h1>
      <p className="text-lg text-neutral-400 mb-10 max-w-2xl tracking-wide leading-relaxed relative z-10">
        The definitive community database for analyzing stats, comparing fighting styles, and
        discovering winning strategies for the Roblox game{' '}
        <a
          href={GAME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-500 hover:text-red-400 transition-colors font-bold"
        >
          Karate!
        </a>
        .
      </p>
      <div className="flex flex-wrap gap-4 relative z-10">
        <Button onClick={() => navigate('styles')}>View 流派 (Styles)</Button>
        <Button variant="secondary" onClick={() => navigate('compare')}>
          Matchup Data
        </Button>
        <a
          href={GAME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 text-sm border-2 bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-neutral-300"
        >
          Play Game <ExternalLink size={14} />
        </a>
      </div>
    </div>

    {/* ── Stats strip ── */}
    <div className="grid grid-cols-3 border border-neutral-800 divide-x divide-neutral-800">
      {[
        { value: String(styles.length), label: 'Styles Documented' },
        { value: String(styles.reduce((acc, s) => acc + Object.keys(s.moves).length, 0)), label: 'Moves Tracked' },
        { value: '100%', label: 'Community Sourced' },
      ].map((stat) => (
        <div key={stat.label} className="py-8 px-6 text-center bg-[#0a0a0a]">
          <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
          <div className="text-xs text-neutral-600 uppercase tracking-widest font-bold">{stat.label}</div>
        </div>
      ))}
    </div>

    {/* ── Featured Styles ── */}
    <div>
      <div className="flex justify-between items-end mb-8 border-b border-neutral-800 pb-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">Featured Styles</h2>
        <button
          onClick={() => navigate('styles')}
          className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
        >
          See All <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {styles.map((style, i) => (
          <Card
            key={style.name}
            onClick={() => navigate('details', style.name)}
            className="flex flex-col h-full !p-0 overflow-hidden"
          >
            {/* Style thumbnail */}
            <div className="h-44 relative overflow-hidden bg-[#050505] flex items-center justify-center">
              <img
                src={`${import.meta.env.BASE_URL}images/styles/${style.name.toLowerCase().replace(/ /g, '_')}.png`}
                alt={style.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).parentElement!.classList.add('bg-neutral-950');
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              
              {/* Fallback pattern (visible if image fails) */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]"
                style={{
                  backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              
              {/* Subtle number watermark */}
              <span className="absolute -left-3 -bottom-3 text-neutral-800/40 font-mono text-8xl font-black select-none leading-none z-10">
                0{i + 1}
              </span>
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            </div>

            <div className="p-6 flex flex-col flex-grow">
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
              <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-wide">
                {style.name}
              </h3>
              <p className="text-neutral-400 text-sm flex-grow leading-relaxed line-clamp-3">
                {style.description}
              </p>
              <div className="mt-6 border-t border-neutral-800 pt-4 flex justify-between items-center text-sm font-bold text-neutral-600 group-hover:text-red-500 transition-colors">
                <span className="uppercase tracking-widest text-xs">Analyze</span>
                <ChevronRight size={15} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>

    {/* ── Matchup CTA ── */}
    <div className="border border-neutral-800 bg-[#0a0a0a] p-8 md:p-12 relative overflow-hidden">
      <div className="absolute right-0 bottom-0 text-8xl text-neutral-900/20 font-black select-none leading-none translate-y-4">
        指南
      </div>
      <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">
        Tactical Analysis
      </p>
      <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4 relative z-10">
        Know Your Matchup
      </h2>
      <p className="text-neutral-400 mb-8 max-w-xl leading-relaxed relative z-10">
        Every style has specific strengths and vulnerabilities. Our matchup guides break down the
        mathematical edge — cooldowns, range, and walk speed — so you always know the optimal play.
      </p>
      <div className="flex flex-wrap gap-4 relative z-10">
        <Button onClick={() => navigate('guide')}>View Matchup Guides</Button>
        <Button variant="secondary" onClick={() => navigate('compare')}>
          Side-by-Side Compare
        </Button>
      </div>
    </div>
  </div>
);

export default HomeView;
