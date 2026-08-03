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
        CREATE TABLE IF NOT EXISTS player_shooting_zones (
          person_id INTEGER NOT NULL,
          season TEXT NOT NULL,
          zone TEXT NOT NULL,
          fga INTEGER,
          fgm INTEGER,
          fg_pct REAL,
          PRIMARY KEY (person_id, season, zone)
        );
        CREATE TABLE IF NOT EXISTS player_contracts (
          person_id INTEGER PRIMARY KEY,
          contract_type TEXT,
          total_value INTEGER,
          guaranteed_value INTEGER,
          current_salary INTEGER,
          cap_hit INTEGER,
          years_remaining INTEGER,
          team_code TEXT,
          as_of_date TEXT NOT NULL,
          source TEXT NOT NULL,
          source_url TEXT
        );
        CREATE TABLE IF NOT EXISTS contract_years (
          person_id INTEGER NOT NULL,
          season TEXT NOT NULL,
          salary INTEGER,
          guaranteed INTEGER,
          player_option INTEGER NOT NULL DEFAULT 0,
          team_option INTEGER NOT NULL DEFAULT 0,
          early_termination_option INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (person_id, season)
        );
        CREATE TABLE IF NOT EXISTS darko_metrics (
          person_id INTEGER PRIMARY KEY,
          dpm REAL, off_dpm REAL, def_dpm REAL, fair_salary REAL, salary REAL,
          surplus REAL, as_of_date TEXT NOT NULL, source_url TEXT NOT NULL
        );
        """)
        for column in ("pts REAL", "ast REAL", "reb REAL", "oreb REAL", "dreb REAL", "fg3_pct REAL", "ft_pct REAL", "stl REAL", "efg_pct REAL"):
            try:
                connection.execute(f"ALTER TABLE player_season_advanced_stats ADD COLUMN {column}")
            except sqlite3.OperationalError:
                pass
        columns = {row["name"] for row in connection.execute("PRAGMA table_info(player_contracts)")}
        if "team_code" not in columns:
            connection.execute("ALTER TABLE player_contracts ADD COLUMN team_code TEXT")


def data_status() -> dict[str, int]:
    with connect() as connection:
        return {
            "players": connection.execute("SELECT COUNT(*) FROM players").fetchone()[0],
            "advanced_stat_rows": connection.execute("SELECT COUNT(*) FROM player_season_advanced_stats").fetchone()[0],
            "combine_measurements": connection.execute("SELECT COUNT(*) FROM draft_combine_measurements").fetchone()[0],
            "combine_tests": connection.execute("SELECT COUNT(*) FROM draft_combine_tests").fetchone()[0],
            "contracts": connection.execute("SELECT COUNT(*) FROM player_contracts").fetchone()[0],
        }


def search_ingested_players(query: str, limit: int = 12) -> list[sqlite3.Row]:
    with connect() as connection:
        return connection.execute("""SELECT slug, full_name, team_name, position FROM players
          WHERE full_name LIKE ? ORDER BY full_name LIMIT ?""", (f"%{query}%", limit)).fetchall()


def team_context(team_code: str, player_slug: str | None = None) -> dict:
    with connect() as connection:
        team_code = team_code.upper()
        season_row = connection.execute("SELECT season FROM player_season_advanced_stats ORDER BY season DESC LIMIT 1").fetchone()
        season = season_row["season"] if season_row else ""
        roster = connection.execute("""SELECT p.person_id, p.full_name, s.pts, s.ast, s.reb, s.oreb, s.dreb, s.fg3_pct, s.ft_pct, s.stl, s.efg_pct, s.off_rating, s.def_rating, s.net_rating, s.usage_pct, s.ts_pct, s.pie
          FROM players p JOIN player_season_advanced_stats s ON s.person_id=p.person_id
          WHERE p.team_name=? AND s.season=? ORDER BY s.min DESC LIMIT 5""", (team_code, season)).fetchall()
        keys = ("pts", "ast", "reb", "oreb", "dreb", "fg3_pct", "ft_pct", "stl", "efg_pct", "off_rating", "def_rating", "net_rating", "usage_pct", "ts_pct", "pie")
        averages = {key: round(sum(float(row[key] or 0) for row in roster) / len(roster), 3) if roster else None for key in keys}
        payroll = connection.execute("SELECT COALESCE(SUM(current_salary), 0), COUNT(*) FROM player_contracts WHERE team_code=?", (team_code,)).fetchone()
        darko = connection.execute("""SELECT AVG(d.dpm), AVG(d.off_dpm), AVG(d.def_dpm)
          FROM darko_metrics d JOIN players p ON p.person_id=d.person_id WHERE p.team_name=?""", (team_code,)).fetchone()
        contract_years = connection.execute("""SELECT y.season, SUM(y.salary) AS payroll
          FROM contract_years y JOIN player_contracts c ON c.person_id=y.person_id
          WHERE c.team_code=? GROUP BY y.season ORDER BY y.season""", (team_code,)).fetchall()
        shooting = connection.execute("""SELECT z.zone, SUM(z.fga) AS fga, SUM(z.fgm) AS fgm,
          CAST(SUM(z.fgm) AS REAL) / NULLIF(SUM(z.fga), 0) AS fg_pct
          FROM player_shooting_zones z JOIN players p ON p.person_id=z.person_id
          WHERE p.team_name=? AND z.season=? GROUP BY z.zone ORDER BY SUM(z.fga) DESC""", (team_code, season)).fetchall()
        relative = None
        if player_slug:
            player = connection.execute("SELECT person_id FROM players WHERE slug=?", (player_slug,)).fetchone()
            target = connection.execute("SELECT * FROM player_season_advanced_stats WHERE person_id=? AND season=?", (player["person_id"], season)).fetchone() if player else None
            if target and roster:
                relative = {key: round(float(target[key] or 0) - float(averages[key] or 0), 3) for key in keys}
        return {"team_code": team_code, "season": season, "roster_count": len(roster), "team_averages": averages, "player_delta": relative, "contract_payroll": payroll[0], "contracted_players": payroll[1], "contract_years": [dict(row) for row in contract_years], "shooting_zones": [dict(row) for row in shooting], "darko_averages": {"dpm": darko[0], "off_dpm": darko[1], "def_dpm": darko[2]}}


def similar_ingested_players(person_id: int, season: str, limit: int = 5) -> list[dict]:
    """Nearest players using z-score-normalized, same-season advanced metrics."""
    with connect() as connection:
        target = connection.execute("SELECT off_rating, def_rating, net_rating, usage_pct, ts_pct, pace, pie FROM player_season_advanced_stats WHERE person_id=? AND season=?", (person_id, season)).fetchone()
        if not target:
            return []
        rows = connection.execute("""SELECT p.slug, p.full_name, p.team_name, s.off_rating, s.def_rating, s.net_rating, s.usage_pct, s.ts_pct, s.pace, s.pie FROM player_season_advanced_stats s JOIN players p ON p.person_id=s.person_id WHERE s.season=? AND s.person_id!=? AND s.min>=20""", (season, person_id)).fetchall()
        if not rows:
            return []
        keys = ("off_rating", "def_rating", "net_rating", "usage_pct", "ts_pct", "pace", "pie")
        means = {key: sum(float(row[key] or 0) for row in rows) / len(rows) for key in keys}
        deviations = {key: (sum((float(row[key] or 0) - means[key]) ** 2 for row in rows) / len(rows)) ** 0.5 or 1 for key in keys}
        scored = [(sum(((float(row[key] or 0) - float(target[key] or 0)) / deviations[key]) ** 2 for key in keys) ** 0.5, row) for row in rows]
        return [{"slug": row["slug"], "name": row["full_name"], "team": row["team_name"], "distance": round(distance, 2)} for distance, row in sorted(scored, key=lambda item: item[0])[:limit]]


def ingested_player_detail(slug: str) -> dict | None:
    with connect() as connection:
        player = connection.execute("SELECT * FROM players WHERE slug = ?", (slug,)).fetchone()
        if not player:
            return None
        person_id = player["person_id"]
        history = connection.execute("SELECT * FROM player_season_advanced_stats WHERE person_id = ? ORDER BY season", (person_id,)).fetchall()
        advanced = history[-1] if history else None
        measurements = connection.execute("SELECT * FROM draft_combine_measurements WHERE person_id = ? ORDER BY season DESC LIMIT 1", (person_id,)).fetchone()
        tests = connection.execute("SELECT * FROM draft_combine_tests WHERE person_id = ? ORDER BY season DESC LIMIT 1", (person_id,)).fetchone()
        shooting = connection.execute("SELECT zone, fga, fgm, fg_pct FROM player_shooting_zones WHERE person_id = ? AND season = ? ORDER BY fga DESC", (person_id, advanced["season"] if advanced else "")).fetchall()
        contract = connection.execute("SELECT * FROM player_contracts WHERE person_id = ?", (person_id,)).fetchone()
        contract_years = connection.execute("SELECT * FROM contract_years WHERE person_id = ? ORDER BY season", (person_id,)).fetchall()
        darko = connection.execute("SELECT * FROM darko_metrics WHERE person_id = ?", (person_id,)).fetchone()
        return {"player": dict(player), "advanced_season": dict(advanced) if advanced else None, "advanced_history": [dict(row) for row in history], "similar_players": similar_ingested_players(person_id, advanced["season"]) if advanced else [], "shooting_zones": [dict(row) for row in shooting], "combine_measurements": dict(measurements) if measurements else None, "combine_tests": dict(tests) if tests else None, "contract": dict(contract) if contract else None, "contract_years": [dict(row) for row in contract_years], "darko": dict(darko) if darko else None}
