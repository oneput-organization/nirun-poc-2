"""Small SQLite repository. The database and uploads survive container restarts."""
import json
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DATA_DIR = Path(os.environ.get("DATA_DIR", "./data"))

@contextmanager
def connection():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DATA_DIR / "oneput.db", timeout=15)
    db.row_factory = sqlite3.Row
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def initialize():
    with connection() as db:
        db.executescript("""
        PRAGMA journal_mode=WAL;
        CREATE TABLE IF NOT EXISTS documents (
          collection TEXT, id TEXT, body TEXT NOT NULL, PRIMARY KEY(collection, id)
        );
        CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, role TEXT, expires REAL);
        """)
        if db.execute("SELECT 1 FROM documents WHERE collection='projects' LIMIT 1").fetchone():
            return
        seed = json.loads(Path(__file__).with_name("seed.json").read_text())
        for project in seed["projects"]:
            put("projects", project["id"], project, db)
            for point in seed["points"]:
                point = {**point, "project_id": project["id"], "value": "", "history": []}
                put("points", f'{project["id"]}:{point["code"]}', point, db)
            for member in seed["members"]:
                put("members", f'{project["id"]}:{member["id"]}', {**member, "project_id": project["id"]}, db)
            for item in seed["queue"]:
                put("queue", f'{project["id"]}:{item["id"]}', {**item, "project_id": project["id"]}, db)

def put(collection, key, body, db=None):
    if db is None:
        with connection() as conn:
            return put(collection, key, body, conn)
    db.execute("INSERT INTO documents VALUES (?, ?, ?) ON CONFLICT(collection,id) DO UPDATE SET body=excluded.body", (collection, key, json.dumps(body, ensure_ascii=False)))
    return body

def get(collection, key, db=None):
    if db is None:
        with connection() as conn:
            return get(collection, key, conn)
    row = db.execute("SELECT body FROM documents WHERE collection=? AND id=?", (collection, key)).fetchone()
    return json.loads(row["body"]) if row else None

def all_docs(collection, project_id=None):
    with connection() as db:
        docs = [json.loads(r["body"]) for r in db.execute("SELECT body FROM documents WHERE collection=? ORDER BY rowid", (collection,))]
    return [d for d in docs if project_id is None or d.get("project_id") == project_id]
