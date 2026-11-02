"""Reset only explicitly confirmed development/test databases through Alembic."""
import argparse
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy.engine import make_url

from app.core.config import settings


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--confirm", action="store_true", help="Confirm that this database will be reset")
    args = parser.parse_args()
    database_name = make_url(settings.database_url).database or ""
    if settings.environment.lower() not in {"development", "dev", "test", "testing"}:
        raise SystemExit("Refusing reset: ENVIRONMENT must be development or test")
    if not (database_name.endswith("_dev") or database_name.endswith("_test")):
        raise SystemExit("Refusing reset: DATABASE_URL database name must end in _dev or _test")
    if not args.confirm:
        raise SystemExit("Database reset is destructive; rerun with --confirm after checking DATABASE_URL")
    backend_dir = Path(__file__).resolve().parents[1]
    for command in ([sys.executable, "-m", "alembic", "downgrade", "base"], [sys.executable, "-m", "alembic", "upgrade", "head"]):
        subprocess.run(command, cwd=backend_dir, check=True)


if __name__ == "__main__":
    main()
