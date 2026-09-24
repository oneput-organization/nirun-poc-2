import csv
import io
import zipfile
import pytest
from fastapi.testclient import TestClient
from app import database
from app.main import app

@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(database, "DATA_DIR", tmp_path)
    monkeypatch.setattr("app.exports.DATA_DIR", tmp_path)
    with TestClient(app) as client:
        yield client

def login(client, role="admin"):
    assert client.post("/api/session", json={"role": role}).status_code == 200

def test_auth_logout(client):
    assert client.delete("/api/session").status_code == 200
    assert client.get("/api/workspace").status_code == 401
    login(client)
    token = client.cookies.get("oneput_session")
    assert len(client.get("/api/workspace").json()["projects"]) == 5
    client.delete("/api/session")
    client.cookies.set("oneput_session", token)
    assert client.get("/api/workspace").status_code == 401

def test_review_history_permissions_and_closed_period(client):
    login(client)
    path = "/api/projects/fy2025/points/FIN-02"
    assert client.patch(path, json={"action": "override"}).status_code == 422
    assert client.patch(path, json={"action": "override", "reason": "Reviewed signed statements", "value": "120000"}).status_code == 200
    workspace = client.get("/api/workspace").json()
    point = next(p for p in workspace["points"] if p["code"] == "FIN-02")
    assert point["status"] == "accepted"
    assert point["history"][-1]["reason"] == "Reviewed signed statements"
    assert next(q for q in workspace["queue"] if q["id"] == "fin02")["status"] == "Done"
    assert client.patch("/api/projects/fy2024/points/FIN-02", json={"action": "accept"}).status_code == 409
    login(client, "member")
    assert client.patch(path, json={"action": "accept"}).status_code == 403
    assert client.patch("/api/projects/fy2025/points/OPS-01", json={"action": "submit", "value": "11"}).status_code == 200

def test_create_member_message_upload(client):
    login(client)
    project = client.post("/api/projects", json={"name": "Quarterly review", "description": "Collect team feedback"}).json()
    pid = project["id"]
    assert client.post(f"/api/projects/{pid}/members", json={"name": "Test Contributor", "email": "person@example.com"}).status_code == 201
    response = client.post(f"/api/projects/{pid}/messages", json={"text": "What is due?", "thread": "assistant"})
    assert len(response.json()["messages"]) == 2
    upload = client.post(f"/api/projects/{pid}/uploads", files={"file": ("evidence.txt", b"Evidence content", "text/plain")}).json()
    assert client.get(f'/api/uploads/{upload["id"]}').content == b"Evidence content"
    workspace = client.get(f"/api/workspace?project_id={pid}").json()
    assert len(workspace["members"]) == 1 and len(workspace["messages"]) == 2 and len(workspace["uploads"]) == 1

@pytest.mark.parametrize("format,ext", [("CSV","csv"),("Excel","xlsx"),("Report","docx"),("Slides","pptx"),("HTML dashboard","html"),("PDF","pdf")])
def test_exports_and_revocable_shares(client, format, ext):
    login(client)
    response = client.post("/api/projects/fy2025/exports", json={"format": format})
    assert response.status_code == 201, response.text
    item = response.json(); assert item["file"].endswith(ext)
    download = client.get(f'/api/exports/{item["id"]}/download')
    assert download.status_code == 200
    if ext in ("xlsx", "docx", "pptx"): assert zipfile.is_zipfile(io.BytesIO(download.content))
    elif ext == "csv":
        rows = list(csv.reader(io.StringIO(download.content.decode("utf-8-sig"))))
        assert len(rows) > 10 and rows[0][0] == "Code"
    elif ext == "pdf": assert download.content.startswith(b"%PDF")
    else: assert b"<table>" in download.content
    token = client.post(f'/api/exports/{item["id"]}/share').json()["token"]
    client.delete("/api/session")
    assert client.get(f"/api/shared/{token}").status_code == 200
    login(client)
    client.delete(f'/api/exports/{item["id"]}/share')
    assert client.get(f"/api/shared/{token}").status_code == 410

def test_preferences_persist(client):
    login(client, "member")
    client.patch("/api/preferences", json={"workspace": {"confirmed": True, "channel": "Line"}})
    client.delete("/api/session"); login(client, "member")
    assert client.get("/api/workspace").json()["preferences"]["workspace"]["confirmed"] is True

def test_add_point_and_duplicate_code(client):
    login(client)
    point = {"code":"OPS-06", "name":"New evidence", "owner":"Studio lead", "due":"29 Aug"}
    assert client.post("/api/projects/fy2025/points", json=point).status_code == 201
    assert client.post("/api/projects/fy2025/points", json=point).status_code == 409
    assert client.post("/api/projects/fy2024/points", json=point).status_code == 409
    saved = client.get("/api/workspace").json()["points"]
    assert next(p for p in saved if p["code"] == "OPS-06")["status"] == "open"
