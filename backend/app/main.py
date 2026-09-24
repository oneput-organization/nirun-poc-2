"""Oneput local demo API. External channels and AI are deterministic local adapters."""
import secrets
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
from fastapi import FastAPI, Depends, HTTPException, Response, UploadFile, File, Cookie
from fastapi.responses import FileResponse
from . import database as db
from .auth import admin, session
from .models import SessionInput, ProjectInput, PointInput, MemberInput, MessageInput, ActionInput, ExportInput, NewPointInput
from .exports import generate

@asynccontextmanager
async def lifespan(app):
    db.initialize()
    yield

app = FastAPI(title="Oneput API", version="1.0.0", lifespan=lifespan)

def now(): return datetime.now(timezone.utc).isoformat()
def required(collection, key):
    result = db.get(collection, key)
    if result is None: raise HTTPException(404, "The requested record was not found.")
    return result

def writable(project_id):
    project = required("projects", project_id)
    if project["s"] == "closed": raise HTTPException(409, "Closed periods are read only.")
    return project

def log(project_id, action, **kwargs):
    item = {"id": uuid4().hex, "project_id": project_id, "action": action, "at": now(), **kwargs}
    db.put("activity", item["id"], item)
    return item

@app.get("/api/health")
def health(): return {"status": "ok"}

@app.post("/api/session")
def sign_in(body: SessionInput, response: Response):
    token = secrets.token_urlsafe(32)
    with db.connection() as conn:
        conn.execute("DELETE FROM sessions WHERE expires<?", (time.time(),))
        conn.execute("INSERT INTO sessions VALUES (?, ?, ?)", (token, body.role, time.time() + 86400))
    response.set_cookie("oneput_session", token, httponly=True, samesite="lax", max_age=86400)
    return {"role": body.role, "mode": "demo"}

@app.delete("/api/session")
def sign_out(response: Response, oneput_session: str | None = Cookie(default=None), user=Depends(session)):
    # The caller's cookie is invalidated server-side as well as in the browser.
    with db.connection() as conn:
        conn.execute("DELETE FROM sessions WHERE token=?", (oneput_session,))
    response.delete_cookie("oneput_session")
    return {"ok": True}

@app.get("/api/workspace")
def workspace(project_id: str = "fy2025", user=Depends(session)):
    required("projects", project_id)
    return {"role": user["role"], "projects": db.all_docs("projects"),
            "points": db.all_docs("points", project_id), "members": db.all_docs("members", project_id),
            "queue": db.all_docs("queue", project_id), "messages": db.all_docs("messages", project_id),
            "exports": db.all_docs("exports", project_id), "uploads": db.all_docs("uploads", project_id),
            "activity": db.all_docs("activity", project_id), "preferences": db.get("preferences", user["role"]) or {}}

@app.post("/api/projects", status_code=201)
def create_project(body: ProjectInput, user=Depends(admin)):
    project = {"id": uuid4().hex, "name": body.name.strip(), "framework": body.framework,
               "description": body.description, "s": "draft", "key": "Draft", "state": "Draft", "pct": 0,
               "period": "New collection", "note": "Ready to plan. Add your people and start collecting.",
               "deadline": "Draft", "stColor": "#6B6B66", "stBg": "#F1F1EF", "barColor": "#1F6F4E",
               "noteColor": "#6B6B66", "dlColor": "#6B6B66", "dlBg": "#F1F1EF"}
    if not project["name"]: raise HTTPException(422, "Please enter a project name.")
    db.put("projects", project["id"], project)
    # Start from a reusable checklist; no collected values are copied.
    for point in db.all_docs("points", "fy2025"):
        db.put("points", f'{project["id"]}:{point["code"]}', {**point, "project_id": project["id"], "status": "open", "value": "", "history": []})
    return project

@app.patch("/api/projects/{project_id}")
def update_project(project_id: str, body: dict, user=Depends(admin)):
    project = writable(project_id)
    for key in ("name", "description", "deadline"):
        if key in body:
            if not isinstance(body[key], str) or len(body[key]) > 5000: raise HTTPException(422, "Invalid project field.")
            project[key] = body[key]
    if "s" in body:
        if body["s"] not in ("draft", "live", "closed"): raise HTTPException(422, "Invalid project status.")
        project.update(s=body["s"], key=body["s"].title(), state=body["s"].title())
    return db.put("projects", project_id, project)

