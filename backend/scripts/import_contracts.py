"""Import a reviewed, date-stamped contract CSV into CourtVision's local store.

The NBA does not publish a free contract/options API. Contract data is therefore
an analyst-curated input, never fetched by the browser or scraped at runtime.
Run: python scripts/import_contracts.py ../data_templates/contracts_template.csv
"""
import csv
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))
from app.database import connect, initialize

TEAM_CODES = {"atlanta-hawks":"ATL", "boston-celtics":"BOS", "brooklyn-nets":"BKN", "charlotte-hornets":"CHA", "chicago-bulls":"CHI", "cleveland-cavaliers":"CLE", "dallas-mavericks":"DAL", "denver-nuggets":"DEN", "detroit-pistons":"DET", "golden-state-warriors":"GSW", "houston-rockets":"HOU", "indiana-pacers":"IND", "los-angeles-clippers":"LAC", "los-angeles-lakers":"LAL", "memphis-grizzlies":"MEM", "miami-heat":"MIA", "milwaukee-bucks":"MIL", "minnesota-timberwolves":"MIN", "new-orleans-pelicans":"NOP", "new-york-knicks":"NYK", "oklahoma-city-thunder":"OKC", "orlando-magic":"ORL", "philadelphia-76ers":"PHI", "phoenix-suns":"PHX", "portland-trail-blazers":"POR", "sacramento-kings":"SAC", "san-antonio-spurs":"SAS", "toronto-raptors":"TOR", "utah-jazz":"UTA", "washington-wizards":"WAS"}


def integer(value: str | None) -> int | None:
    return int(value) if value not in (None, "") else None


def flag(value: str | None) -> int:
    return 1 if (value or "").strip().lower() in {"1", "true", "yes", "y"} else 0


def import_contracts(path: Path) -> int:
    reader = csv.DictReader(path.open(newline=""))
    rows = list(reader)
    required = {"person_id", "season", "as_of_date", "source", "contract_type"}
    if not required.issubset(reader.fieldnames or []):
        raise ValueError(f"CSV must include: {', '.join(sorted(required))}")
    with connect() as connection:
        for row in rows:
            person_id = int(row["person_id"])
            connection.execute("""INSERT INTO player_contracts
              (person_id, contract_type, total_value, guaranteed_value, current_salary, cap_hit, years_remaining, team_code, as_of_date, source, source_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(person_id) DO UPDATE SET contract_type=excluded.contract_type, total_value=excluded.total_value, guaranteed_value=excluded.guaranteed_value, current_salary=excluded.current_salary, cap_hit=excluded.cap_hit, years_remaining=excluded.years_remaining, team_code=excluded.team_code, as_of_date=excluded.as_of_date, source=excluded.source, source_url=excluded.source_url""",
              (person_id, row["contract_type"], integer(row.get("total_value")), integer(row.get("guaranteed_value")), integer(row.get("current_salary")), integer(row.get("cap_hit")), integer(row.get("years_remaining")), TEAM_CODES.get((row.get("source_url") or "").rstrip("/").split("/")[-2]), row["as_of_date"], row["source"], row.get("source_url")))
            connection.execute("""INSERT INTO contract_years
              (person_id, season, salary, guaranteed, player_option, team_option, early_termination_option)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(person_id, season) DO UPDATE SET salary=excluded.salary, guaranteed=excluded.guaranteed, player_option=excluded.player_option, team_option=excluded.team_option, early_termination_option=excluded.early_termination_option""",
              (person_id, row["season"], integer(row.get("salary")), integer(row.get("guaranteed")), flag(row.get("player_option")), flag(row.get("team_option")), flag(row.get("early_termination_option"))))
    return len(rows)


if __name__ == "__main__":
    initialize()
    print(f"Imported {import_contracts(Path(sys.argv[1]))} contract-year rows")
