from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg

app = FastAPI(title="ResQFlow API")

DATABASE_URL = "postgresql:///resqflow"


class EmergencyReport(BaseModel):
    emergency_type: str
    location: str
    severity: str


def get_connection():
    return psycopg.connect(DATABASE_URL)


@app.get("/")
def home():
    return {"message": "ResQFlow API is running"}


@app.get("/emergencies")
def get_emergencies():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT report_id, emergency_type, location,
                       severity, reported_at, status
                FROM emergency_reports
                ORDER BY reported_at DESC
            """)
            rows = cur.fetchall()

    return [
        {
            "report_id": row[0],
            "emergency_type": row[1],
            "location": row[2],
            "severity": row[3],
            "reported_at": row[4].isoformat() if row[4] else None,
            "status": row[5]
        }
        for row in rows
    ]


@app.post("/emergencies")
def create_emergency(report: EmergencyReport):
    if report.severity not in ["Low", "Medium", "High", "Critical"]:
        raise HTTPException(
            status_code=400,
            detail="Severity must be Low, Medium, High, or Critical"
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO emergency_reports
                    (emergency_type, location, severity)
                VALUES (%s, %s, %s)
                RETURNING report_id
            """, (
                report.emergency_type,
                report.location,
                report.severity
            ))
            report_id = cur.fetchone()[0]

    return {
        "message": "Emergency report created successfully",
        "report_id": report_id
    }


@app.get("/ambulances")
def get_ambulances():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT ambulance_id, ambulance_name, location, status
                FROM ambulances
                ORDER BY ambulance_id
            """)
            rows = cur.fetchall()

    return [
        {
            "ambulance_id": row[0],
            "ambulance_name": row[1],
            "location": row[2],
            "status": row[3]
        }
        for row in rows
    ]
