"""Run all idempotent initializers after applying database migrations."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from seed_admin import seed_admin
from seed_projects import seed_projects
from seed_skills import seed_skills
from seed_settings import seed_settings


def main() -> None:
    seed_admin()
    projects = seed_projects()
    skills = seed_skills()
    seed_settings()
    print(f"Database initialization complete (projects={projects}, skills={skills})")


if __name__ == "__main__":
    main()
