# CourtVision — Player Evaluation Workspace

CourtVision is a full-stack NBA player-evaluation tool for basketball strategy staff. It consolidates the context needed to assess a player quickly—role, production, trajectory, shooting, contract, and analyst observations—without producing automated recommendations.

## Scope

The first release centers on one polished, shareable player profile with:

- Key production metrics and peer-group percentiles
- Multi-season trends and shooting context
- Contract snapshot and similar-player context
- Transparent composite measures, including Spacing and Creation Index
- Scout notes and clear metric definitions

## Technical direction

Next.js and TypeScript frontend · FastAPI backend · locally cached NBA data through a reproducible ETL pipeline · PostgreSQL in production.

The application is designed as a fast internal decision-support tool, not an AI general manager or trade recommender.
