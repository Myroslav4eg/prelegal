"""FastAPI app: fake-login auth endpoints plus the static frontend.

API routes are registered before the static files mount, since Starlette
matches routes in registration order and a mount on "/" would otherwise
shadow everything under it.
"""

import os
import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Cookie, FastAPI, HTTPException, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app import db

SESSION_COOKIE = "session_id"
STATIC_DIR = Path(os.environ.get("STATIC_DIR", Path(__file__).resolve().parent.parent / "static"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(lifespan=lifespan)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    email: str


def _current_user(session_id: str | None) -> sqlite3.Row:
    if session_id is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    with db.connection() as conn:
        user = db.get_user_by_session_token(conn, session_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@app.post("/api/auth/login", response_model=UserResponse)
def login(body: LoginRequest, response: Response) -> UserResponse:
    with db.connection() as conn:
        user = db.get_or_create_user(conn, body.email)
        token = db.create_session(conn, user["id"])
    response.set_cookie(SESSION_COOKIE, token, httponly=True, samesite="lax", path="/")
    return UserResponse(email=user["email"])


@app.get("/api/auth/me", response_model=UserResponse)
def me(session_id: str | None = Cookie(default=None)) -> UserResponse:
    user = _current_user(session_id)
    return UserResponse(email=user["email"])


@app.post("/api/auth/logout")
def logout(response: Response, session_id: str | None = Cookie(default=None)) -> dict[str, bool]:
    if session_id is not None:
        with db.connection() as conn:
            db.delete_session(conn, session_id)
    response.delete_cookie(SESSION_COOKIE, path="/")
    return {"ok": True}


if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