@app.patch("/api/projects/{project_id}/points/{code}")
def update_point(project_id: str, code: str, body: PointInput, user=Depends(session)):
    writable(project_id)
    if user["role"] != "admin" and body.action != "submit": raise HTTPException(403, "Only admins can review or override points.")
    if body.action == "override" and not body.reason.strip(): raise HTTPException(422, "An override needs a reason.")
    point_key = f"{project_id}:{code}"
    with db.connection() as conn:
        point = db.get("points", point_key, conn)
        if not point and code == "OPS-04":
            point = {"code": code, "project_id": project_id, "name": "Three short client stories", "owner": "Studio lead", "due": "8 Aug", "opens": "1 Aug", "lead": "3d", "section": "Operations", "type": "qualitative", "unit": "text", "cadence": "annual", "sub": "Three stories with evidence", "badges": [], "status": "submitted", "value": "", "history": []}
        if not point: raise HTTPException(404, "Data point not found.")
        old_status = point["status"]
        point["status"] = {"accept": "accepted", "reject": "open", "reask": "open", "override": "accepted", "drop": "dropped", "estimate": "flagged", "replace": "open", "submit": "submitted"}[body.action]
        if body.value: point["value"] = body.value
        if body.action == "replace": point["name"] = "Projects per person"
        point["history"].append({"action": body.action, "reason": body.reason, "value": body.value, "previous_status": old_status, "at": now(), "by": user["role"]})
        db.put("points", point_key, point, conn)
        queue_id = "stories" if code == "OPS-04" else code.replace("-", "").lower()
        item = db.get("queue", f"{project_id}:{queue_id}", conn) or {"id": queue_id, "project_id": project_id, "code": code, "name": point["name"], "member": point["owner"]}
        item["status"] = {"accept": "Done", "override": "Done", "reject": "Rejected", "reask": "Needs a fix", "submit": "In review", "drop": "Rejected", "estimate": "Needs a fix", "replace": "Needs a fix"}[body.action]
        db.put("queue", f"{project_id}:{queue_id}", item, conn)
        project = db.get("projects", project_id, conn)
        # Keep the reference's initial metric until the first review, then use the actual accepted share.
        all_points = [__import__('json').loads(r["body"]) for r in conn.execute("SELECT body FROM documents WHERE collection='points'")]
        active = [p for p in all_points if p["project_id"] == project_id and p["status"] != "dropped"]
        project["pct"] = round(100 * sum(p["status"] == "accepted" for p in active) / max(1, len(active)))
        db.put("projects", project_id, project, conn)
    log(project_id, body.action, code=code, reason=body.reason)
    return point

@app.post("/api/projects/{project_id}/members", status_code=201)
def add_member(project_id: str, body: MemberInput, user=Depends(admin)):
    writable(project_id)
    if body.email and ("@" not in body.email or "." not in body.email.split("@")[-1]): raise HTTPException(422, "Please enter a valid email address.")
    member = {**body.model_dump(), "id": uuid4().hex, "project_id": project_id,
              "account": "Invited", "accBg": "#F1F1EF", "accColor": "#6B6B66", "dot": "#2F4BFF",
              "points": "0", "pct": 0, "health": "#1F6F4E", "next": "—", "chip": "Invited",
              "chipBg": "#F1F1EF", "chipColor": "#6B6B66", "last": "never", "you": False}
    db.put("members", f'{project_id}:{member["id"]}', member)
    log(project_id, "invite", target=member["id"], delivery="local demo outbox")
    return member

@app.post("/api/projects/{project_id}/messages", status_code=201)
def message(project_id: str, body: MessageInput, user=Depends(session)):
    writable(project_id)
    if not body.text.strip(): raise HTTPException(422, "Enter a message first.")
    sent = {**body.model_dump(), "id": uuid4().hex, "project_id": project_id, "sender": user["role"], "at": now()}
    db.put("messages", sent["id"], sent)
    points = db.all_docs("points", project_id)
    selected = next((p for p in points if p["code"] == body.point), None)
    if body.thread in ("assistant", "member"):
        if selected:
            reply = f'{selected["code"]} — {selected["name"]}. Owner: {selected["owner"]}. Due: {selected["due"]}. Current status: {selected["status"]}. Your message is saved with this point. Attach evidence, then confirm it for review.'
        else:
            pending = sum(p["status"] not in ("accepted", "dropped") for p in points)
            reply = f'This project has {len(points)} data points, with {pending} still outstanding. Review the highlighted items in Overview, or open Audit to accept, re-ask, or reject an answer. Your note has been saved.'
        answer = {"id": uuid4().hex, "project_id": project_id, "thread": body.thread, "point": body.point, "sender": "agent", "text": reply, "at": now()}
        db.put("messages", answer["id"], answer)
        return {"messages": [sent, answer], "mode": "local rules"}
    return {"messages": [sent]}

