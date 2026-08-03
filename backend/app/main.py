from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.database import data_status
from app.repository import get_player, search_players
from app.schemas import PlayerEvaluation, PlayerSearchResult

app = FastAPI(title="CourtVision API", version="0.1.0")

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


@app.get("/api/v1/players", response_model=list[PlayerSearchResult])
def players(q: str = Query(default="", max_length=80)) -> list[PlayerSearchResult]:
    return search_players(q)


@app.get("/api/v1/players/{slug}", response_model=PlayerEvaluation)
def player(slug: str) -> PlayerEvaluation:
    evaluation = get_player(slug)
    if evaluation is None:
        raise HTTPException(status_code=404, detail="Player not found")
    return evaluation
