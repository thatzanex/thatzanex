import { useState } from 'react';
import { Menu, X, ExternalLink } from 'lucide-react';
import HomeView from './pages/HomeView';
import StylesOverviewView from './pages/StylesOverviewView';
import StyleDetailsView from './pages/StyleDetailsView';
import ComparisonView from './pages/ComparisonView';
import MatchupGuideView from './pages/MatchupGuideView';
import SystemView from './pages/SystemView';

type View = 'home' | 'styles' | 'details' | 'compare' | 'guide' | 'system';

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'styles', label: 'Database' },
  { id: 'compare', label: 'Compare' },
  { id: 'guide', label: 'Guides' },
];

const GAME_URL = 'https://www.roblox.com/games/6336491204/Karate';

// Default starting styles
const DEFAULT_STYLE_1 = 'Kung Fu';
const DEFAULT_STYLE_2 = 'Muay Thai';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedStyleName, setSelectedStyleName] = useState<string | null>(null);

  // Lifted state — shared between ComparisonView and MatchupGuideView
  const [selectedStyle1, setSelectedStyle1] = useState(DEFAULT_STYLE_1);
  const [selectedStyle2, setSelectedStyle2] = useState(DEFAULT_STYLE_2);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = (view: string, name?: string) => {
    setCurrentView(view as View);
    if (name) setSelectedStyleName(name);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isNavActive = (id: View) =>
    currentView === id || (currentView === 'details' && id === 'styles');

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('home')}
            >
              <div className="bg-red-700 group-hover:bg-red-600 transition-colors text-white font-black px-2 py-1 text-xl leading-none select-none">
                空手
              </div>
              <span className="font-black text-2xl tracking-[0.2em] text-white">
                KARATE<span className="text-red-600">HUB</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`uppercase tracking-widest text-sm font-bold transition-all duration-200 border-b-2 py-1 ${
                    isNavActive(item.id)
                      ? 'text-white border-red-600'
                      : 'text-neutral-500 border-transparent hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <a
                href={GAME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="uppercase tracking-widest text-xs font-bold text-neutral-600 hover:text-neutral-300 transition-colors flex items-center gap-1 border border-neutral-800 hover:border-neutral-600 px-3 py-1.5"
              >
                Play <ExternalLink size={11} />
              </a>
            </nav>

            {/* Mobile toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-neutral-400 hover:text-white p-2 transition-colors"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0a0a0a] border-b border-neutral-900 absolute w-full left-0 shadow-2xl">
            <div className="px-4 py-6 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`block w-full text-left uppercase tracking-widest text-base font-black border-l-4 pl-4 py-3 transition-colors ${
                    isNavActive(item.id)
                      ? 'border-red-600 text-white bg-neutral-900/50'
                      : 'border-transparent text-neutral-500 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <a
                href={GAME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 pl-4 py-3 border-l-4 border-transparent text-neutral-600 font-bold uppercase tracking-widest text-sm hover:text-neutral-400 transition-colors"
              >
                Play Karate! <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 min-h-[calc(100vh-80px-200px)]">
        <div key={currentView + (selectedStyleName ?? '')} className="view-enter">
          {currentView === 'home' && <HomeView navigate={navigate} />}

          {currentView === 'styles' && <StylesOverviewView navigate={navigate} />}

          {currentView === 'details' && (
            <StyleDetailsView styleName={selectedStyleName} navigate={navigate} />
          )}

          {currentView === 'compare' && (
            <ComparisonView
              selectedStyle1={selectedStyle1}
              selectedStyle2={selectedStyle2}
              onStyle1Change={setSelectedStyle1}
              onStyle2Change={setSelectedStyle2}
              navigate={navigate}
            />
          )}

          {currentView === 'guide' && (
            <MatchupGuideView
              style1Name={selectedStyle1}
              style2Name={selectedStyle2}
              onStyle1Change={setSelectedStyle1}
              onStyle2Change={setSelectedStyle2}
              navigate={navigate}
            />
          )}

          {currentView === 'system' && <SystemView navigate={navigate} />}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#050505] border-t border-neutral-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

            {/* Brand */}
            <div className="flex items-center gap-4">
              <div
                className="text-neutral-800 font-black text-4xl select-none cursor-pointer hover:text-neutral-700 transition-colors"
                onClick={() => navigate('home')}
              >
                空手
              </div>
              <div>
                <p className="text-white font-black text-sm tracking-widest uppercase">
                  KARATE<span className="text-red-700">HUB</span>
                </p>
                <p className="text-neutral-700 text-xs font-mono uppercase tracking-wider mt-1">
                  © {new Date().getFullYear()} KarateHub
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-xs font-bold uppercase tracking-widest">
              <a
                href={GAME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-white transition-colors flex items-center gap-1.5"
              >
                Karate! on Roblox <ExternalLink size={10} />
              </a>
              <button
                onClick={() => navigate('system')}
                className="text-neutral-500 hover:text-white transition-colors text-left"
              >
                System Info
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 pt-6 border-t border-neutral-900">
            <p className="text-neutral-800 text-xs font-mono leading-relaxed max-w-2xl">
              KarateHub is an independent fan project and is not affiliated with, endorsed by, or
              officially connected to the developers of Karate! or the Roblox Corporation. All
              game data has been independently sourced by the community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
