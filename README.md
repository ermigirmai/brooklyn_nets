# CourtVision — Player Evaluation Workspace

CourtVision is a full-stack NBA player-evaluation workspace for basketball
strategy staff. It brings season advanced production, shooting zones, draft
combine data, player context, and a contract-data ingestion path into one fast
React workflow. It deliberately does not generate trade recommendations.

## Run locally

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/ingest_nba.py --season 2024-25 --combine-season 2024-25 --shooting-player-id 201939
uvicorn app.main:app --reload
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The client reads `NEXT_PUBLIC_API_URL` when set,
otherwise it uses `http://localhost:8000`.

## Data and contracts

NBA data is fetched only by the ETL script and stored locally. NBA endpoints
can rate-limit, so ingestion belongs in a scheduled job in deployment rather
than a browser request. Load a reviewed contract CSV with:

```bash
cd backend
python scripts/import_contracts.py data_templates/contracts_template.csv
```

The template documents the required fields, including salary by season,
guarantees, player/team options, ETO, contract type, source and as-of date.
It intentionally contains no fabricated contracts. Before a live deployment,
replace it with an appropriately licensed/reviewed source export.

To generate the current team-balanced public-source CSV (top ten listed salaries
per team), run `python scripts/ingest_hoopshype_contracts.py`, review
`data/contracts_2026-27.csv`, then import it with `import_contracts.py`.

## Architecture and decisions

See [architecture notes](docs/architecture.md). The project uses Next.js +
TypeScript + React, FastAPI, Python `nba_api`, and SQLite locally. SQLite makes
the demo portable; PostgreSQL is the intended shared-environment replacement.

## AI disclosure

AI tooling was used as an implementation assistant for code scaffolding,
TypeScript/Python refactoring, debugging and documentation drafts. The product
concept, scope decisions, data requirements, and evaluation workflow were
defined by the project author. Before submission, replace this summary with the
actual tools used and concise prompt summaries from your own working history.

## Deployment readiness

`docker compose up --build` builds the API and web app. For a hosted deployment,
run the ingestion job before starting the API and mount/persist its database
volume; set `NEXT_PUBLIC_API_URL` to the public API URL at web build time.
Deployment to a named hosting account is not performed from this repository
because it requires the owner's credentials and a reviewed contract data source.
