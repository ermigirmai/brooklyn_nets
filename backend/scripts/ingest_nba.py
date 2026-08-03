"""Fetch public NBA Stats data, normalize it, and upsert it into local SQLite.

Run: python scripts/ingest_nba.py --season 2025-26 --combine-season 2025-26
NBA Stats endpoints can rate-limit requests; this script is intentionally run
outside the web server and should be scheduled/cached rather than called by UI.
"""
import argparse
import re
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.database import connect, initialize
from nba_api.stats.endpoints import draftcombinestats, leaguedashplayerstats


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def value(row: dict, key: str):
    return row.get(key) if row.get(key) not in (None, "") else None


def ingest_season_advanced(season: str) -> int:
    response = leaguedashplayerstats.LeagueDashPlayerStats(season=season, measure_type_detailed_defense="Advanced")
    rows = response.get_data_frames()[0].to_dict("records")
    with connect() as connection:
        for row in rows:
            person_id = row["PLAYER_ID"]
            name = row["PLAYER_NAME"]
            connection.execute("""INSERT INTO players (person_id, slug, full_name, team_name, position, headshot_url)
              VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(person_id) DO UPDATE SET team_name=excluded.team_name, position=excluded.position""",
              (person_id, slugify(name), name, row.get("TEAM_ABBREVIATION"), row.get("PLAYER_POSITION"), f"https://cdn.nba.com/headshots/nba/latest/1040x760/{person_id}.png"))
            connection.execute("""INSERT INTO player_season_advanced_stats
              (person_id, season, gp, min, off_rating, def_rating, net_rating, usage_pct, ts_pct, pace, pie)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(person_id, season) DO UPDATE SET gp=excluded.gp, min=excluded.min, off_rating=excluded.off_rating, def_rating=excluded.def_rating, net_rating=excluded.net_rating, usage_pct=excluded.usage_pct, ts_pct=excluded.ts_pct, pace=excluded.pace, pie=excluded.pie""",
              (person_id, season, value(row, "GP"), value(row, "MIN"), value(row, "OFF_RATING"), value(row, "DEF_RATING"), value(row, "NET_RATING"), value(row, "USG_PCT"), value(row, "TS_PCT"), value(row, "PACE"), value(row, "PIE")))
    return len(rows)


def ingest_combine(season: str) -> int:
    response = draftcombinestats.DraftCombineStats(season_all_time=season)
    rows = response.get_data_frames()[0].to_dict("records")
    with connect() as connection:
        for row in rows:
            person_id, name = row["PLAYER_ID"], row["PLAYER_NAME"]
            connection.execute("""INSERT INTO draft_combine_measurements
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(person_id, season) DO UPDATE SET player_name=excluded.player_name""",
              (person_id, season, name, value(row, "HEIGHT_WO_SHOES"), value(row, "HEIGHT_W_SHOES"), value(row, "WEIGHT"), value(row, "WINGSPAN"), value(row, "STANDING_REACH"), value(row, "BODY_FAT_PCT"), value(row, "HAND_LENGTH"), value(row, "HAND_WIDTH")))
            connection.execute("""INSERT INTO draft_combine_tests
              VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(person_id, season) DO UPDATE SET player_name=excluded.player_name""",
              (person_id, season, name, value(row, "STANDING_VERTICAL_LEAP"), value(row, "MAX_VERTICAL_LEAP"), value(row, "LANE_AGILITY_TIME"), value(row, "THREE_QUARTER_SPRINT"), value(row, "BENCH_PRESS")))
    return len(rows)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--season", required=True)
    parser.add_argument("--combine-season", required=True)
    args = parser.parse_args()
    initialize()
    print(f"Upserted {ingest_season_advanced(args.season)} season advanced-stat rows")
    print(f"Upserted {ingest_combine(args.combine_season)} draft-combine rows")