@app.post("/api/projects/{project_id}/uploads", status_code=201)
async def upload(project_id: str, file: UploadFile = File(...), user=Depends(session)):
    writable(project_id)
    identifier = uuid4().hex
    folder = db.DATA_DIR / "uploads"; folder.mkdir(parents=True, exist_ok=True)
    path = folder / identifier; size = 0
    try:
        with path.open("wb") as output:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > 20 * 1024 * 1024: raise HTTPException(413, "Files must be 20 MB or smaller.")
                output.write(chunk)
    except Exception:
        path.unlink(missing_ok=True)
        raise
    finally: await file.close()
    item = {"id": identifier, "project_id": project_id, "name": Path(file.filename or "upload").name,
            "size": size, "at": now(), "by": user["role"]}
    db.put("uploads", identifier, item)
    return item

@app.get("/api/uploads/{upload_id}")
def download_upload(upload_id: str, user=Depends(session)):
    item = required("uploads", upload_id)
    return FileResponse(db.DATA_DIR / "uploads" / item["id"], filename=item["name"], media_type="application/octet-stream")

@app.patch("/api/preferences")
def preferences(body: dict, user=Depends(session)):
    if len(str(body)) > 30000: raise HTTPException(413, "Preferences are too large.")
    prefs = {**(db.get("preferences", user["role"]) or {}), **body}
    return db.put("preferences", user["role"], prefs)

@app.post("/api/projects/{project_id}/actions")
def action(project_id: str, body: ActionInput, user=Depends(session)):
    writable(project_id)
    if user["role"] != "admin" and body.action in ("launch", "archive", "approve-delegation", "reminder", "reissue-invite"):
        raise HTTPException(403, "This action requires an admin.")
    return log(project_id, body.action, target=body.target, details=body.details, by=user["role"], delivery="local demo outbox")

@app.post("/api/projects/{project_id}/exports", status_code=201)
def create_export(project_id: str, body: ExportInput, user=Depends(admin)):
    project = required("projects", project_id); identifier = uuid4().hex
    path, mime = generate(project, db.all_docs("points", project_id), body.format, identifier)
    item = {"id": identifier, "project_id": project_id, "format": body.format, "file": f'ONEPUT-{project_id}-{identifier[:6]}.{path.suffix[1:]}', "path": path.name,
            "mime": mime, "when": now(), "by": "Founder", "scope": "All points, provenance included, gaps marked", "share": False}
    return db.put("exports", identifier, item)

@app.get("/api/exports/{export_id}/download")
def download_export(export_id: str, user=Depends(session)):
    item = required("exports", export_id)
    return FileResponse(db.DATA_DIR / "exports" / item["path"], filename=item["file"], media_type=item["mime"])

@app.post("/api/exports/{export_id}/share")
def share(export_id: str, user=Depends(admin)):
    item = required("exports", export_id); token = secrets.token_urlsafe(24)
    if item.get("token"):
        old = required("shares", item["token"]); old["revoked"] = True; db.put("shares", item["token"], old)
    db.put("shares", token, {"export_id": export_id, "revoked": False})
    item.update(share=True, token=token); db.put("exports", export_id, item)
    return {"token": token}

@app.delete("/api/exports/{export_id}/share")
def revoke_share(export_id: str, user=Depends(admin)):
    item = required("exports", export_id)
    if item.get("token"):
        shared = required("shares", item["token"]); shared["revoked"] = True; db.put("shares", item["token"], shared)
    item["share"] = False; db.put("exports", export_id, item)
    return {"ok": True}

@app.get("/api/shared/{token}")
def shared_download(token: str):
    shared = required("shares", token)
    if shared["revoked"]: raise HTTPException(410, "This share link has been revoked.")
    item = required("exports", shared["export_id"])
    return FileResponse(db.DATA_DIR / "exports" / item["path"], filename=item["file"], media_type=item["mime"])


@app.post("/api/projects/{project_id}/points", status_code=201)
def add_point(project_id: str, body: NewPointInput, user=Depends(admin)):
    writable(project_id)
    key = f"{project_id}:{body.code}"
    if db.get("points", key): raise HTTPException(409, "A point with that code already exists.")
    point = {**body.model_dump(), "project_id": project_id, "sub": "Added to the collection plan",
             "type": "qualitative", "unit": "text", "cadence": "annual", "opens": "Now", "lead": "3d",
             "badges": [], "status": "open", "value": "", "history": []}
    db.put("points", key, point)
    return point
