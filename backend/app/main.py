from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.database import combine_prospects, data_status, ingested_player_detail, initialize, search_ingested_players, team_context
from app.repository import get_player, search_players
from app.schemas import PlayerEvaluation, PlayerSearchResult

app = FastAPI(title="CourtVision API", version="0.1.0")


@app.on_event("startup")
def create_schema() -> None:
    initialize()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/data-status")
def database_status() -> dict[str, int]:
    return data_status()


@app.get("/api/v1/combine-prospects")
def draft_combine_prospects(season: str = Query(default="2024-25", pattern=r"^\d{4}-\d{2}$")) -> list[dict]:
    return combine_prospects(season)


@app.get("/api/v1/ingested-players/{slug}")
def ingested_player(slug: str) -> dict:
    detail = ingested_player_detail(slug)
    if detail is None:
        raise HTTPException(status_code=404, detail="Ingested player not found")
    return detail


@app.get("/api/v1/team-context/{team_code}")
def selected_team_context(team_code: str, player_slug: str | None = None) -> dict:
    return team_context(team_code, player_slug)


@app.get("/api/v1/players", response_model=list[PlayerSearchResult])
def players(q: str = Query(default="", max_length=80)) -> list[PlayerSearchResult]:
    rows = search_ingested_players(q.strip())
    if rows:
        return [PlayerSearchResult(slug=row["slug"], name=row["full_name"], team=row["team_name"] or "NBA", position=row["position"] or "") for row in rows]
    return search_players(q)


@app.get("/api/v1/players/{slug}", response_model=PlayerEvaluation)
def player(slug: str) -> PlayerEvaluation:
    evaluation = get_player(slug)
    if evaluation is None:
        raise HTTPException(status_code=404, detail="Player not found")
    return evaluation
