
import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

# Find the project's .env file
PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")


def get_connection():
    """Connect to the ResQFlow PostgreSQL database."""
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "resqflow"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )
