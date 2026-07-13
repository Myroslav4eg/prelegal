import sqlite3
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import chat, db


class FakeMessage:
    def __init__(self, content: str) -> None:
        self.content = content


class FakeChoice:
    def __init__(self, content: str) -> None:
        self.message = FakeMessage(content)


class FakeResponse:
    def __init__(self, content: str) -> None:
        self.choices = [FakeChoice(content)]


@pytest.fixture
def stub_completion(monkeypatch: pytest.MonkeyPatch):
    def _stub(content: str) -> None:
        monkeypatch.setattr(chat, "completion", lambda **kwargs: FakeResponse(content))

    return _stub


@pytest.fixture
def db_path(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    path = tmp_path / "test.db"
    monkeypatch.setenv("PRELEGAL_DB_PATH", str(path))
    return path


@pytest.fixture
def conn(db_path: Path):
    db.init_db()
    connection = db.get_connection()
    yield connection
    connection.close()


@pytest.fixture
def client(db_path: Path) -> TestClient:
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
