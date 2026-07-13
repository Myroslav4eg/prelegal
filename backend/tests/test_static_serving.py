"""Regression guard: API routers must be registered before the static mount,
or StaticFiles on "/" would shadow /api/* entirely.
"""


def test_api_routes_are_not_shadowed_by_static_mount(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401
    assert response.headers["content-type"].startswith("application/json")


def test_unknown_path_falls_through_to_static_mount(client):
    response = client.get("/some-page-that-does-not-exist")

    assert response.status_code == 404
