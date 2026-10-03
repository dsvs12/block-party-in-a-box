import os

os.environ["DATABASE_URL"] = os.environ.get("TEST_DATABASE_URL", "sqlite:///./test.db")
os.environ["TODAY_OVERRIDE"] = "2026-10-03"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture(scope="session")
def client():
    from app import seed
    from app.main import app
    seed.run()
    with TestClient(app) as c:
        yield c
    if os.path.exists("test.db"):
        os.remove("test.db")
