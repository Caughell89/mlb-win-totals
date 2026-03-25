'use client';

interface Props {
  errors: { wintotals?: string; pecota?: string };
}

export default function ErrorBanner({ errors }: Props) {
  if (!errors.wintotals && !errors.pecota) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm space-y-2">
      <p className="font-semibold text-amber-800">Data source warnings</p>
      {errors.wintotals && (
        <p className="text-amber-700">
          <span className="font-mono text-xs bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">Win Totals</span>{' '}
          {errors.wintotals}
        </p>
      )}
      {errors.pecota && (
        <p className="text-amber-700">
          <span className="font-mono text-xs bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">PECOTA</span>{' '}
          {errors.pecota}
        </p>
      )}
    </div>
  );
}
