import * as cheerio from 'cheerio';
import { findTeam } from './teams';
import type { WinTotalLine } from './types';

const SAO_URL = 'https://www.scoresandodds.com/mlb/futures/total-wins';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

function parseOdds(raw: string): number {
  const s = raw.trim().toLowerCase();
  if (s === 'even' || s === 'pk') return 100;
  const n = parseInt(s.replace(/[^0-9\-+]/g, ''), 10);
  return isNaN(n) ? -110 : n;
}

export async function scrapeWinTotals(): Promise<{ data: WinTotalLine[]; error: string | null }> {
  try {
    const res = await fetch(SAO_URL, { headers: HEADERS, next: { revalidate: 900 } });
    if (!res.ok) {
      return { error: `scoresandodds.com returned HTTP ${res.status}`, data: [] };
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const table = $('#odds-table--total-wins');

    if (!table.length) {
      return { error: 'Could not find win totals table on scoresandodds.com', data: [] };
    }

    const books: string[] = [];
    table.find('thead th.book-logo img').each((_, img) => {
      books.push($(img).attr('alt') ?? 'unknown');
    });

    const lines: WinTotalLine[] = [];
    const rows = table.find('tbody tr').toArray();

    let i = 0;
    while (i < rows.length) {
      const overRow = $(rows[i]);
      const underRow = rows[i + 1] ? $(rows[i + 1]) : null;

      const teamCell = overRow.find('td.bet-type.team');
      if (!teamCell.length) { i++; continue; }

      const dataContent = teamCell.attr('data-content') ?? '';
      const rawTeam = dataContent.match(/data-filter="([^"]+)"/)?.[1]
        ?? teamCell.find('a').attr('aria-label')
        ?? teamCell.text().trim();

      const team = findTeam(rawTeam);
      if (!team) { i += 2; continue; }

      const overCells = overRow.find('td.game-odds').toArray();
      const underCells = underRow ? underRow.find('td.game-odds').toArray() : [];

      const bookOdds: WinTotalLine['bookOdds'] = [];

      overCells.forEach((cell, colIdx) => {
        const total = parseFloat($(cell).find('.data-value').text().trim());
        const overOddsRaw = $(cell).find('.data-odds').text().trim();
        const underOddsRaw = underCells[colIdx]
          ? $(underCells[colIdx]).find('.data-odds').text().trim()
          : '';

        if (!isNaN(total) && total > 0) {
          bookOdds.push({
            book: books[colIdx] ?? `book${colIdx}`,
            total,
            overOdds: parseOdds(overOddsRaw),
            underOdds: parseOdds(underOddsRaw),
          });
        }
      });

      if (bookOdds.length > 0) {
        const highlightedTd = overRow.find('td.game-odds a.highlight').closest('td');
        const primaryIdx = highlightedTd.length
          ? overRow.find('td.game-odds').index(highlightedTd)
          : 0;
        const primary = bookOdds[Math.max(0, primaryIdx)] ?? bookOdds[0];

        lines.push({
          teamId: team.abbrev,
          teamName: team.fullName,
          total: primary.total,
          overOdds: primary.overOdds,
          underOdds: primary.underOdds,
          primaryBook: primary.book,
          bookOdds,
        });
      }

      i += 2;
    }

    if (lines.length === 0) {
      return { error: 'No win total lines found on scoresandodds.com', data: [] };
    }

    return { data: lines, error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err), data: [] };
  }
}
