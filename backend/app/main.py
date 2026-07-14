"""FastAPI app: fake-login auth endpoints plus the static frontend.

API routes are registered before the static files mount, since Starlette
matches routes in registration order and a mount on "/" would otherwise
shadow everything under it.
"""

import json
import os
import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import Cookie, FastAPI, HTTPException, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app import db
from app.auth import hash_password, verify_password
from app.chat import ChatMessage
from app.documents.registry import REGISTRY
from app.documents.selection import run_selection_turn

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

SESSION_COOKIE = "session_id"
STATIC_DIR = Path(os.environ.get("STATIC_DIR", Path(__file__).resolve().parent.parent / "static"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(lifespan=lifespan)


class SignupRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)


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


@app.post("/api/auth/signup", response_model=UserResponse, status_code=201)
def signup(body: SignupRequest, response: Response) -> UserResponse:
    with db.connection() as conn:
        try:
            user = db.create_user(conn, body.email, hash_password(body.password))
        except db.EmailAlreadyRegisteredError:
            raise HTTPException(status_code=409, detail="Email is already registered") from None
        token = db.create_session(conn, user["id"])
    response.set_cookie(SESSION_COOKIE, token, httponly=True, samesite="lax", path="/")
    return UserResponse(email=user["email"])


@app.post("/api/auth/login", response_model=UserResponse)
def login(body: LoginRequest, response: Response) -> UserResponse:
    with db.connection() as conn:
        user = db.get_user_by_email(conn, body.email)
        if user is None or not verify_password(body.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
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


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@app.post("/api/documents/chat")
def selection_chat(body: ChatRequest, session_id: str | None = Cookie(default=None)):
    _current_user(session_id)
    return run_selection_turn(body.messages)


@app.post("/api/documents/{slug}/chat")
def document_chat(slug: str, body: ChatRequest, session_id: str | None = Cookie(default=None)):
    _current_user(session_id)
    if slug not in REGISTRY:
        raise HTTPException(status_code=404, detail="Unknown document type")
    return REGISTRY[slug].run_chat_turn(body.messages)


class DocumentSummary(BaseModel):
    id: int
    slug: str
    documentTitle: str
    createdAt: str


class DocumentDetail(DocumentSummary):
    fields: dict[str, Any]
    updatedAt: str


def _document_detail(row: sqlite3.Row) -> DocumentDetail:
    return DocumentDetail(
        id=row["id"],
        slug=row["slug"],
        documentTitle=REGISTRY[row["slug"]].document_title,
        createdAt=row["created_at"],
        updatedAt=row["updated_at"],
        fields=json.loads(row["fields_json"]),
    )


class CreateHistoryRequest(BaseModel):
    slug: str
    fields: dict[str, Any]


class UpdateHistoryRequest(BaseModel):
    fields: dict[str, Any]


@app.post("/api/history", response_model=DocumentDetail, status_code=201)
def create_history_entry(body: CreateHistoryRequest, session_id: str | None = Cookie(default=None)) -> DocumentDetail:
    user = _current_user(session_id)
    if body.slug not in REGISTRY:
        raise HTTPException(status_code=404, detail="Unknown document type")
    with db.connection() as conn:
        row = db.create_document(conn, user["id"], body.slug, body.fields)
    return _document_detail(row)


@app.get("/api/history", response_model=list[DocumentSummary])
def list_history(session_id: str | None = Cookie(default=None)) -> list[DocumentSummary]:
    user = _current_user(session_id)
    with db.connection() as conn:
        rows = db.list_documents(conn, user["id"])
    return [
        DocumentSummary(
            id=row["id"],
            slug=row["slug"],
            documentTitle=REGISTRY[row["slug"]].document_title,
            createdAt=row["created_at"],
        )
        for row in rows
    ]


@app.get("/api/history/{document_id}", response_model=DocumentDetail)
def get_history_entry(document_id: int, session_id: str | None = Cookie(default=None)) -> DocumentDetail:
    user = _current_user(session_id)
    with db.connection() as conn:
        row = db.get_document(conn, document_id, user["id"])
    if row is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return _document_detail(row)


@app.put("/api/history/{document_id}", response_model=DocumentDetail)
def update_history_entry(
    document_id: int, body: UpdateHistoryRequest, session_id: str | None = Cookie(default=None)
) -> DocumentDetail:
    user = _current_user(session_id)
    with db.connection() as conn:
        row = db.update_document(conn, document_id, user["id"], body.fields)
    if row is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return _document_detail(row)


if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
