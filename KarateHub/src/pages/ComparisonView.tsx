import { ArrowLeftRight } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import { StyleSelector } from '../components/ui/StyleSelector';
import { useStyles } from '../hooks/useStyles';
import type { StyleData, StatValue } from '../types';
import { STAT_LABELS, MOVE_LABELS, LOWER_IS_BETTER, formatStatValue } from '../types';

// Hook-based data will be used inside the component


// Color coding per type for visual differentiation
const TYPE_COLORS: Record<string, string> = {
  'Offensive':        'text-orange-400 border-orange-900/50 bg-orange-950/20',
  'Counter-Offensive':'text-sky-400   border-sky-900/50   bg-sky-950/20',
  'Defensive':        'text-emerald-400 border-emerald-900/50 bg-emerald-950/20',
};

function getTypeBadge(type?: string) {
  if (!type) return null;
  const cls = TYPE_COLORS[type] ?? 'text-neutral-400 border-neutral-700 bg-neutral-900/20';
  return (
    <span className={`text-[9px] font-bold border px-1.5 py-0.5 tracking-widest uppercase rounded-sm ${cls}`}>
      {type}
    </span>
  );
}

function getAllStatKeys(
  moveName: string,
  s1: StyleData,
  s2: StyleData
): string[] {
  const keys = new Set<string>();
  const m1 = s1.moves[moveName];
  const m2 = s2.moves[moveName];
  if (m1) Object.keys(m1).forEach((k) => keys.add(k));
  if (m2) Object.keys(m2).forEach((k) => keys.add(k));
  return Array.from(keys);
}

/** Returns 1 if p1 wins, 2 if p2 wins, 0 if tie / not comparable */
function getWinner(key: string, v1: StatValue | undefined, v2: StatValue | undefined): 0 | 1 | 2 {
  // Only numeric values can be compared
  if (typeof v1 !== 'number' || typeof v2 !== 'number') return 0;
  if (v1 === v2) return 0;
  const lowerBetter = LOWER_IS_BETTER[key] ?? false;
  if (lowerBetter) return v1 < v2 ? 1 : 2;
  return v1 > v2 ? 1 : 2;
}

