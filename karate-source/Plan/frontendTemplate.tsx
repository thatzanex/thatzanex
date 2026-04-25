import React, { useState } from 'react';
import { 
  Home, 
  List, 
  Swords, 
  BookOpen, 
  Search, 
  Shield, 
  Zap, 
  Activity, 
  ChevronRight, 
  Crosshair, 
  Menu,
  X
} from 'lucide-react';

// ==========================================
// DUMMY DATA
// ==========================================
const DUMMY_STYLES = [
  {
    id: 'style_1',
    name: "Style Alpha",
    shortDesc: "A balanced martial art focusing on rapid strikes and solid defense.",
    stats: { walkSpeed: "16 studs/s", jumpHeight: "50 studs", blockStrength: "Medium", attackSpeed: "Fast" },
    moves: [
      { name: "Alpha Punch", range: "8 studs", cooldown: "1.5s", damage: "15", desc: "A quick, forward-stepping jab." },
      { name: "Sweeping Kick", range: "12 studs", cooldown: "4.0s", damage: "25", desc: "A low sweep that trips opponents." }
    ]
  },
  {
    id: 'style_2',
    name: "Style Beta",
    shortDesc: "Heavy-hitting and slow, relying on armor and devastating single blows.",
    stats: { walkSpeed: "12 studs/s", jumpHeight: "45 studs", blockStrength: "High", attackSpeed: "Slow" },
    moves: [
      { name: "Heavy Haymaker", range: "10 studs", cooldown: "3.0s", damage: "40", desc: "A massive swing with high knockback." },
      { name: "Titan Block", range: "Self", cooldown: "8.0s", damage: "0", desc: "Absorbs incoming damage and reflects 10%." }
    ]
  },
  {
    id: 'style_3',
    name: "Style Gamma",
    shortDesc: "Highly mobile style built around evasive maneuvers and counter-attacks.",
    stats: { walkSpeed: "20 studs/s", jumpHeight: "60 studs", blockStrength: "Low", attackSpeed: "Very Fast" },
    moves: [
      { name: "Phantom Dash", range: "25 studs", cooldown: "5.0s", damage: "10", desc: "Dash through the opponent, dealing light damage." },
      { name: "Counter Kick", range: "10 studs", cooldown: "6.0s", damage: "30", desc: "Parries an attack and delivers a swift kick." }
    ]
  }
];

