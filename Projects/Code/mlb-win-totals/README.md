# MLB Win Totals vs PECOTA

A Next.js web app that compares MLB season win total lines from sportsbooks against PECOTA projected wins from Baseball Prospectus, helping identify the biggest edges for every team heading into the season.

## What It Does

- Scrapes current season win total lines (over/under) from [ScoresAndOdds](https://www.scoresandodds.com/mlb/futures)
- Scrapes PECOTA simulated win projections from [Baseball Prospectus](https://www.baseballprospectus.com/standings/)
- Calculates a **moat** (PECOTA Sim W minus sportsbook line) for all 30 teams
- Sorts teams by absolute moat — biggest edges (over or under) appear first
- Shows a signal (OVER / UNDER / PUSH) based on the direction of the gap

Data refreshes automatically every 15 minutes via Next.js ISR.

## Tech Stack

- [Next.js 16](https://nextjs.org) App Router with server components
- [Bun](https://bun.sh) as the package manager and runtime
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Cheerio](https://cheerio.js.org) for server-side HTML scraping
- [Vercel](https://vercel.com) for deployment

## Data Sources

| Source | Data |
|--------|------|
| [ScoresAndOdds](https://www.scoresandodds.com/mlb/futures) | Season win total lines (DraftKings, Caesars, Rivers) |
| [Baseball Prospectus](https://www.baseballprospectus.com/standings/) | PECOTA simulated wins & losses |
| [MLB.com](https://www.mlb.com/standings) | Authoritative 30-team model (divisions, abbreviations) |

## Getting Started

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:3000   # set to your Vercel URL in production
```

## Deploying to Vercel

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Set `NEXT_PUBLIC_BASE_URL` to your Vercel deployment URL
4. Deploy — every push to `main` will auto-redeploy

## Disclaimer

Data refreshes every 15 minutes. Not gambling advice.
