import os
import sys

# Ensure backend directory is on sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Initialize database tables and seed if necessary on serverless cold start
try:
    from db import init_db
    init_db()
except Exception as e:
    print(f"[Vercel Serverless DB Init Notice]: {e}")

from main import app

