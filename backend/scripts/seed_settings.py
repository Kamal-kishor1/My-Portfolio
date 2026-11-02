"""Settings seed hook. This schema currently has no persisted settings model."""


def seed_settings() -> int:
    # Intentionally no-op until a settings table and validated settings schema exist.
    return 0


if __name__ == "__main__":
    print(f"Settings seed records processed: {seed_settings()}")
