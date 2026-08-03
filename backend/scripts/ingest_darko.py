"""Import the public DARKO active leaderboard as a dated local snapshot."""
import re
import sys
from datetime import date
from pathlib import Path
import requests
from bs4 import BeautifulSoup
sys.path.append(str(Path(__file__).resolve().parents[1]))
from app.database import connect, initialize

URL = "https://www.darko.app/"
def value(text: str):
    found = re.search(r"[-+]?\d+(?:\.\d+)?", text.replace(",", "")); return float(found.group()) if found else None
def main():
    initialize(); soup = BeautifulSoup(requests.get(URL, timeout=30).text, "html.parser")
    with connect() as db:
        ids = {r["full_name"].lower(): r["person_id"] for r in db.execute("SELECT person_id, full_name FROM players")}
        count = 0
        for row in soup.select("tr"):
            cells = [c.get_text(" ", strip=True) for c in row.select("td")]
            if len(cells) < 18: continue
            name = re.sub(r"\s+[A-Z](?:-[A-Z])?$", "", cells[1]).lower()
            person_id = ids.get(name)
            if person_id is None: continue
            db.execute("INSERT INTO darko_metrics VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(person_id) DO UPDATE SET dpm=excluded.dpm, off_dpm=excluded.off_dpm, def_dpm=excluded.def_dpm, fair_salary=excluded.fair_salary, salary=excluded.salary, surplus=excluded.surplus, as_of_date=excluded.as_of_date, source_url=excluded.source_url", (person_id, value(cells[3]), value(cells[4]), value(cells[5]), value(cells[15]), value(cells[16]), value(cells[17]), date.today().isoformat(), URL)); count += 1
    print(f"Imported {count} DARKO rows")
if __name__ == "__main__": main()
