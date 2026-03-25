import { Suspense } from 'react';
import Image from 'next/image';
import ComparisonTable from './components/ComparisonTable';
import ErrorBanner from './components/ErrorBanner';
import StatsBar from './components/StatsBar';
import { getCombinedData } from './lib/get-combined-data';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });
}

export default async function Home() {
  const data = await getCombinedData();

  return (
    <main className="min-h-screen" style={{ background: '#f4f7fb' }}>

      {/* Header — MLB navy */}
      <header className="sticky top-0 z-10 shadow-md" style={{ background: '#041E42' }}>
        <div className="max-w-7xl mx-auto px-8 sm:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/mlb-logo.png"
              alt="MLB"
              width={56}
              height={56}
              className="object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-white leading-none">Win Totals vs PECOTA</h1>
              <p className="text-sm mt-1" style={{ color: '#BFD7ED' }}>Sportsbook lines vs Baseball Prospectus projections</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold" style={{ color: '#BFD7ED', opacity: 0.55 }}>Last updated</span>
              <span className="text-xs font-medium mt-0.5" style={{ color: '#BFD7ED' }}>{formatDate(data.lastUpdated)}</span>
            </div>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-normal border border-[#BFD7ED] text-[#BFD7ED] bg-transparent hover:bg-[#BFD7ED] hover:text-[#041E42] active:opacity-75 transition-colors duration-150 select-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M8 16H3v5"/>
              </svg>
              Refresh
            </a>
          </div>
        </div>
      </header>

      {/* Red accent bar */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #BA0021 0%, #e8001a 50%, #BA0021 100%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <ErrorBanner errors={data.errors} />

        {data.comparisons.length > 0 && <StatsBar comparisons={data.comparisons} />}

        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {[
            { color: '#041E42', label: 'PECOTA Sim W', desc: 'Baseball Prospectus projected wins' },
            { color: '#b45309', label: 'Line', desc: 'Sportsbook season win total' },
            { color: '#15803d', label: 'Moat', desc: 'Sim W minus line · + means lean Over' },
          ].map(({ color, label, desc }) => (
            <div key={label} className="flex items-center gap-2 text-xs bg-white rounded-full px-3 py-1.5 border border-slate-200 shadow-sm">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="font-semibold text-slate-800">{label}</span>
              <span className="text-slate-400 hidden sm:inline">{desc}</span>
            </div>
          ))}
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">All 30 Teams</h2>
              <p className="text-xs text-slate-500 mt-0.5">Sorted by absolute moat — biggest edges first</p>
            </div>
          </div>
          <Suspense fallback={
            <div className="text-center py-16 text-slate-400 animate-pulse text-sm">Loading team data…</div>
          }>
            <ComparisonTable comparisons={data.comparisons} />
          </Suspense>
        </section>

        <footer className="border-t border-slate-200 pt-6 pb-8">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Sources</span>
            <a href="https://www.scoresandodds.com/mlb/futures" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 transition-colors underline underline-offset-2">ScoresAndOdds Win Totals</a>
            <a href="https://www.baseballprospectus.com/standings/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 transition-colors underline underline-offset-2">Baseball Prospectus PECOTA</a>
            <a href="https://www.mlb.com/standings" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 transition-colors underline underline-offset-2">MLB.com</a>
            <span>· Refreshes every 15 minutes · Not gambling advice</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
