
-- ResQFlow: Database Integrity Checks
-- These SELECT queries inspect data without modifying it.

-- 1. Find emergency reports with missing required values
SELECT *
FROM emergency_reports
WHERE emergency_type IS NULL
   OR location IS NULL
   OR severity IS NULL;

-- 2. Find ambulances with missing required values
SELECT *
FROM ambulances
WHERE ambulance_name IS NULL
   OR location IS NULL
   OR status IS NULL;

-- 3. Find assignments with no matching emergency report
SELECT a.*
FROM assignments a
LEFT JOIN emergency_reports e
    ON a.report_id = e.report_id
WHERE e.report_id IS NULL;

-- 4. Find assignments with no matching ambulance
SELECT a.*
FROM assignments a
LEFT JOIN ambulances am
    ON a.ambulance_id = am.ambulance_id
WHERE am.ambulance_id IS NULL;

-- 5. Find emergency reports with an unexpected status
SELECT *
FROM emergency_reports
WHERE status NOT IN ('Pending', 'Assigned');

-- 6. Find ambulances with an unexpected status
SELECT *
FROM ambulances
WHERE status NOT IN ('Available', 'Busy');
