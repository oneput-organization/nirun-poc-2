import time
from fastapi import Cookie, HTTPException, Depends
from .database import connection

def session(oneput_session: str | None = Cookie(default=None)):
    with connection() as db:
        row = db.execute("SELECT role FROM sessions WHERE token=? AND expires>?", (oneput_session or "", time.time())).fetchone()
    if not row:
        raise HTTPException(401, "Please sign in to the demo workspace.")
    return {"role": row["role"]}

def admin(user=Depends(session)):
    if user["role"] != "admin":
        raise HTTPException(403, "This action requires an admin.")
    return user