interface ComparisonViewProps {
  selectedStyle1: string;
  selectedStyle2: string;
  onStyle1Change: (name: string) => void;
  onStyle2Change: (name: string) => void;
  navigate: (view: string) => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
  selectedStyle1,
  selectedStyle2,
  onStyle1Change,
  onStyle2Change,
  navigate,
}) => {
  const { allStyles } = useStyles();
  const [swapSpinning, setSwapSpinning] = useState(false);

  const style1 = allStyles.find((s) => s.name === selectedStyle1) ?? allStyles[0];
  const style2 = allStyles.find((s) => s.name === selectedStyle2) ?? allStyles[1];

  const moveNames = Array.from(
    new Set([...Object.keys(style1.moves), ...Object.keys(style2.moves)])
  ) as string[];

  // Tally numeric advantages
  let p1Wins = 0, p2Wins = 0;
  for (const moveName of moveNames) {
    const statKeys = getAllStatKeys(moveName, style1, style2);
    for (const key of statKeys) {
      const v1 = style1.moves[moveName]?.[key];
      const v2 = style2.moves[moveName]?.[key];
      const w = getWinner(key, v1, v2);
      if (w === 1) p1Wins++;
      else if (w === 2) p2Wins++;
    }
  }
  const totalDecided = p1Wins + p2Wins;

  const handleSwap = () => {
    setSwapSpinning(true);
    const tmp = selectedStyle1;
    onStyle1Change(selectedStyle2);
    onStyle2Change(tmp);
    setTimeout(() => setSwapSpinning(false), 400);
  };

  const sameStyle = selectedStyle1 === selectedStyle2;

  return (
    <div className="view-enter">
      <SectionHeader
        title="Compare Data"
        subtitle="Evaluate move stats side-by-side to find the ultimate advantage."
        kanji="比較"
      />

      {/* Style Selectors + Swap */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-start gap-6 mb-10">
        {/* Style 1 */}
        <StyleSelector
          styles={allStyles}
          selectedStyle={selectedStyle1}
          onSelect={onStyle1Change}
          label="Style 1 — Red Side"
          sideColor="red"
        />

        {/* Swap */}
        <div className="flex justify-center pt-8">
          <button
            onClick={handleSwap}
            title="Swap styles"
            className="w-12 h-12 flex items-center justify-center border border-neutral-800 bg-[#0a0a0a] text-neutral-500 hover:text-white hover:border-neutral-600 transition-all rounded-full"
          >
            <ArrowLeftRight size={18} className={swapSpinning ? 'spin-once' : ''} />
          </button>
        </div>

        {/* Style 2 */}
        <StyleSelector
          styles={allStyles}
          selectedStyle={selectedStyle2}
          onSelect={onStyle2Change}
          label="Style 2 — White Side"
          sideColor="neutral"
        />
      </div>

      {/* Advantage scoreline */}
      {!sameStyle && totalDecided > 0 && (
        <div className="mb-8 border border-neutral-800 bg-[#0a0a0a] px-6 py-4 flex flex-wrap items-center gap-4">
          <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Stat Advantage</span>
          <div className="flex items-center gap-3 flex-1">
            <span className={`font-black font-mono text-lg ${p1Wins > p2Wins ? 'text-red-500' : 'text-neutral-500'}`}>
              {style1.name} {p1Wins}
            </span>
            <span className="text-neutral-700 font-mono">—</span>
            <span className={`font-black font-mono text-lg ${p2Wins > p1Wins ? 'text-white' : 'text-neutral-500'}`}>
              {p2Wins} {style2.name}
            </span>
          </div>
          <span className="text-[10px] text-neutral-700 font-mono uppercase tracking-widest">
            out of {totalDecided} numeric stats
          </span>
        </div>
      )}

      {sameStyle && (
        <div className="mb-8 border border-amber-900/40 bg-amber-950/10 px-6 py-4 text-amber-600 text-sm font-mono tracking-wide">
          ⚠ Same style on both sides — comparison will show identical values.
        </div>
      )}

      {/* Per-Move Tables */}
      <div className="space-y-10">
        {moveNames.map((moveName) => {
          const m1 = style1.moves[moveName];
          const m2 = style2.moves[moveName];
          const statKeys = getAllStatKeys(moveName, style1, style2);

          return (
            <div key={moveName}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest">Move</span>
                <h2 className="text-base font-black text-white uppercase tracking-wider">
                  {MOVE_LABELS[moveName] ?? moveName}
                </h2>
                <div className="flex-1 h-px bg-neutral-800" />
              </div>

              <div className="border border-neutral-800 overflow-x-auto bg-[#0a0a0a]">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-[#050505]">
                      <th className="p-4 text-neutral-600 font-mono uppercase text-[10px] tracking-widest w-2/5">
                        Attribute
                      </th>
                      {/* P1 header with type badge */}
                      <th className="p-3 border-l border-neutral-800 text-center w-[30%]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-red-400 font-black uppercase tracking-wider text-sm">{style1.name}</span>
                          {getTypeBadge(style1.type)}
                        </div>
                      </th>
                      {/* P2 header with type badge */}
                      <th className="p-3 border-l border-neutral-800 text-center w-[30%]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-neutral-300 font-black uppercase tracking-wider text-sm">{style2.name}</span>
                          {getTypeBadge(style2.type)}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statKeys.map((key) => {
                      const v1: StatValue | undefined = m1?.[key];
                      const v2: StatValue | undefined = m2?.[key];
                      const winner = getWinner(key, v1, v2);
                      return (
                        <tr key={key} className="border-b border-neutral-800/40 last:border-0 hover:bg-[#111] transition-colors">
                          <td className="p-4 text-neutral-500 font-bold uppercase text-[10px] tracking-widest">
                            {STAT_LABELS[key] ?? key.replace(/_/g, ' ')}
                          </td>
                          <td className={`p-4 text-center font-mono border-l border-neutral-800 text-sm ${
                            winner === 1 ? 'text-white font-bold bg-red-900/20' : 'text-neutral-500'
                          }`}>
                            {v1 !== undefined ? formatStatValue(key, v1) : <span className="text-neutral-800">—</span>}
                            {winner === 1 && <span className="ml-1.5 text-red-500 text-xs">▲</span>}
                          </td>
                          <td className={`p-4 text-center font-mono border-l border-neutral-800 text-sm ${
                            winner === 2 ? 'text-white font-bold bg-white/5' : 'text-neutral-500'
                          }`}>
                            {v2 !== undefined ? formatStatValue(key, v2) : <span className="text-neutral-800">—</span>}
                            {winner === 2 && <span className="ml-1.5 text-neutral-300 text-xs">▲</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend + Guide CTA */}
      <div className="mt-10 border-t border-neutral-900 pt-6 flex flex-wrap items-center gap-6">
        <div className="flex flex-wrap gap-6 text-[10px] font-mono text-neutral-700 uppercase tracking-widest">
          <span className="flex items-center gap-2"><span className="text-red-500">▲</span> Red side advantage</span>
          <span className="flex items-center gap-2"><span className="text-neutral-400">▲</span> White side advantage</span>
          <span className="hidden sm:block">— = stat not present for this style</span>
        </div>
        {!sameStyle && (
          <div className="ml-auto">
            <Button onClick={() => navigate('guide')}>View Matchup Guide →</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonView;
