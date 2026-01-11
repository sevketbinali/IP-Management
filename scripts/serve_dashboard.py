#!/usr/bin/env python3
"""
Simple dashboard server for test results.
"""

import os
import sys
from pathlib import Path

# Add src to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "src"))

from fastapi import FastAPI, Response
from fastapi.responses import HTMLResponse
import uvicorn

app = FastAPI(title="Test Dashboard Server")

@app.get("/", response_class=HTMLResponse)
async def dashboard():
    """Serve the test dashboard."""
    dashboard_path = Path("/app/test_dashboard.html")
    
    if dashboard_path.exists():
        with open(dashboard_path, "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    else:
        return HTMLResponse(content="""
        <html>
        <head><title>Test Dashboard</title></head>
        <body>
        <h1>🧪 Test Dashboard</h1>
        <p>Dashboard henüz oluşturulmadı. Lütfen testleri çalıştırın:</p>
        <pre>python scripts/live_test_runner.py</pre>
        </body>
        </html>
        """)

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "Test Dashboard"}

if __name__ == "__main__":
    print("🌐 Test Dashboard Server başlatılıyor...")
    print("📊 Dashboard: http://localhost:9000")
    uvicorn.run(app, host="0.0.0.0", port=9000)