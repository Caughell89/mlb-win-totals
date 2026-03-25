'use client';

import Image from 'next/image';
import type { WinTotalComparison } from '@/app/lib/types';

interface Props {
  comparisons: WinTotalComparison[];
}

function formatOdds(odds: number): string {
  return odds >= 0 ? `+${odds}` : `${odds}`;
}

function moatStyle(moat: number): { color: string; bg: string } {
  if (moat >= 4)  return { color: '#166534', bg: '#dcfce7' };
  if (moat >= 2)  return { color: '#15803d', bg: '#f0fdf4' };
  if (moat >= 0.5) return { color: '#3f6212', bg: '#f7fee7' };
  if (moat <= -4) return { color: '#991b1b', bg: '#fee2e2' };
  if (moat <= -2) return { color: '#b91c1c', bg: '#fff1f2' };
  if (moat <= -0.5) return { color: '#c2410c', bg: '#fff7ed' };
  return { color: '#64748b', bg: '#f1f5f9' };
}

function rowBg(moat: number): string {
  if (moat >= 4)  return '#f0fdf4';
  if (moat <= -4) return '#fff5f5';
  return '';
}

const SIGNAL_STYLES = {
  OVER:  { color: '#166534', bg: '#dcfce7' },
  UNDER: { color: '#991b1b', bg: '#fee2e2' },
  PUSH:  { color: '#475569', bg: '#f1f5f9' },
};

function SignalBadge({ rec }: { rec: WinTotalComparison['recommendation'] }) {
  if (rec === null) return <span className="text-slate-400 text-xs">—</span>;
  const { color, bg } = SIGNAL_STYLES[rec];
  return (
    <span
      className="inline-flex items-center justify-center gap-1 font-mono font-black text-sm px-3 py-1.5 rounded-full shadow-sm"
      style={{ color, background: bg, border: `1.5px solid ${color}30` }}
    >
      {rec === 'OVER' ? '↑' : rec === 'UNDER' ? '↓' : '→'} {rec}
    </span>
  );
}

const Dash = () => <span className="text-slate-400">—</span>;

export default function ComparisonTable({ comparisons }: Props) {
  if (comparisons.length === 0) {
    return <div className="text-center py-16 text-slate-400">No data available.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#041E42' }} className="text-left text-xs uppercase tracking-wide">
            <th className="px-4 py-3 font-semibold w-8 text-white">#</th>
            <th className="px-4 py-3 font-semibold text-white">Team</th>
            <th className="px-4 py-3 font-semibold hidden sm:table-cell text-white">Division</th>
            <th className="px-4 py-3 font-semibold text-center text-white">PECOTA Sim W</th>
            <th className="px-4 py-3 font-semibold text-center hidden md:table-cell text-white">Sim L</th>
            <th className="px-4 py-3 font-semibold text-center text-white">Line</th>
            <th className="px-4 py-3 font-semibold text-center hidden lg:table-cell text-white">Over</th>
            <th className="px-4 py-3 font-semibold text-center hidden lg:table-cell text-white">Under</th>
            <th className="px-4 py-3 font-semibold text-center text-white">Moat</th>
            <th className="px-4 py-3 font-semibold text-center text-white">Signal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {comparisons.map((row, idx) => {
            const bg = rowBg(row.moat ?? 0);
            return (
              <tr
                key={row.teamId}
                className="transition-colors hover:bg-slate-50"
                style={bg ? { background: bg } : undefined}
              >
                <td className="px-4 py-3 text-slate-400 font-mono text-xs select-none">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow border border-slate-100 flex items-center justify-center p-1">
                      <Image
                        src={row.logoPath}
                        alt={row.teamFullName}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight" style={{ color: '#041E42' }}>{row.teamFullName}</div>
                      <div className="text-slate-500 text-xs font-mono mt-0.5">{row.teamAbbrev}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">{row.division}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {row.pecotaSimWins != null
                    ? <span className="font-mono font-black text-base" style={{ color: '#041E42' }}>{row.pecotaSimWins.toFixed(1)}</span>
                    : <Dash />}
                </td>
                <td className="px-4 py-3 text-center font-mono text-slate-500 text-xs hidden md:table-cell">
                  {row.pecotaSimLosses != null ? row.pecotaSimLosses.toFixed(1) : <Dash />}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.total != null ? (
                    <div>
                      <span className="font-mono font-black text-base" style={{ color: '#92400e' }}>{row.total}</span>
                      {row.primaryBook && (
                        <div className="text-slate-400 text-[10px] capitalize mt-0.5">{row.primaryBook}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">no line</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-mono text-slate-600 text-xs hidden lg:table-cell">
                  {row.overOdds != null ? formatOdds(row.overOdds) : <Dash />}
                </td>
                <td className="px-4 py-3 text-center font-mono text-slate-600 text-xs hidden lg:table-cell">
                  {row.underOdds != null ? formatOdds(row.underOdds) : <Dash />}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.moat != null ? (() => {
                    const { color, bg: mbg } = moatStyle(row.moat);
                    return (
                      <span
                        className="inline-flex items-center justify-center font-mono font-black text-sm px-3 py-1.5 rounded-full shadow-sm"
                        style={{ color, background: mbg, border: `1.5px solid ${color}30` }}
                      >
                        {row.moat > 0 ? '+' : ''}{row.moat.toFixed(1)}
                      </span>
                    );
                  })() : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <SignalBadge rec={row.recommendation} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
