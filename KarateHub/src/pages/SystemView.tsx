import React from 'react';
import { ExternalLink, Code2, Database, Layers, Zap, FileJson, Palette } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';

const GAME_URL = 'https://www.roblox.com/games/6336491204/Karate';

interface TechCard {
  name: string;
  version: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  badge?: string;
}

const TECH_STACK: TechCard[] = [
  {
    name: 'React',
    version: '18',
    description: 'Component-based UI library for building interactive interfaces with hooks and functional components.',
    url: 'https://react.dev',
    icon: <Code2 size={24} className="text-sky-400" />,
  },
  {
    name: 'TypeScript',
    version: '5',
    description: 'Typed superset of JavaScript providing strict type safety across all data models and components.',
    url: 'https://www.typescriptlang.org',
    icon: <Code2 size={24} className="text-blue-400" />,
  },
  {
    name: 'Vite',
    version: '6',
    description: 'Next-generation frontend build tool with lightning-fast HMR and an optimized production bundle.',
    url: 'https://vitejs.dev',
    icon: <Zap size={24} className="text-yellow-400" />,
  },
  {
    name: 'Tailwind CSS',
    version: '3',
    description: 'Utility-first CSS framework enabling rapid UI development with a consistent design system.',
    url: 'https://tailwindcss.com',
    icon: <Palette size={24} className="text-cyan-400" />,
  },
  {
    name: 'Lucide React',
    version: 'latest',
    description: 'Clean, consistent icon library providing all UI icons across the app.',
    url: 'https://lucide.dev',
    icon: <Layers size={24} className="text-violet-400" />,
  },
  {
    name: 'JSON Data Files',
    version: '—',
    description: 'All style stats and matchup guides are stored as plain JSON files — no backend, no database.',
    url: '#',
    icon: <FileJson size={24} className="text-emerald-400" />,
    badge: 'Static',
  },
];

interface StatRow {
  label: string;
  value: string;
}

const STATS: StatRow[] = [
  { label: 'Hosting', value: 'Static (no server)' },
  { label: 'Data Source', value: 'Community-sourced JSON' },
  { label: 'Backend', value: 'None' },
  { label: 'Auth', value: 'None' },
  { label: 'Tracking', value: 'None' },
  { label: 'Open Source', value: 'Private' },
];

interface SystemViewProps {
  navigate: (view: string) => void;
}

const SystemView: React.FC<SystemViewProps> = ({ navigate: _navigate }) => (
  <div className="space-y-12">
    <SectionHeader
      title="System Info"
      subtitle="Tech stack, data sources, and project details."
      kanji="系統"
    />

    {/* About */}
    <Card className="!p-8 md:!p-12 bg-[#050505]">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="bg-red-700 text-white text-xs font-bold px-2 py-1 tracking-widest uppercase">
          Fan Project
        </span>
        <span className="text-neutral-600 font-mono text-xs uppercase tracking-widest">
          v0.1.0 — Demo Phase
        </span>
      </div>
      <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
        KARATE<span className="text-red-600">HUB</span>
      </h2>
      <p className="text-neutral-400 leading-relaxed max-w-2xl mb-4">
        KarateHub is an unofficial, community-built stat database for the Roblox game{' '}
        <a
          href={GAME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-500 hover:text-red-400 font-bold transition-colors inline-flex items-center gap-1"
        >
          Karate! <ExternalLink size={12} />
        </a>
        . It provides frame-data analysis, style comparisons, and matchup guides derived
        from in-game measurements.
      </p>
      <p className="text-neutral-600 text-sm leading-relaxed max-w-2xl">
        This project is not affiliated with, endorsed by, or associated with the developers of
        Karate! or the Roblox Corporation. All game data has been collected by the community.
      </p>
    </Card>

    {/* Tech Stack */}
    <div>
      <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
        <Database size={18} className="text-red-600" />
        Tech Stack
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TECH_STACK.map((tech) => (
          <a
            key={tech.name}
            href={tech.url === '#' ? undefined : tech.url}
            target={tech.url === '#' ? undefined : '_blank'}
            rel="noopener noreferrer"
            className={`block bg-[#0a0a0a] border border-neutral-800 p-6 transition-all duration-200 group relative ${
              tech.url !== '#' ? 'hover:border-neutral-600 cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className="absolute top-0 right-0 w-2 h-2 bg-neutral-800 group-hover:bg-neutral-600 transition-colors" />
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {tech.icon}
                <div>
                  <span className="font-black text-white text-base">{tech.name}</span>
                  <span className="text-neutral-600 text-xs font-mono ml-2">v{tech.version}</span>
                </div>
              </div>
              {tech.badge && (
                <span className="text-[10px] font-bold bg-neutral-800 text-neutral-400 px-2 py-0.5 uppercase tracking-widest">
                  {tech.badge}
                </span>
              )}
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed">{tech.description}</p>
            {tech.url !== '#' && (
              <div className="mt-4 flex items-center gap-1 text-xs text-neutral-700 group-hover:text-neutral-400 transition-colors font-mono uppercase tracking-widest">
                <ExternalLink size={10} /> Docs
              </div>
            )}
          </a>
        ))}
      </div>
    </div>

    {/* System Stats */}
    <div>
      <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">
        System Properties
      </h2>
      <div className="border border-neutral-800 bg-[#0a0a0a] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <tbody>
            {STATS.map((row, i) => (
              <tr
                key={row.label}
                className={`border-b border-neutral-800/50 last:border-0 ${
                  i % 2 === 0 ? 'bg-transparent' : 'bg-neutral-900/20'
                }`}
              >
                <td className="py-4 px-6 text-neutral-500 font-bold uppercase text-xs tracking-widest w-1/2">
                  {row.label}
                </td>
                <td className="py-4 px-6 font-mono text-white text-sm">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Data Credits */}
    <Card className="border-dashed border-neutral-800 bg-[#050505] !p-8">
      <h3 className="font-black text-white uppercase tracking-widest mb-4 text-sm">Data &amp; Credits</h3>
      <ul className="space-y-2 text-sm text-neutral-500 leading-relaxed">
        <li className="flex gap-2">
          <span className="text-red-700 font-mono shrink-0">—</span>
          Frame data measured in-game by community members and cross-referenced for accuracy.
        </li>
        <li className="flex gap-2">
          <span className="text-red-700 font-mono shrink-0">—</span>
          Matchup guides written based on mathematical analysis of stat differentials.
        </li>
        <li className="flex gap-2">
          <span className="text-red-700 font-mono shrink-0">—</span>
          All data is subject to change with game updates. Stats reflect the version at time of
          last data update.
        </li>
      </ul>
    </Card>
  </div>
);

export default SystemView;
