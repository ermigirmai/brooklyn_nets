"""Create a dated, team-balanced contract CSV from HoopsHype's public tables.

This is a manual ETL input: it runs outside the web request path and writes an
auditable CSV with a per-team source URL. Review the generated file before
importing, especially after transactions or option decisions.
"""
import csv
import re
import sys
from datetime import date
from pathlib import Path

import requests
from bs4 import BeautifulSoup

sys.path.append(str(Path(__file__).resolve().parents[1]))
from app.database import connect, initialize

BASE = "https://www.hoopshype.com"
TEAM_INDEX = f"{BASE}/salaries/teams/"
SEASONS = ("2026-27", "2027-28", "2028-29", "2029-30")
OUT = Path(__file__).resolve().parents[1] / "data" / "contracts_2026-27.csv"


def money(cell: str) -> int | None:
    digits = re.sub(r"[^0-9]", "", cell)
    return int(digits) if digits else None


def flags(cell: str) -> tuple[int, int, str]:
    text = cell.upper()
    return int(" P" in f" {text}"), int(" T" in f" {text}"), "Two-way contract" if "TW" in text else "NBA contract"


def player_ids() -> dict[str, int]:
    with connect() as connection:
        return {str(row["full_name"]).lower(): row["person_id"] for row in connection.execute("SELECT person_id, full_name FROM players")}


def main() -> None:
    initialize()
    session = requests.Session()
    session.headers["User-Agent"] = "CourtVision interview ETL (public-data review)"
    index = BeautifulSoup(session.get(TEAM_INDEX, timeout=30).text, "html.parser")
    team_urls = [a["href"] for a in index.select('a[href*="/salaries/teams/"]') if a["href"].count("/") >= 4]
    team_urls = list(dict.fromkeys(url for url in team_urls if url.rstrip("/") != "/salaries/teams"))
    ids, output, unresolved = player_ids(), [], []
    for relative_url in team_urls:
        source_url = f"{BASE}{relative_url}" if relative_url.startswith("/") else relative_url
        page = BeautifulSoup(session.get(source_url, timeout=30).text, "html.parser")
        tables = [table for table in page.select("table") if "2026-27" in table.get_text(" ", strip=True)]
        if not tables:
            continue
        for tr in tables[-1].select("tr")[1:11]:
            cells = [cell.get_text(" ", strip=True) for cell in tr.select("td")]
            link = tr.select_one('a[href*="/salaries/players/"]')
            if not link or len(cells) < 6:
                continue
            name = link.get_text(" ", strip=True)
            person_id = ids.get(name.lower())
            if person_id is None:
                unresolved.append(name)
                continue
            future = cells[2:6]
            years = sum(money(value) is not None for value in future)
            for season, value in zip(SEASONS, future):
                salary = money(value)
                if salary is None:
                    continue
                player_option, team_option, contract_type = flags(value)
                output.append({"person_id": person_id, "season": season, "contract_type": contract_type,
                               "total_value": "", "guaranteed_value": "", "current_salary": money(future[0]),
                               "cap_hit": money(future[0]), "years_remaining": years, "as_of_date": date.today().isoformat(),
                               "source": "HoopsHype public team salary table", "source_url": source_url,
                               "salary": salary, "guaranteed": "", "player_option": player_option,
                               "team_option": team_option, "early_termination_option": 0})
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["person_id", "season", "contract_type", "total_value", "guaranteed_value", "current_salary", "cap_hit", "years_remaining", "as_of_date", "source", "source_url", "salary", "guaranteed", "player_option", "team_option", "early_termination_option"])
        writer.writeheader(); writer.writerows(output)
    print(f"Wrote {len(output)} contract-year rows for {len(set(row['person_id'] for row in output))} linked players to {OUT}")
    print(f"Skipped {len(set(unresolved))} source players not in the local NBA player table")


if __name__ == "__main__":
    main()
