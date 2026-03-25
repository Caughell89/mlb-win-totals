import * as cheerio from 'cheerio';
import { findTeam } from './teams';
import type { PecotaProjection } from './types';

const PECOTA_URL = 'https://www.baseballprospectus.com/standings/';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

export async function scrapePecota(): Promise<{ data: PecotaProjection[]; error: string | null }> {
  try {
    const res = await fetch(PECOTA_URL, { headers: HEADERS, next: { revalidate: 900 } });
    if (!res.ok) {
      return { error: `Baseball Prospectus returned HTTP ${res.status}`, data: [] };
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const projections: PecotaProjection[] = [];

    $('#standings table').each((_, table) => {
      let simWCol = -1;
      let simLCol = -1;
      let currentDivision = '';

      $(table).find('thead tr, tbody tr').each((_, row) => {
        const $row = $(row);

        if ($row.closest('thead').length) {
          $row.find('th').each((colIdx, th) => {
            const $th = $(th);
            const divName = $th.find('h3').text().trim();
            if (divName) currentDivision = divName;
            const headerText = $th.text().replace(/\s+/g, '').toLowerCase();
            if (headerText === 'simw') simWCol = colIdx;
            if (headerText === 'siml') simLCol = colIdx;
          });
          return;
        }

        const cells = $row.find('td');
        if (!cells.length || simWCol === -1) return;

        const $teamCell = cells.eq(0);
        const rawName = $teamCell.find('span').first().text().trim()
          || $teamCell.find('a').text().trim().split(/[A-Z]{2,3}$/)[0].trim();

        const team = findTeam(rawName, currentDivision);
        if (!team) return;

        const simW = parseFloat(cells.eq(simWCol).text().trim());
        const simL = simLCol >= 0 ? parseFloat(cells.eq(simLCol).text().trim()) : 0;

        if (!isNaN(simW) && simW > 0) {
          projections.push({
            teamId: team.abbrev,
            teamName: team.fullName,
            simWins: simW,
            simLosses: isNaN(simL) ? 0 : simL,
            division: currentDivision,
          });
        }
      });
    });

    if (projections.length === 0) {
      return { error: 'Could not parse PECOTA standings. The page structure may have changed.', data: [] };
    }

    return { data: projections, error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err), data: [] };
  }
}
