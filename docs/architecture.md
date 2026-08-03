# Architecture

CourtVision uses a deliberately small full-stack architecture: a Next.js/React
client reads a FastAPI API; FastAPI serves a local SQLite read model; separate
Python ETL commands fetch and normalize public NBA data. The browser never
calls NBA Stats directly.

```
NBA Stats endpoints -> ETL scripts -> SQLite -> FastAPI -> Next.js / React
reviewed contract CSV -> contract importer --^
```

## Why this shape

It keeps the UI fast and reliable, allows endpoint retries/rate-limit handling
outside request paths, and makes the displayed analysis reproducible for a
given ingest date. SQLite is intentional for the interview deployment: it
eliminates infrastructure while retaining normalized tables. PostgreSQL can
replace it in a multi-user production deployment without changing the API.

## Data contract

- Advanced season production: `LeagueDashPlayerStats` (NBA Stats)
- Shooting zones: `ShotChartDetail` (NBA Stats), ingested selectively
- Draft combine measures and tests: `DraftCombineStats` (NBA Stats)
- Bio/headshots: player metadata and NBA CDN headshot URLs
- Contracts: a reviewed CSV with a source URL and `as_of_date`; NBA does not
  expose a free official API for player/team options or contract type.

Similarity is a transparent Euclidean distance over z-score normalized
same-season advanced metrics (ORtg, DRtg, NetRtg, USG%, TS%, Pace, PIE), with a
20-minute-per-game minimum. It is an exploration aid, not a recommendation or value
model.
