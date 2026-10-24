from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
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



@app.get("/dashboard")
def dashboard():
    return FileResponse("static/index.html")


class AssignmentRequest(BaseModel):
    report_id: int


@app.post("/assign-ambulance")
def assign_ambulance(request: AssignmentRequest):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT report_id, location, status
                FROM emergency_reports
                WHERE report_id = %s
                FOR UPDATE
            """, (request.report_id,))
            emergency = cur.fetchone()

            if not emergency:
                raise HTTPException(status_code=404, detail="Emergency not found")

            if emergency[2] != "Pending":
                raise HTTPException(
                    status_code=400,
                    detail="Only pending emergencies can be assigned"
                )

            cur.execute("""
                SELECT ambulance_id, ambulance_name, location
                FROM ambulances
                WHERE status = 'Available'
                ORDER BY
                    CASE WHEN LOWER(location) = LOWER(%s) THEN 0 ELSE 1 END,
                    ambulance_id
                LIMIT 1
                FOR UPDATE
            """, (emergency[1],))
            ambulance = cur.fetchone()

            if not ambulance:
                raise HTTPException(
                    status_code=409,
                    detail="No available ambulances"
                )

            # Demo estimate only; this is not a real travel-time calculation.
            estimated_minutes = 10 if ambulance[2].lower() == emergency[1].lower() else 20

            cur.execute("""
                INSERT INTO assignments
                    (report_id, ambulance_id, estimated_response_minutes)
                VALUES (%s, %s, %s)
                RETURNING assignment_id, assigned_at
            """, (request.report_id, ambulance[0], estimated_minutes))
            assignment = cur.fetchone()

            cur.execute("""
                UPDATE emergency_reports
                SET status = 'Assigned'
                WHERE report_id = %s
            """, (request.report_id,))

            cur.execute("""
                UPDATE ambulances
                SET status = 'Busy'
                WHERE ambulance_id = %s
            """, (ambulance[0],))

    return {
        "message": "Ambulance assigned successfully",
        "assignment_id": assignment[0],
        "report_id": request.report_id,
        "ambulance_id": ambulance[0],
        "ambulance_name": ambulance[1],
        "estimated_response_minutes": estimated_minutes,
        "assigned_at": assignment[1].isoformat()
    }


@app.get("/assignments")
def get_assignments():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT a.assignment_id, a.report_id, e.emergency_type,
                       a.ambulance_id, am.ambulance_name,
                       a.assigned_at, a.estimated_response_minutes
                FROM assignments a
                JOIN emergency_reports e ON e.report_id = a.report_id
                JOIN ambulances am ON am.ambulance_id = a.ambulance_id
                ORDER BY a.assigned_at DESC
            """)
            rows = cur.fetchall()

    return [
        {
            "assignment_id": row[0],
            "report_id": row[1],
            "emergency_type": row[2],
            "ambulance_id": row[3],
            "ambulance_name": row[4],
            "assigned_at": row[5].isoformat() if row[5] else None,
            "estimated_response_minutes": row[6]
        }
        for row in rows
    ]
