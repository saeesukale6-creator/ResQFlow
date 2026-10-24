
BEGIN;

-- Ensure every assignment references an emergency and an ambulance.
ALTER TABLE assignments
    ALTER COLUMN report_id SET NOT NULL,
    ALTER COLUMN ambulance_id SET NOT NULL;

-- Prevent negative response-time estimates.
ALTER TABLE assignments
    ADD CONSTRAINT chk_assignment_response_minutes
    CHECK (estimated_response_minutes IS NULL OR estimated_response_minutes >= 0);

-- Restrict emergency severity to recognized levels.
ALTER TABLE emergency_reports
    ADD CONSTRAINT chk_emergency_severity
    CHECK (severity IN ('Low', 'Medium', 'High', 'Critical'));

-- Restrict emergency status to recognized values.
ALTER TABLE emergency_reports
    ADD CONSTRAINT chk_emergency_status
    CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'));

-- Restrict ambulance status to recognized values.
ALTER TABLE ambulances
    ADD CONSTRAINT chk_ambulance_status
    CHECK (status IN ('Available', 'Busy', 'Out of Service'));

COMMIT;
