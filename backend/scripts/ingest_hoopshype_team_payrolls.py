"""Ingest full team payroll totals from HoopsHype's public team salary tables."""
import re
import sys
from datetime import date
from pathlib import Path
import requests
from bs4 import BeautifulSoup
sys.path.append(str(Path(__file__).resolve().parents[1]))
from app.database import connect, initialize
from scripts.import_contracts import TEAM_CODES

BASE = "https://www.hoopshype.com"
def dollars(text: str) -> int | None:
    digits = re.sub(r"[^0-9]", "", text); return int(digits) if digits else None
def main():
    initialize(); session = requests.Session(); session.headers["User-Agent"] = "CourtVision ETL"
    index = BeautifulSoup(session.get(f"{BASE}/salaries/teams/", timeout=30).text, "html.parser")
    links = list(dict.fromkeys(a["href"] for a in index.select('a[href*="/salaries/teams/"]') if a["href"].count("/") >= 4))
    count = 0
    with connect() as db:
        for link in links:
            url = f"{BASE}{link}"; slug = link.rstrip("/").split("/")[-2]; code = TEAM_CODES.get(slug)
            if not code: continue
            soup = BeautifulSoup(session.get(url, timeout=30).text, "html.parser")
            tables = [t for t in soup.select("table") if "2026-27" in t.get_text(" ", strip=True)]
            if not tables: continue
            cells = [c.get_text(" ", strip=True) for c in tables[-1].select("tr")[-1].select("td,th")]
            for season, value in zip(("2026-27","2027-28","2028-29","2029-30"), cells[-4:]):
                payroll = dollars(value)
                if payroll: db.execute("INSERT INTO team_payrolls VALUES (?, ?, ?, ?, ?) ON CONFLICT(team_code, season) DO UPDATE SET payroll=excluded.payroll, as_of_date=excluded.as_of_date, source_url=excluded.source_url", (code, season, payroll, date.today().isoformat(), url)); count += 1
    print(f"Imported {count} team payroll totals")
if __name__ == "__main__": main()
