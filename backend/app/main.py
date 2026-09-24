"""Oneput local demo API. External channels and AI are deterministic local adapters."""
import secrets
import time
import json
import asyncio
from io import BytesIO
from urllib.parse import quote
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
from fastapi import FastAPI, Depends, HTTPException, Response, UploadFile, File, Cookie, Form
from fastapi.responses import FileResponse, StreamingResponse
from starlette.background import BackgroundTask
from botocore.exceptions import BotoCoreError, ClientError
from . import database as db
from . import object_store
from .auth import admin, session
from .models import SessionInput, ProjectInput, PointInput, MemberInput, MessageInput, ActionInput, ExportInput, NewPointInput
from .exports import generate
from .seed_exports import initialize_exports
from .intake import questions_for_point, summarize_answers

@asynccontextmanager
async def lifespan(app):
    db.initialize()
    initialize_exports()
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
def sign_out(response: Response, oneput_session: str | None = Cookie(default=None)):
    # The caller's cookie is invalidated server-side as well as in the browser.
    with db.connection() as conn:
        conn.execute("DELETE FROM sessions WHERE token=?", (oneput_session,))
    response.delete_cookie("oneput_session")
    return {"ok": True}

@app.get("/api/workspace")
def workspace(project_id: str = "fy2025", user=Depends(session)):
    required("projects", project_id)
    forms = db.all_docs("point_forms", project_id)
    if user["role"] != "admin":
        forms = [{key: value for key, value in form.items() if key != "token"} for form in forms]
    points = db.all_docs("points", project_id)
    return {"role": user["role"], "projects": db.all_docs("projects"),
            "points": points, "pointIntakeQuestions": {point["code"]: questions_for_point(point) for point in points},
            "members": db.all_docs("members", project_id),
            "queue": db.all_docs("queue", project_id), "messages": db.all_docs("messages", project_id),
            "exports": db.all_docs("exports", project_id), "uploads": db.all_docs("uploads", project_id),
            "activity": db.all_docs("activity", project_id), "pointForms": forms,
            "intakeSubmissions": db.all_docs("intake_submissions", project_id),
            "preferences": db.get("preferences", user["role"]) or {}}


@app.post("/api/projects/{project_id}/points/{code}/intake-link")
def create_intake_link(project_id: str, code: str, user=Depends(admin)):
    writable(project_id)
    point_key = f"{project_id}:{code}"
    point = required("points", point_key)
    form_key = point_key
    form = db.get("point_forms", form_key) or {}
    if form.get("active") and form.get("token"):
        return {"token": form["token"], "active": True, "createdAt": form["createdAt"]}

    token = secrets.token_urlsafe(32)
    created_at = now()
    form = {
        "id": form.get("id") or uuid4().hex,
        "project_id": project_id,
        "code": code,
        "active": True,
        "token": token,
        "questions": questions_for_point(point),
        "createdAt": created_at,
    }
    db.put("point_forms", form_key, form)
    db.put("intake_links", token, {"form_key": form_key, "active": True, "project_id": project_id})
    log(project_id, "intake_link_created", code=code, by=user["role"])
    return {"token": token, "active": True, "createdAt": created_at}


@app.delete("/api/projects/{project_id}/points/{code}/intake-link")
def revoke_intake_link(project_id: str, code: str, user=Depends(admin)):
    writable(project_id)
    form_key = f"{project_id}:{code}"
    form = required("point_forms", form_key)
    if form.get("token"):
        link = db.get("intake_links", form["token"])
        if link:
            link["active"] = False
            db.put("intake_links", form["token"], link)
    form["active"] = False
    db.put("point_forms", form_key, form)
    log(project_id, "intake_link_revoked", code=code, by=user["role"])
    return {"ok": True}


def active_intake(token: str):
    link = db.get("intake_links", token)
    if not link:
        raise HTTPException(404, "This form link is invalid.")
    if not link.get("active"):
        raise HTTPException(410, "This form link has been revoked.")
    form = db.get("point_forms", link["form_key"])
    if not form or not form.get("active") or form.get("token") != token:
        raise HTTPException(410, "This form link has been revoked.")
    project = required("projects", form["project_id"])
    if project["s"] == "closed":
        raise HTTPException(410, "This report is closed and no longer accepts responses.")
    point = required("points", f'{form["project_id"]}:{form["code"]}')
    return form, project, point


@app.get("/api/intake/{token}")
def public_intake(token: str):
    form, project, point = active_intake(token)
    return {
        "project": project["name"],
        "period": project.get("period", ""),
        "point": {"code": point["code"], "name": point["name"], "section": point.get("section", ""), "due": point.get("due", "")},
        "questions": form["questions"],
        "maxFiles": 5,
        "maxFileSize": 20 * 1024 * 1024,
    }


