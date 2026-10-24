# ResQFlow Database Data Dictionary

## Overview

ResQFlow uses a PostgreSQL database to store emergency reports, ambulance information, and ambulance assignments. The database contains three tables.

## 1. emergency_reports

Stores information about reported emergencies.

| Column | Description |
|---|---|
| `report_id` | Unique ID for each emergency; primary key |
| `emergency_type` | Type of emergency |
| `location` | Location of the emergency |
| `severity` | Severity level of the emergency |
| `reported_at` | Date and time the emergency was reported |
| `status` | Current status; defaults to `Pending` |

## 2. ambulances

Stores ambulance details and availability.

| Column | Description |
|---|---|
| `ambulance_id` | Unique ID for each ambulance; primary key |
| `ambulance_name` | Name or identifier of the ambulance |
| `location` | Current recorded location |
| `status` | Availability status; defaults to `Available` |

## 3. assignments

Records which ambulance is assigned to which emergency.

| Column | Description |
|---|---|
| `assignment_id` | Unique ID for each assignment; primary key |
| `report_id` | References `emergency_reports.report_id` |
| `ambulance_id` | References `ambulances.ambulance_id` |
| `assigned_at` | Date and time of assignment |
| `estimated_response_minutes` | Demonstration estimate of response time in minutes |

## Relationships

- One emergency report can have assignment records associated with it.
- One ambulance can have assignment records associated with it.
- `assignments.report_id` references `emergency_reports.report_id`.
- `assignments.ambulance_id` references `ambulances.ambulance_id`.

## Important Note

The response-time value is a demonstration estimate, not a real-time travel calculation. The schema defines foreign-key relationships but does not enforce that each emergency or ambulance can appear in only one assignment.
