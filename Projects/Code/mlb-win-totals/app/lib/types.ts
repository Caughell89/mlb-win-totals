export interface WinTotalLine {
  teamId: string;
  teamName: string;
  total: number;
  overOdds: number;
  underOdds: number;
  primaryBook: string;
  bookOdds: {
    book: string;
    total: number;
    overOdds: number;
    underOdds: number;
  }[];
}

export interface PecotaProjection {
  teamId: string;       // team abbrev e.g. "NYY"
  teamName: string;
  simWins: number;
  simLosses: number;
  division: string;     // e.g. "AL East"
}

export interface WinTotalComparison {
  teamId: string;
  teamFullName: string;
  teamAbbrev: string;
  teamFileCode: string;
  logoPath: string;
  division: string;
  league: string;
  // null if PECOTA data not available for this team
  pecotaSimWins: number | null;
  pecotaSimLosses: number | null;
  // null if sportsbook line not available
  total: number | null;
  overOdds: number | null;
  underOdds: number | null;
  primaryBook: string | null;
  bookOdds: WinTotalLine['bookOdds'] | null;
  moat: number | null;
  recommendation: 'OVER' | 'UNDER' | 'PUSH' | null;
}

export interface CombinedData {
  comparisons: WinTotalComparison[];
  lastUpdated: string;
  errors: {
    wintotals?: string;
    pecota?: string;
  };
}
