-- Migration 002: Add emergency assignment view and status index

BEGIN;

CREATE VIEW emergency_assignment_details AS
SELECT
    er.report_id,
    er.emergency_type,
    er.location AS emergency_location,
    er.severity,
    er.reported_at,
    er.status AS emergency_status,
    a.assignment_id,
    am.ambulance_name,
    am.location AS ambulance_location,
    am.status AS ambulance_status,
    a.assigned_at,
    a.estimated_response_minutes
FROM emergency_reports er
LEFT JOIN assignments a
    ON er.report_id = a.report_id
LEFT JOIN ambulances am
    ON a.ambulance_id = am.ambulance_id;

CREATE INDEX idx_emergency_reports_status
ON emergency_reports (status);

COMMIT;
