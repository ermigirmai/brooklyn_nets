"""Cache NBA player biography fields locally.

Run a small batch while developing, or omit --limit to refresh every player in
the local database. The frontend never calls the NBA endpoint directly.
"""
import argparse
import sys
import time
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from nba_api.stats.endpoints import commonplayerinfo

from app.database import connect, initialize


def ingest_player_bios(limit: int | None = None, player_id: int | None = None) -> int:
    initialize()
    with connect() as connection:
        if player_id is not None:
            players = connection.execute("SELECT person_id FROM players WHERE person_id=?", (player_id,)).fetchall()
        else:
            players = connection.execute("SELECT person_id FROM players ORDER BY person_id" + (" LIMIT ?" if limit else ""), (limit,) if limit else ()).fetchall()
        updated = 0
        for item in players:
            try:
                row = commonplayerinfo.CommonPlayerInfo(player_id=item["person_id"], timeout=20).get_data_frames()[0].to_dict("records")[0]
                connection.execute("""UPDATE players SET position=COALESCE(NULLIF(?, ''), position), height=?, weight=?, birthdate=?, school=?, country=?, draft_year=? WHERE person_id=?""",
                    (row.get("POSITION"), row.get("HEIGHT"), row.get("WEIGHT"), row.get("BIRTHDATE"), row.get("SCHOOL"), row.get("COUNTRY"), row.get("DRAFT_YEAR"), item["person_id"]))
                updated += 1
                time.sleep(0.15)
            except (IndexError, KeyError, TimeoutError):
                continue
        return updated


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int)
    parser.add_argument("--player-id", type=int)
    args = parser.parse_args()
    print(f"Updated {ingest_player_bios(args.limit, args.player_id)} player bios")
