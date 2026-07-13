"""SQLite schema and queries for users and sessions.

The database is recreated from scratch on every application boot (see
`init_db`), so there is no migration story: schema changes just edit the
`CREATE TABLE` statements below.
"""

import os
import secrets
import sqlite3
from contextlib import contextmanager
from pathlib import Path

_DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "data" / "app.db"


def _db_path() -> Path:
    override = os.environ.get("PRELEGAL_DB_PATH")
    return Path(override) if override else _DEFAULT_DB_PATH


def init_db() -> None:
    """Delete any existing database file and recreate the schema fresh."""
    path = _db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.unlink(missing_ok=True)

    with sqlite3.connect(path) as conn:
        conn.execute(
            """
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
            """
        )


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(_db_path())
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def connection():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


def get_or_create_user(conn: sqlite3.Connection, email: str) -> sqlite3.Row:
    conn.execute(
        "INSERT INTO users (email) VALUES (?) ON CONFLICT(email) DO NOTHING",
        (email,),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    assert row is not None
    return row


def create_session(conn: sqlite3.Connection, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    conn.execute(
        "INSERT INTO sessions (token, user_id) VALUES (?, ?)",
        (token, user_id),
    )
    conn.commit()
    return token


def get_user_by_session_token(conn: sqlite3.Connection, token: str) -> sqlite3.Row | None:
    return conn.execute(
        """
        SELECT u.id, u.email
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = ?
        """,
        (token,),
    ).fetchone()


def delete_session(conn: sqlite3.Connection, token: str) -> None:
    conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
