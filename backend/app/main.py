import os

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.database import (
    combine_prospects,
    data_status,
    ingested_player_detail,
    initialize,
    search_ingested_players,
    team_context,
)

app = FastAPI(title="CourtVision API", version="0.1.0")


@app.on_event("startup")
def initialize_database() -> None:
    initialize()

allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://[a-z0-9-]+\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/data-status")
def get_data_status() -> dict[str, int]:
    return data_status()


@app.get("/api/v1/combine-prospects")
def draft_combine_prospects(season: str = Query(default="2024-25", pattern=r"^\d{4}-\d{2}$")) -> list[dict]:
    return combine_prospects(season)


@app.get("/api/v1/ingested-players/{slug}")
def get_ingested_player(slug: str) -> dict:
    detail = ingested_player_detail(slug)
    if detail is None:
        raise HTTPException(status_code=404, detail="Ingested player not found")
    return detail


@app.get("/api/v1/team-context/{team_code}")
def get_team_context(team_code: str, player_slug: str | None = None) -> dict:
    return team_context(team_code, player_slug)


@app.get("/api/v1/players")
def search_players(q: str = Query(default="", max_length=80)) -> list[dict[str, str]]:
    rows = search_ingested_players(q.strip())
    return [
        {
            "slug": row["slug"],
            "name": row["full_name"],
            "team": row["team_name"] or "NBA",
            "position": row["position"] or "",
        }
        for row in rows
    ]
