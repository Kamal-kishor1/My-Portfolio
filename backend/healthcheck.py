"""Container liveness check honoring Render's assigned HTTP port."""
import os
from urllib.request import urlopen


if __name__ == "__main__":
    with urlopen(f"http://127.0.0.1:{os.getenv('PORT', '8002')}/live", timeout=3):
        pass
