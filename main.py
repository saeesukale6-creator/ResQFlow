from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import psycopg
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="ResQFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://resqflow-emergency-eosin.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing. Check your .env file.")

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
                       severity, reported_at, status,
                       latitude, longitude
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
            "status": row[5],
            "latitude": row[6],
            "longitude": row[7]
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



class AssignmentRequest(BaseModel):
    report_id: int
    ambulance_id: int


@app.post("/assign-ambulance")
def assign_ambulance(request: AssignmentRequest):
    with get_connection() as conn:
        with conn.cursor() as cur:

            # 1. Check and lock the emergency report
            cur.execute("""
                SELECT report_id, location, status
                FROM emergency_reports
                WHERE report_id = %s
                FOR UPDATE
            """, (request.report_id,))

            emergency = cur.fetchone()

            if not emergency:
                raise HTTPException(
                    status_code=404,
                    detail="Emergency not found"
                )

            if emergency[2] != "Pending":
                raise HTTPException(
                    status_code=400,
                    detail="Only pending emergencies can be assigned"
                )

            # 2. Check and lock the ambulance selected by the user
            cur.execute("""
                SELECT ambulance_id, ambulance_name, location, status
                FROM ambulances
                WHERE ambulance_id = %s
                FOR UPDATE
            """, (request.ambulance_id,))

            ambulance = cur.fetchone()

            if not ambulance:
                raise HTTPException(
                    status_code=404,
                    detail="Selected ambulance not found"
                )

            if ambulance[3] != "Available":
                raise HTTPException(
                    status_code=409,
                    detail="Selected ambulance is no longer available"
                )

            # 3. Calculate a simple demo estimate
            estimated_minutes = (
                10
                if ambulance[2].strip().lower()
                == emergency[1].strip().lower()
                else 20
            )

            # This is a demo estimate, not real GPS travel time.

            # 4. Save the assignment
            cur.execute("""
                INSERT INTO assignments
                    (report_id, ambulance_id, estimated_response_minutes)
                VALUES (%s, %s, %s)
                RETURNING assignment_id, assigned_at
            """, (
                request.report_id,
                ambulance[0],
                estimated_minutes
            ))

            assignment = cur.fetchone()

            # 5. Update emergency status
            cur.execute("""
                UPDATE emergency_reports
                SET status = 'Assigned'
                WHERE report_id = %s
            """, (request.report_id,))

            # 6. Mark the selected ambulance as busy
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



# Machine Learning: Emergency Demand Prediction
# Trains a Random Forest using historical PostgreSQL records.

from datetime import datetime
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor


@app.get("/predict-demand")
def predict_demand(
    location: str,
    hour: int,
    day_of_week: int
):
    if not location.strip():
        raise HTTPException(
            status_code=400,
            detail="Location is required"
        )

    if hour < 0 or hour > 23:
        raise HTTPException(
            status_code=400,
            detail="Hour must be between 0 and 23"
        )

    if day_of_week < 0 or day_of_week > 6:
        raise HTTPException(
            status_code=400,
            detail="Day of week must be between 0 and 6"
        )

    # Get historical emergencies from PostgreSQL.
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT location, reported_at
                FROM emergency_reports
                WHERE reported_at IS NOT NULL
            """)
            rows = cur.fetchall()

    if len(rows) < 48:
        return {
            "status": "insufficient_data",
            "message": (
                "At least 48 historical emergency reports "
                "are recommended before training this model."
            ),
            "historical_reports": len(rows),
            "predicted_emergency_demand": None
        }

    df = pd.DataFrame(
        rows,
        columns=["location", "reported_at"]
    )

    df["location"] = df["location"].astype(str).str.strip()
    df["reported_at"] = pd.to_datetime(
        df["reported_at"], errors="coerce"
    )
    df = df.dropna(subset=["reported_at"])
    df = df[df["location"] != ""]

    if len(df) < 48:
        return {
            "status": "insufficient_data",
            "message": "Not enough valid historical records.",
            "predicted_emergency_demand": None
        }

    # Extract features from each emergency timestamp.
    df["hour"] = df["reported_at"].dt.hour
    df["day_of_week"] = df["reported_at"].dt.dayofweek

    # Build training examples: reports per location/hour/day.
    training = (
        df.groupby(
            ["location", "hour", "day_of_week"]
        )
        .size()
        .reset_index(name="emergency_count")
    )

    if len(training) < 10:
        return {
            "status": "insufficient_data",
            "message": (
                "Not enough distinct location/time patterns "
                "to train the model reliably."
            ),
            "historical_reports": len(df),
            "training_patterns": len(training),
            "predicted_emergency_demand": None
        }

    features = ["location", "hour", "day_of_week"]

    X = training[features]
    y = training["emergency_count"]

    # Encode locations and train the Random Forest model.
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "location",
                OneHotEncoder(handle_unknown="ignore"),
                ["location"]
            )
        ],
        remainder="passthrough"
    )

    model = Pipeline([
        ("preprocessor", preprocessor),
        (
            "regressor",
            RandomForestRegressor(
                n_estimators=100,
                random_state=42,
                min_samples_leaf=2
            )
        )
    ])

    model.fit(X, y)

    # Generate the requested prediction.
    input_data = pd.DataFrame([{
        "location": location.strip(),
        "hour": hour,
        "day_of_week": day_of_week
    }])

    prediction = float(model.predict(input_data)[0])
    estimated_demand = max(0, round(prediction))

    return {
        "status": "success",
        "location": location.strip(),
        "hour": hour,
        "day_of_week": day_of_week,
        "predicted_emergency_demand": estimated_demand,
        "unit": (
            "estimated emergency reports for this "
            "location/hour/day-of-week pattern"
        ),
        "model": "Random Forest Regressor",
        "historical_reports": len(df),
        "training_patterns": len(training),
        "data_note": (
            "Experimental prediction trained on historical "
            "database records. Accuracy has not been independently "
            "validated. Simulated records can produce misleading results."
        )
    }
