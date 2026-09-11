import os
import uvicorn
from main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting NeuroVitals AI server on http://0.0.0.0:{port} ...", flush=True)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")