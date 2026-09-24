"""Create real downloadable counterparts for the prototype's historical exports."""
import json
import secrets
from pathlib import Path
from . import database as db
from .exports import generate

def initialize_exports():
    if db.get("metadata", "historical-exports"):
        return
    fixtures = json.loads(Path(__file__).with_name("seed.json").read_text())["exports"]
    for index, fixture in enumerate(fixtures):
        identifier = f"historical-{index}"
        project_id = "fy2024" if index == 2 else "fy2025"
        format = ["Report", "Excel", "PDF"][index]
        path, mime = generate(db.get("projects", project_id), db.all_docs("points", project_id), format, identifier)
        item = {**fixture, "id": identifier, "project_id": "fy2025", "format": format,
                "path": path.name, "mime": mime, "fixture": True}
        if item["share"]:
            token = secrets.token_urlsafe(24)
            item["token"] = token
            db.put("shares", token, {"export_id": identifier, "revoked": False})
        db.put("exports", identifier, item)
    db.put("metadata", "historical-exports", {"initialized": True})