@app.post("/api/intake/{token}/submissions", status_code=201)
async def submit_intake(
    token: str,
    respondent_name: str = Form(min_length=1, max_length=160),
    answers: str = Form(default="{}", max_length=50000),
    anything_else: str = Form(default="", max_length=10000),
    files: list[UploadFile] = File(default=[]),
):
    form, project, point = active_intake(token)
    if len(files) > 5:
        raise HTTPException(413, "Attach up to five files.")
    try:
        answer_values = json.loads(answers)
    except json.JSONDecodeError:
        raise HTTPException(422, "Answers must be valid form data.") from None
    if not isinstance(answer_values, dict):
        raise HTTPException(422, "Answers must be valid form data.")
    question_ids = {question["id"] for question in form["questions"]}
    if any(key not in question_ids or not isinstance(value, str) or len(value) > 4000 for key, value in answer_values.items()):
        raise HTTPException(422, "One of the answers is invalid or too long.")
    if any(question["required"] and not answer_values.get(question["id"], "").strip() for question in form["questions"]):
        raise HTTPException(422, "Complete the required questions before submitting.")
    if not answer_values and not anything_else.strip() and not files:
        raise HTTPException(422, "Add an answer, a file, or a note before submitting.")

    submission_id = uuid4().hex
    attachments = []
    stored_keys = []
    total_size = 0
    try:
        for upload in files:
            safe_name = Path(upload.filename or "evidence").name[:180]
            contents = bytearray()
            while chunk := await upload.read(1024 * 1024):
                total_size += len(chunk)
                if len(contents) + len(chunk) > 20 * 1024 * 1024 or total_size > 40 * 1024 * 1024:
                    raise HTTPException(413, "Each file must be 20 MB or smaller, with 40 MB total per response.")
                contents.extend(chunk)
            file_id = uuid4().hex
            key = f'intake/{form["project_id"]}/{form["code"]}/{submission_id}/{file_id}'
            await asyncio.to_thread(object_store.put, key, BytesIO(contents), upload.content_type or "application/octet-stream")
            stored_keys.append(key)
            attachments.append({"id": file_id, "name": safe_name, "size": len(contents), "key": key})
            await upload.close()
    except HTTPException:
        for key in stored_keys:
            await asyncio.to_thread(object_store.delete, key)
        raise
    except (BotoCoreError, ClientError, OSError) as error:
        for key in stored_keys:
            try:
                await asyncio.to_thread(object_store.delete, key)
            except Exception:
                pass
        raise HTTPException(503, "Evidence storage is not available. Try again shortly.") from error

    clean_name = respondent_name.strip()
    summary = summarize_answers(form["questions"], answer_values, anything_else, attachments)
    submission = {
        "id": submission_id,
        "project_id": form["project_id"],
        "form_id": form["id"],
        "code": form["code"],
        "respondent": clean_name,
        "questions": form["questions"],
        "answers": answer_values,
        "anythingElse": anything_else.strip(),
        "files": attachments,
        "submittedAt": now(),
    }
    db.put("intake_submissions", submission_id, submission)

    point_key = f'{form["project_id"]}:{form["code"]}'
    previous_status = point.get("status", "open")
    point["status"] = "submitted"
    point["value"] = summary
    point.setdefault("history", []).append({"action": "submit", "reason": "Submitted using the shared intake form", "value": summary, "previous_status": previous_status, "at": submission["submittedAt"], "by": clean_name})
    db.put("points", point_key, point)
    queue_id = "stories" if form["code"] == "OPS-04" else form["code"].replace("-", "").lower()
    queue_key = f'{form["project_id"]}:{queue_id}'
    queue = db.get("queue", queue_key)
    if queue:
        queue["status"] = "In review"
        db.put("queue", queue_key, queue)
    log(form["project_id"], "intake_submission", code=form["code"], respondent=clean_name, submission_id=submission_id)
    return {"ok": True, "submittedAt": submission["submittedAt"]}


@app.get("/api/intake-submissions/{submission_id}/files/{file_id}")
def download_intake_file(submission_id: str, file_id: str, user=Depends(session)):
    submission = required("intake_submissions", submission_id)
    attachment = next((item for item in submission["files"] if item["id"] == file_id), None)
    if not attachment:
        raise HTTPException(404, "Evidence file not found.")
    try:
        stored = object_store.get(attachment["key"])
    except (BotoCoreError, ClientError, OSError) as error:
        raise HTTPException(503, "Evidence storage is not available.") from error
    body = stored["Body"]
    return StreamingResponse(
        body.iter_chunks(1024 * 1024),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{quote(attachment['name'])}", "X-Content-Type-Options": "nosniff"},
        background=BackgroundTask(body.close),
    )

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
