import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).resolve().parents[1] / "data" / "courtvision.db"


def connect() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize() -> None:
    with connect() as connection:
        connection.executescript("""
        CREATE TABLE IF NOT EXISTS players (
          person_id INTEGER PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          team_name TEXT,
          position TEXT,
          height TEXT,
          weight TEXT,
          birthdate TEXT,
          headshot_url TEXT
        );
        CREATE TABLE IF NOT EXISTS player_season_advanced_stats (
          person_id INTEGER NOT NULL,
          season TEXT NOT NULL,
          gp INTEGER,
          min REAL,
          off_rating REAL,
          def_rating REAL,
          net_rating REAL,
          usage_pct REAL,
          ts_pct REAL,
          pace REAL,
          pie REAL,
          PRIMARY KEY (person_id, season)
        );
        CREATE TABLE IF NOT EXISTS draft_combine_measurements (
          person_id INTEGER NOT NULL,
          season TEXT NOT NULL,
          player_name TEXT NOT NULL,
          height_wo_shoes REAL,
          height_w_shoes REAL,
          weight REAL,
          wingspan REAL,
          standing_reach REAL,
          body_fat_pct REAL,
          hand_length REAL,
          hand_width REAL,
          PRIMARY KEY (person_id, season)
        );
        CREATE TABLE IF NOT EXISTS draft_combine_tests (
          person_id INTEGER NOT NULL,
          season TEXT NOT NULL,
          player_name TEXT NOT NULL,
          standing_vertical REAL,
          max_vertical REAL,
          lane_agility REAL,
          three_quarter_sprint REAL,
          bench_press REAL,
          PRIMARY KEY (person_id, season)
        );
        """)


def data_status() -> dict[str, int]:
    with connect() as connection:
        return {
            "players": connection.execute("SELECT COUNT(*) FROM players").fetchone()[0],
            "advanced_stat_rows": connection.execute("SELECT COUNT(*) FROM player_season_advanced_stats").fetchone()[0],
            "combine_measurements": connection.execute("SELECT COUNT(*) FROM draft_combine_measurements").fetchone()[0],
            "combine_tests": connection.execute("SELECT COUNT(*) FROM draft_combine_tests").fetchone()[0],
        }


def search_ingested_players(query: str, limit: int = 12) -> list[sqlite3.Row]:
    with connect() as connection:
        return connection.execute("""SELECT slug, full_name, team_name, position FROM players
          WHERE full_name LIKE ? ORDER BY full_name LIMIT ?""", (f"%{query}%", limit)).fetchall()
