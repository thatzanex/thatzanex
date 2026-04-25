import { ChevronRight, X, Crosshair, Zap, Shield, ArrowLeftRight, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import { StyleSelector } from '../components/ui/StyleSelector';
import { useStyles } from '../hooks/useStyles';
import type { MatchupEntry, StyleData } from '../types';


interface MatchupGuideViewProps {
  style1Name: string;
  style2Name: string;
  onStyle1Change: (name: string) => void;
  onStyle2Change: (name: string) => void;
  navigate: (view: string) => void;
}

const WinConditionBanner: React.FC<{ text: string }> = ({ text }) => (
  <div className="border border-red-900/40 bg-red-950/20 p-6 relative overflow-hidden">
    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-900/20 select-none">
      <Crosshair size={80} />
    </div>
    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Win Condition</p>
    <p className="text-white font-bold text-lg leading-relaxed relative z-10">{text}</p>
  </div>
);

const StrengthWeaknessSplit: React.FC<{
  p1Name: string; p2Name: string; p1Data: MatchupEntry; p2Data: MatchupEntry;
}> = ({ p1Name, p2Name, p1Data, p2Data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <Card className="border-t-4 border-t-red-600 bg-[#050505] !p-8">
      <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-wider flex items-center gap-3">
        <span className="bg-red-600 text-white px-2 py-1 text-sm font-black">P1</span>
        Playing As: {p1Name}
      </h2>
      <div className="space-y-8">
        <div>
          <h4 className="text-white font-bold uppercase tracking-widest mb-4 pb-2 border-b border-neutral-800 text-xs flex items-center gap-2">
            <Zap size={12} className="text-red-500" /> Relevant Strengths
          </h4>
          <ul className="space-y-3">
            {p1Data.my_strengths.map((s, i) => (
              <li key={i} className="flex gap-3 text-neutral-300 text-sm leading-relaxed">
                <ChevronRight className="text-red-500 shrink-0 mt-0.5" size={15} />{s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-neutral-500 font-bold uppercase tracking-widest mb-4 pb-2 border-b border-neutral-800 text-xs flex items-center gap-2">
            <X size={12} className="text-neutral-600" /> Vulnerabilities
          </h4>
          <ul className="space-y-3">
            {p2Data.their_weaknesses.map((w, i) => (
              <li key={i} className="flex gap-3 text-neutral-500 text-sm leading-relaxed">
                <X className="text-neutral-700 shrink-0 mt-0.5" size={15} />{w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
    <Card className="border-t-4 border-t-neutral-400 bg-[#050505] !p-8">
      <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-wider flex items-center gap-3">
        <span className="bg-white text-black px-2 py-1 text-sm font-black">P2</span>
        Opponent: {p2Name}
      </h2>
      <div className="space-y-8">
        <div>
          <h4 className="text-white font-bold uppercase tracking-widest mb-4 pb-2 border-b border-neutral-800 text-xs flex items-center gap-2">
            <Shield size={12} className="text-neutral-300" /> Their Strengths
          </h4>
          <ul className="space-y-3">
            {p2Data.my_strengths.map((s, i) => (
              <li key={i} className="flex gap-3 text-neutral-300 text-sm leading-relaxed">
                <ChevronRight className="text-neutral-400 shrink-0 mt-0.5" size={15} />{s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-neutral-500 font-bold uppercase tracking-widest mb-4 pb-2 border-b border-neutral-800 text-xs flex items-center gap-2">
            <X size={12} className="text-neutral-600" /> Their Weaknesses
          </h4>
          <ul className="space-y-3">
            {p1Data.their_weaknesses.map((w, i) => (
              <li key={i} className="flex gap-3 text-neutral-500 text-sm leading-relaxed">
                <X className="text-neutral-700 shrink-0 mt-0.5" size={15} />{w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  </div>
);

const TacticsSection: React.FC<{ tactics: string[] }> = ({ tactics }) => (
  <Card className="bg-[#050505] !p-8 md:!p-12">
    <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-widest border-b-2 border-neutral-800 pb-6">
      Winning Strategies
    </h3>
    <div className="space-y-6">
      {tactics.map((tactic, i) => {
        const colonIdx = tactic.indexOf(':');
        const label = colonIdx > -1 ? tactic.slice(0, colonIdx) : null;
        const body = colonIdx > -1 ? tactic.slice(colonIdx + 1).trim() : tactic;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col md:flex-row gap-4">
              <strong className="text-red-500 font-black font-mono text-2xl shrink-0 w-10">
                {String(i + 1).padStart(2, '0')}.
              </strong>
              <span className="text-neutral-400 leading-relaxed text-base">
                {label && <strong className="text-white uppercase tracking-wide">{label}: </strong>}
                {body}
              </span>
            </div>
            {i < tactics.length - 1 && <div className="w-full h-px bg-neutral-800" />}
          </React.Fragment>
        );
      })}
    </div>
  </Card>
);

const MatchupGuideView: React.FC<MatchupGuideViewProps> = ({
  style1Name, style2Name, onStyle1Change, onStyle2Change, navigate,
}) => {
  const { allStyles, matchupData } = useStyles();
  const p1Data = matchupData[style1Name]?.[style2Name];
  const p2Data = matchupData[style2Name]?.[style1Name];
  const sameStyle = style1Name === style2Name;
  const hasGuide = !!(p1Data && p2Data) && !sameStyle;

  const handleSwap = () => {
    const tmp = style1Name;
    onStyle1Change(style2Name);
    onStyle2Change(tmp);
  };

  return (
    <div className="space-y-8 view-enter">
      <SectionHeader
        title="Matchup Guide"
        subtitle={sameStyle
          ? 'Select two different styles to view a tactical breakdown.'
          : `Tactical breakdown: ${style1Name} vs ${style2Name}`}
        kanji="指南"
      />

      {/* Selectors + Swap */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-start gap-6 mb-10">
        <StyleSelector
          styles={allStyles}
          selectedStyle={style1Name}
          onSelect={onStyle1Change}
          label="Your Style — P1"
          sideColor="red"
        />
        
        <div className="flex justify-center pt-8">
          <button onClick={handleSwap} title="Swap styles"
            className="w-12 h-12 flex items-center justify-center border border-neutral-800 bg-[#0a0a0a] text-neutral-500 hover:text-white hover:border-neutral-600 transition-all rounded-full">
            <ArrowLeftRight size={18} />
          </button>
        </div>

        <StyleSelector
          styles={allStyles}
          selectedStyle={style2Name}
          onSelect={onStyle2Change}
          label="Opponent — P2"
          sideColor="neutral"
        />
      </div>

      <div className="border-t border-neutral-800" />

      {sameStyle ? (
        <div className="py-20 border border-neutral-900 bg-[#050505] relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-white to-red-600 opacity-50" />
          <Users size={48} className="text-neutral-800 mb-4" />
          <h2 className="text-3xl font-black text-white uppercase tracking-[0.3em] mb-2">Mirror Match</h2>
          <p className="text-neutral-500 text-sm max-w-xs mx-auto leading-relaxed uppercase tracking-widest font-mono">
            Combatants are identical. Victory depends entirely on individual skill and timing.
          </p>
          <div className="mt-8 flex gap-4">
            <div className="w-12 h-0.5 bg-red-600" />
            <div className="w-12 h-0.5 bg-white" />
            <div className="w-12 h-0.5 bg-red-600" />
          </div>
        </div>
      ) : !hasGuide ? (
        <Card className="border-dashed border-neutral-700 text-center !py-20">
          <p className="text-neutral-500 font-mono text-sm tracking-widest uppercase mb-3">No Guide Available</p>
          <p className="text-neutral-600 text-sm max-w-sm mx-auto leading-relaxed">
            A guide for <strong className="text-neutral-400">{style1Name}</strong> vs{' '}
            <strong className="text-neutral-400">{style2Name}</strong> hasn't been written yet.
            <br />Check back after the next data update.
          </p>
        </Card>
      ) : (
        <>
          <WinConditionBanner text={p1Data.win_condition} />
          <StrengthWeaknessSplit p1Name={style1Name} p2Name={style2Name} p1Data={p1Data} p2Data={p2Data} />
          <TacticsSection tactics={p1Data.tactics} />
        </>
      )}

      {!sameStyle && (
        <div className="border-t border-neutral-800 pt-6 flex justify-end">
          <Button variant="secondary" onClick={() => navigate('compare')}>
            ← Compare Stats Side-by-Side
          </Button>
        </div>
      )}
    </div>
  );
};

export default MatchupGuideView;
