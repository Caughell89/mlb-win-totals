import mlbTeamsData from './data/mlb-teams.json';

export interface MLBTeam {
  mlbId: number;
  name: string;           // "Yankees"
  locationName: string;   // "Bronx"
  fullName: string;       // "New York Yankees"
  abbrev: string;         // "NYY"
  fileCode: string;       // "nyy" — also used as logo filename
  espnCode: string;       // ESPN logo code
  league: string;         // "American League"
  leagueId: number;       // 103=AL, 104=NL
  division: string;       // "American League East"
  divisionId: number;
  divisionShort: string;  // "AL East"
}

export const MLB_TEAMS: MLBTeam[] = mlbTeamsData as MLBTeam[];

export function logoPath(team: MLBTeam): string {
  return `/images/teams/${team.fileCode}.png`;
}

/**
 * Find a team by name, optionally narrowed by PECOTA division string (e.g. "AL East").
 * This correctly disambiguates:
 *   - "New York" + "AL East" → Yankees,  "New York" + "NL East" → Mets
 *   - "Chicago"  + "AL Central" → White Sox, "Chicago" + "NL Central" → Cubs
 *   - "Los Angeles" in AL → Angels, in NL → Dodgers
 */
export function findTeam(raw: string, divisionHint?: string): MLBTeam | null {
  const q = raw.trim().toLowerCase();
  if (!q) return null;

  // Score each team and return best match
  let best: MLBTeam | null = null;
  let bestScore = 0;

  for (const team of MLB_TEAMS) {
    let score = 0;

    // Exact full name match
    if (q === team.fullName.toLowerCase()) score = 100;
    // Exact team name (mascot) match
    else if (q === team.name.toLowerCase()) score = 80;
    // Exact abbreviation match
    else if (q === team.abbrev.toLowerCase()) score = 80;
    // Full name contains query or query contains full name
    else if (team.fullName.toLowerCase().includes(q) || q.includes(team.fullName.toLowerCase())) score = 60;
    // Query ends with team mascot name
    else if (q.endsWith(team.name.toLowerCase())) score = 60;
    // Query starts with location name
    else if (q.startsWith(team.locationName.toLowerCase())) score = 50;
    // Location name contained in query
    else if (q.includes(team.locationName.toLowerCase())) score = 40;
    // Team name contained in query
    else if (q.includes(team.name.toLowerCase())) score = 40;

    if (score === 0) continue;

    // Division hint boosts score for ambiguous cities
    if (divisionHint && score >= 40) {
      const hint = divisionHint.trim().toUpperCase();
      const div = team.divisionShort.toUpperCase();
      if (hint === div || div.includes(hint) || hint.split(' ')[0] === div.split(' ')[0]) {
        score += 50;
      } else if (
        (hint.startsWith('AL') && team.leagueId === 103) ||
        (hint.startsWith('NL') && team.leagueId === 104)
      ) {
        score += 25;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = team;
    }
  }

  return bestScore >= 40 ? best : null;
}
