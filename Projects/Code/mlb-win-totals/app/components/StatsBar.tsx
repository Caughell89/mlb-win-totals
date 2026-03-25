'use client';

import type { WinTotalComparison } from '@/app/lib/types';

interface Props {
  comparisons: WinTotalComparison[];
}

export default function StatsBar({ comparisons }: Props) {
  const withLines = comparisons.filter(c => c.moat !== null);
  const overs = withLines.filter(c => c.recommendation === 'OVER').length;
  const unders = withLines.filter(c => c.recommendation === 'UNDER').length;
  const bigMoats = withLines.filter(c => Math.abs(c.moat!) >= 3).length;
  const withPecota = comparisons.filter(c => c.pecotaSimWins !== null);
  const avgSimW = withPecota.length
    ? (withPecota.reduce((s, c) => s + c.pecotaSimWins!, 0) / withPecota.length).toFixed(1)
    : '—';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[
        {
          label: 'Teams Loaded',
          value: comparisons.length,
          sub: `${withLines.length} with book lines`,
          accent: '#041E42',
          bar: withLines.length / 30,
        },
        {
          label: 'PECOTA Overs',
          value: overs,
          sub: `${unders} unders · ${withLines.length - overs - unders} neutral`,
          accent: '#15803d',
          bar: overs / Math.max(withLines.length, 1),
        },
        {
          label: 'High-Moat Edges',
          value: bigMoats,
          sub: '3+ win gap vs line',
          accent: '#BA0021',
          bar: bigMoats / 30,
        },
        {
          label: 'Avg PECOTA Sim W',
          value: avgSimW,
          sub: 'across all 30 teams',
          accent: '#b45309',
          bar: null,
        },
      ].map(({ label, value, sub, accent, bar }) => (
        <div key={label} className="relative bg-white rounded-xl p-5 shadow-sm border border-slate-200 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl" style={{ background: accent }} />
          <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">{label}</p>
          <p className="text-3xl font-black mt-2 leading-none" style={{ color: accent }}>{value}</p>
          <p className="text-[11px] mt-2 text-slate-400">{sub}</p>
          {bar !== null && (
            <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.round(bar * 100)}%`, background: accent, opacity: 0.5 }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