// ==========================================
// SHARED UI COMPONENTS
// ==========================================
const Card = ({ children, className = "", onClick = null }) => (
  <div 
    onClick={onClick}
    className={`bg-[#0a0a0a] border border-neutral-800 p-6 relative group ${onClick ? 'cursor-pointer hover:border-red-600 transition-colors duration-200' : ''} ${className}`}
  >
    {/* Decorative corner square */}
    <div className={`absolute top-0 right-0 w-2 h-2 bg-neutral-800 ${onClick ? 'group-hover:bg-red-600 transition-colors duration-200' : ''}`} />
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', className = "", onClick }) => {
  const baseStyle = "px-6 py-3 font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 text-sm border-2";
  const variants = {
    primary: "bg-red-700 text-white border-red-700 hover:bg-transparent hover:text-red-500",
    secondary: "bg-transparent text-white border-neutral-700 hover:border-white",
    outline: "bg-transparent text-red-600 border-red-700 hover:bg-red-950"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const SectionHeader = ({ title, subtitle, kanji }) => (
  <div className="mb-12 border-b border-neutral-800 pb-6 flex items-end justify-between relative overflow-hidden">
    <div className="relative z-10">
      <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-[0.1em]">{title}</h1>
      {subtitle && <p className="text-neutral-400 mt-3 tracking-wide">{subtitle}</p>}
    </div>
    {kanji && <div className="absolute right-0 bottom-0 text-7xl md:text-9xl text-neutral-900/40 font-black select-none leading-none z-0 translate-y-4 md:translate-y-8">{kanji}</div>}
  </div>
);

// ==========================================
// PAGE COMPONENTS
// ==========================================

const HomeView = ({ navigate }) => (
  <div className="space-y-16">
    {/* Hero Section */}
    <div className="border-l-4 border-red-700 pl-6 md:pl-10 py-6 relative">
      <div className="absolute right-0 top-0 text-9xl text-neutral-900/30 font-black select-none hidden md:block">空手</div>
      <p className="text-red-600 font-bold tracking-[0.3em] uppercase mb-4 text-sm relative z-10">Welcome to KarateHub</p>
      <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-tight relative z-10">
        Master The <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Art of Combat.</span>
      </h1>
      <p className="text-lg text-neutral-400 mb-10 max-w-2xl tracking-wide leading-relaxed relative z-10">
        The definitive database for analyzing stats, comparing martial arts, and discovering winning strategies for your dojo.
      </p>
      <div className="flex flex-wrap gap-4 relative z-10">
        <Button onClick={() => navigate('styles')}>View 流派 (Styles)</Button>
        <Button variant="secondary" onClick={() => navigate('compare')}>Matchup Data</Button>
      </div>
    </div>

    {/* Featured Styles */}
    <div>
      <div className="flex justify-between items-end mb-8 border-b border-neutral-800 pb-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">Featured Styles</h2>
        <button onClick={() => navigate('styles')} className="text-red-500 hover:text-red-400 text-sm font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
          See All <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DUMMY_STYLES.map((style, i) => (
          <Card key={style.id} onClick={() => navigate('details', style.id)} className="flex flex-col h-full group">
            <div className="h-40 border border-neutral-800 bg-[#050505] mb-6 flex items-center justify-center relative overflow-hidden">
               <span className="text-neutral-800 font-mono text-6xl font-black absolute -left-4 -bottom-4 select-none">0{i+1}</span>
               <span className="text-neutral-600 font-mono text-sm tracking-widest z-10">[ DATA ]</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">{style.name}</h3>
            <p className="text-neutral-400 text-sm mb-8 flex-grow leading-relaxed">{style.shortDesc}</p>
            <div className="mt-auto border-t border-neutral-800 pt-4 flex justify-between items-center text-sm font-bold text-neutral-500 group-hover:text-red-500 transition-colors">
              <span className="uppercase tracking-widest">Analyze</span>
              <ChevronRight size={16} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const StylesOverviewView = ({ navigate }) => (
  <div>
    <SectionHeader 
      title="Fighting Styles" 
      subtitle="Browse and analyze every martial art available in the game." 
      kanji="流派"
    />
    
    {/* Search/Filter Bar */}
    <div className="flex gap-4 mb-10">
      <div className="relative flex-grow">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-600" size={20} />
        <input 
          type="text" 
          placeholder="SEARCH STYLES..." 
          className="w-full bg-[#0a0a0a] border-2 border-neutral-800 text-white font-mono tracking-wide rounded-none pl-12 pr-4 py-4 focus:outline-none focus:border-red-600 transition-colors"
          disabled
        />
      </div>
      <select className="bg-[#0a0a0a] border-2 border-neutral-800 text-white font-mono uppercase tracking-wide rounded-none px-6 py-4 focus:outline-none focus:border-red-600" disabled>
        <option>All Types</option>
        <option>Striking</option>
        <option>Grappling</option>
      </select>
    </div>

    {/* Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {DUMMY_STYLES.map(style => (
        <Card key={style.id} onClick={() => navigate('details', style.id)}>
           <div className="flex justify-between items-start mb-6">
             <div>
               <span className="text-xs font-bold text-red-600 tracking-widest uppercase mb-1 block">Style Data</span>
               <h3 className="text-2xl font-black text-white uppercase tracking-wider">{style.name}</h3>
             </div>
             <div className="w-10 h-10 border border-neutral-700 flex items-center justify-center shrink-0 bg-neutral-900">
                <span className="text-neutral-500 text-xs font-mono font-bold">0{style.id.split('_')[1]}</span>
             </div>
           </div>
           <p className="text-neutral-400 text-sm mb-8 leading-relaxed">{style.shortDesc}</p>
           <div className="border-t border-neutral-800 pt-4 flex items-center justify-between text-sm transition-colors">
              <span className="text-neutral-500 font-mono tracking-widest uppercase group-hover:text-white transition-colors">View Details</span>
              <ChevronRight size={16} className="text-red-600" />
           </div>
        </Card>
      ))}
    </div>
  </div>
);

const StyleDetailsView = ({ styleId, navigate }) => {
  const style = DUMMY_STYLES.find(s => s.id === styleId) || DUMMY_STYLES[0];

  return (
    <div className="space-y-10">
      <button onClick={() => navigate('styles')} className="text-neutral-500 hover:text-white font-mono text-sm tracking-widest uppercase flex items-center gap-2 mb-2 transition-colors">
        <ChevronRight className="rotate-180" size={16} /> Return to Database
      </button>

      {/* Main Info Card */}
      <div className="border border-neutral-800 bg-[#0a0a0a] p-1 relative">
        <div className="h-64 bg-[#050505] flex items-center justify-center relative overflow-hidden">
           {/* Grid pattern overlay */}
           <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
           <span className="text-neutral-700 font-mono z-10 text-xl tracking-[0.5em] uppercase">[ VISUAL DATA UNAVAILABLE ]</span>
           <div className="absolute bottom-4 right-4 text-7xl text-neutral-900 font-black select-none">流派</div>
        </div>
        <div className="p-8 md:p-12 border-t border-neutral-800">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-red-700 text-white text-xs font-bold px-2 py-1 tracking-widest uppercase">Verified Record</span>
            <span className="text-neutral-500 font-mono text-sm uppercase">ID: {style.id}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-wider">{style.name}</h1>
          <p className="text-neutral-400 text-lg max-w-3xl leading-relaxed">{style.shortDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 pb-2 border-b-2 border-neutral-800">
               Core Stats
            </h3>
            <div className="space-y-1">
              {Object.entries(style.stats).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-3 border-b border-neutral-800/50 last:border-0">
                  <span className="text-neutral-500 uppercase tracking-wider text-sm font-bold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-mono text-white">{value}</span>
                </div>
              ))}
            </div>
            <Button className="w-full mt-8" onClick={() => navigate('guide')}>Matchup Guide</Button>
          </Card>
        </div>

        {/* Moveset List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-2xl font-black text-white mb-6 pb-2 border-b-2 border-neutral-800 uppercase tracking-widest">
            Moves & Techniques
          </h3>
          {style.moves.map((move, idx) => (
            <Card key={idx} className="!p-0 border-neutral-800 flex flex-col md:flex-row group">
              <div className="p-6 md:w-2/3 border-b md:border-b-0 md:border-r border-neutral-800">
                <div className="flex items-center gap-3 mb-2">
                   <span className="text-red-600 font-mono font-bold text-sm">0{idx + 1}</span>
                   <h4 className="text-xl font-bold text-white uppercase tracking-wide">{move.name}</h4>
                </div>
                <p className="text-neutral-400 text-sm mt-2 leading-relaxed">{move.desc}</p>
              </div>
              <div className="md:w-1/3 grid grid-cols-1 divide-y divide-neutral-800 bg-[#050505]">
                <div className="p-3 flex justify-between items-center">
                  <span className="text-xs text-neutral-500 uppercase font-bold tracking-widest">Damage</span>
                  <span className="font-mono text-white font-bold">{move.damage}</span>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="text-xs text-neutral-500 uppercase font-bold tracking-widest">Cooldown</span>
                  <span className="font-mono text-white">{move.cooldown}</span>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="text-xs text-neutral-500 uppercase font-bold tracking-widest">Range</span>
                  <span className="font-mono text-white">{move.range}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const ComparisonView = () => (
  <div>
    <SectionHeader title="Compare Data" subtitle="Evaluate base stats side-by-side to find the ultimate advantage." kanji="比較" />

    {/* Selection Area */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      <div className="space-y-3">
        <label className="text-xs font-bold text-red-500 uppercase tracking-widest">Style 1 (Red Side)</label>
        <select className="w-full bg-[#0a0a0a] border-2 border-red-900/50 text-white font-bold uppercase tracking-wide rounded-none px-4 py-4 focus:outline-none" disabled>
          <option>Style Alpha</option>
        </select>
      </div>
      <div className="space-y-3">
        <label className="text-xs font-bold text-white uppercase tracking-widest">Style 2 (White Side)</label>
        <select className="w-full bg-[#0a0a0a] border-2 border-neutral-700 text-white font-bold uppercase tracking-wide rounded-none px-4 py-4 focus:outline-none" disabled>
          <option>Style Beta</option>
        </select>
      </div>
    </div>

    {/* Comparison Table */}
    <div className="border border-neutral-800 overflow-x-auto bg-[#0a0a0a]">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-neutral-800 bg-[#050505]">
            <th className="p-6 text-neutral-500 font-mono uppercase text-xs tracking-widest w-1/3">Attribute</th>
            <th className="p-6 text-white font-black uppercase tracking-wider text-lg border-l border-neutral-800 text-center w-1/3">Style Alpha</th>
            <th className="p-6 text-white font-black uppercase tracking-wider text-lg border-l border-neutral-800 text-center w-1/3">Style Beta</th>
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'Walk Speed', val1: '16 studs/s', val2: '12 studs/s', win: 1 },
            { label: 'Jump Height', val1: '50 studs', val2: '45 studs', win: 1 },
            { label: 'Block Strength', val1: 'Medium', val2: 'High', win: 2 },
            { label: 'Attack Speed', val1: 'Fast', val2: 'Slow', win: 1 },
            { label: 'Longest Attack Range', val1: '12 studs', val2: '10 studs', win: 1 },
            { label: 'Max Burst Damage', val1: '40 (Combo)', val2: '40 (Single)', win: 0 }
          ].map((row, idx) => (
            <tr key={idx} className="border-b border-neutral-800/50 last:border-0 hover:bg-[#111] transition-colors">
              <td className="p-5 text-neutral-400 font-bold uppercase text-sm tracking-wide">{row.label}</td>
              <td className={`p-5 text-center font-mono border-l border-neutral-800 ${row.win === 1 ? 'text-white font-bold bg-red-900/20 border-b-2 border-b-red-600' : 'text-neutral-500'}`}>
                {row.val1}
              </td>
              <td className={`p-5 text-center font-mono border-l border-neutral-800 ${row.win === 2 ? 'text-white font-bold bg-white/5 border-b-2 border-b-white' : 'text-neutral-500'}`}>
                {row.val2}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MatchupGuideView = () => (
  <div className="space-y-12">
    <SectionHeader title="Matchup Guide" subtitle="Tactical breakdown: Style Alpha vs Style Beta" kanji="指南" />

    {/* Strengths & Weaknesses Split */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* My Style */}
      <Card className="border-t-4 border-t-red-600 bg-[#050505]">
        <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-wider flex items-center gap-3">
           <span className="bg-red-600 text-white px-2 py-1 text-sm">P1</span> Playing As: Alpha
        </h2>
        <div className="space-y-8">
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-3 border-b border-neutral-800 pb-2 text-sm">Relevant Strengths</h4>
            <ul className="list-square list-inside text-neutral-400 space-y-2 text-sm leading-relaxed">
              <li className="flex gap-2"><ChevronRight className="text-red-500 shrink-0" size={16}/> Superior walk speed for kiting.</li>
              <li className="flex gap-2"><ChevronRight className="text-red-500 shrink-0" size={16}/> Faster attack startup interrupts heavy swings.</li>
              <li className="flex gap-2"><ChevronRight className="text-red-500 shrink-0" size={16}/> Sweeping Kick outranges their standard punch.</li>
            </ul>
          </div>
          <div>
            <h4 className="text-neutral-500 font-bold uppercase tracking-widest mb-3 border-b border-neutral-800 pb-2 text-sm">Relevant Weaknesses</h4>
            <ul className="list-square list-inside text-neutral-500 space-y-2 text-sm leading-relaxed">
              <li className="flex gap-2"><X className="text-neutral-700 shrink-0" size={16}/> Medium block easily broken by Heavy Haymaker.</li>
              <li className="flex gap-2"><X className="text-neutral-700 shrink-0" size={16}/> Lower single-hit damage.</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Opponent Style */}
      <Card className="border-t-4 border-t-white bg-[#050505]">
         <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-wider flex items-center gap-3">
           <span className="bg-white text-black px-2 py-1 text-sm">P2</span> Opponent: Beta
        </h2>
        <div className="space-y-8">
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-3 border-b border-neutral-800 pb-2 text-sm">Their Strengths</h4>
            <ul className="list-square list-inside text-neutral-400 space-y-2 text-sm leading-relaxed">
              <li className="flex gap-2"><ChevronRight className="text-white shrink-0" size={16}/> Devastating damage if they corner you.</li>
              <li className="flex gap-2"><ChevronRight className="text-white shrink-0" size={16}/> Titan Block nullifies your burst combos.</li>
            </ul>
          </div>
          <div>
            <h4 className="text-neutral-500 font-bold uppercase tracking-widest mb-3 border-b border-neutral-800 pb-2 text-sm">Their Weaknesses</h4>
            <ul className="list-square list-inside text-neutral-500 space-y-2 text-sm leading-relaxed">
              <li className="flex gap-2"><X className="text-neutral-700 shrink-0" size={16}/> Very slow movement makes them predictable.</li>
              <li className="flex gap-2"><X className="text-neutral-700 shrink-0" size={16}/> Long cooldowns if they miss heavy attacks.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>

    {/* Strategy Section */}
    <Card className="bg-[#050505] border-neutral-800 p-8 md:p-12">
      <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-widest flex items-center gap-4 border-b-2 border-neutral-800 pb-6">
        Winning Strategies
      </h3>
      <div className="space-y-6 text-neutral-400 leading-relaxed text-lg">
        <p className="flex flex-col md:flex-row gap-4">
          <strong className="text-red-500 font-black font-mono text-2xl shrink-0">01.</strong> 
          <span><strong className="text-white uppercase tracking-wide">Bait and Punish:</strong> Maintain a distance of around 12-15 studs. Style Beta relies on you making the first move so they can utilize Titan Block. Fake a forward dash to bait their block, wait out its duration (8s cooldown), and then engage.</span>
        </p>
        <div className="w-full h-px bg-neutral-800"></div>
        <p className="flex flex-col md:flex-row gap-4">
          <strong className="text-red-500 font-black font-mono text-2xl shrink-0">02.</strong> 
          <span><strong className="text-white uppercase tracking-wide">Utilize Sweeping Kick:</strong> Your Sweeping Kick has a 12 stud range compared to their 10 stud Haymaker. Poke them from the very edge of your hit box. If they start winding up the Haymaker, do not try to block it—use your superior walk speed to step back.</span>
        </p>
        <div className="w-full h-px bg-neutral-800"></div>
        <p className="flex flex-col md:flex-row gap-4">
          <strong className="text-red-500 font-black font-mono text-2xl shrink-0">03.</strong> 
          <span><strong className="text-white uppercase tracking-wide">Hit and Run:</strong> Never stay stationary after landing a combo. Land your Alpha Punch -{'>'} Sweeping Kick combo and immediately backdash. Sustained close-quarters combat heavily favors Style Beta.</span>
        </p>
      </div>
    </Card>
  </div>
);

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedStyleId, setSelectedStyleId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simple router simulation
  const navigate = (view, id = null) => {
    setCurrentView(view);
    if (id) setSelectedStyleId(id);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'styles', label: 'Database' },
    { id: 'compare', label: 'Compare' },
    { id: 'guide', label: 'Guides' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-red-700 selection:text-white pb-20">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => navigate('home')}
            >
              <div className="bg-red-700 text-white font-black px-2 py-1 text-xl leading-none">
                空手
              </div>
              <span className="font-black text-2xl tracking-[0.2em] text-white">
                KARATE<span className="text-red-600">HUB</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map(item => {
                const isActive = currentView === item.id || (currentView === 'details' && item.id === 'styles');
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`uppercase tracking-widest text-sm font-bold transition-all duration-200 border-b-2 py-1 ${
                      isActive 
                        ? 'text-white border-red-600' 
                        : 'text-neutral-500 border-transparent hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-neutral-400 hover:text-white p-2"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0a0a0a] border-b border-neutral-900 absolute w-full left-0">
            <div className="px-4 py-6 space-y-4">
              {navItems.map(item => {
                const isActive = currentView === item.id || (currentView === 'details' && item.id === 'styles');
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`block w-full text-left uppercase tracking-widest text-lg font-black border-l-4 pl-4 py-2 transition-colors ${
                      isActive ? 'border-red-600 text-white bg-neutral-900/50' : 'border-transparent text-neutral-500 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {currentView === 'home' && <HomeView navigate={navigate} />}
        {currentView === 'styles' && <StylesOverviewView navigate={navigate} />}
        {currentView === 'details' && <StyleDetailsView styleId={selectedStyleId} navigate={navigate} />}
        {currentView === 'compare' && <ComparisonView />}
        {currentView === 'guide' && <MatchupGuideView />}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#050505] border-t border-neutral-900 mt-auto py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-neutral-700 font-black text-3xl">空手</div>
            <div className="text-neutral-600 text-xs font-mono uppercase tracking-widest">
              © {new Date().getFullYear()} KARATEHUB.<br/>Not affiliated with Roblox Corp.
            </div>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <a href="#" className="hover:text-white transition-colors">Database Info</a>
            <a href="#" className="hover:text-white transition-colors">Game Link</a>
            <a href="#" className="hover:text-white transition-colors">System</a>
          </div>
        </div>
      </footer>

    </div>
  );
}