import { NextResponse } from 'next/server';
import type { WinTotalLine, PecotaProjection, WinTotalComparison, CombinedData } from '@/app/lib/types';
import { MLB_TEAMS, logoPath } from '@/app/lib/teams';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

export async function GET() {
  const [wtRes, pecotaRes] = await Promise.all([
    fetch(`${BASE_URL}/api/wintotals`, { next: { revalidate: 900 } })
      .then(r => r.json())
      .catch(() => ({ data: [], error: 'Failed to fetch win totals' })),
    fetch(`${BASE_URL}/api/pecota`, { next: { revalidate: 900 } })
      .then(r => r.json())
      .catch(() => ({ data: [], error: 'Failed to fetch PECOTA data' })),
  ]);

  const wtData: WinTotalLine[] = wtRes.data ?? [];
  const pecotaData: PecotaProjection[] = pecotaRes.data ?? [];

  // Key both maps by abbrev (e.g. "NYY", "NYM")
  const wtMap = new Map(wtData.map((t: WinTotalLine) => [t.teamId, t]));
  const pecotaMap = new Map(pecotaData.map((t: PecotaProjection) => [t.teamId, t]));

  const comparisons: WinTotalComparison[] = [];

  for (const team of MLB_TEAMS) {
    const pecota = pecotaMap.get(team.abbrev);
    const wt = wtMap.get(team.abbrev);

    const moat = pecota && wt
      ? parseFloat((pecota.simWins - wt.total).toFixed(1))
      : null;

    const recommendation: WinTotalComparison['recommendation'] =
      moat == null ? null
      : moat > 0.5 ? 'OVER'
      : moat < -0.5 ? 'UNDER'
      : 'PUSH';

    comparisons.push({
      teamId: team.abbrev,
      teamFullName: team.fullName,
      teamAbbrev: team.abbrev,
      teamFileCode: team.fileCode,
      logoPath: logoPath(team),
      division: team.divisionShort,
      league: team.league,
      pecotaSimWins: pecota?.simWins ?? null,
      pecotaSimLosses: pecota?.simLosses ?? null,
      total: wt?.total ?? null,
      overOdds: wt?.overOdds ?? null,
      underOdds: wt?.underOdds ?? null,
      primaryBook: wt?.primaryBook ?? null,
      bookOdds: wt?.bookOdds ?? null,
      moat,
      recommendation,
    });
  }

  // Sort: both sources → by abs moat desc; PECOTA-only → by simWins desc; no data last
  comparisons.sort((a, b) => {
    const aBoth = a.moat !== null;
    const bBoth = b.moat !== null;
    if (aBoth && bBoth) return Math.abs(b.moat!) - Math.abs(a.moat!);
    if (aBoth) return -1;
    if (bBoth) return 1;
    return (b.pecotaSimWins ?? 0) - (a.pecotaSimWins ?? 0);
  });

  const result: CombinedData = {
    comparisons,
    lastUpdated: new Date().toISOString(),
    errors: {
      wintotals: wtRes.error ?? undefined,
      pecota: pecotaRes.error ?? undefined,
    },
  };

  return NextResponse.json(result);
}
