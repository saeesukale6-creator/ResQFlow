-- ResQFlow: SQL queries for DBMS demonstration

-- 1. Display all emergency reports
SELECT *
FROM emergency_reports
ORDER BY reported_at DESC;

-- 2. Display pending emergencies
SELECT report_id, emergency_type, location, severity, reported_at
FROM emergency_reports
WHERE status = 'Pending'
ORDER BY reported_at DESC;

-- 3. Display available ambulances
SELECT ambulance_id, ambulance_name, location, status
FROM ambulances
WHERE status = 'Available'
ORDER BY ambulance_id;

-- 4. Display emergency and assigned ambulance details (JOIN)
SELECT
    a.assignment_id,
    e.report_id,
    e.emergency_type,
    e.location AS emergency_location,
    am.ambulance_name,
    am.location AS ambulance_location,
    a.assigned_at,
    a.estimated_response_minutes
FROM assignments a
JOIN emergency_reports e ON e.report_id = a.report_id
JOIN ambulances am ON am.ambulance_id = a.ambulance_id
ORDER BY a.assigned_at DESC;

-- 5. Count emergencies by severity (GROUP BY)
SELECT severity, COUNT(*) AS emergency_count
FROM emergency_reports
GROUP BY severity
ORDER BY emergency_count DESC;

-- 6. Count ambulances by status
SELECT status, COUNT(*) AS ambulance_count
FROM ambulances
GROUP BY status;

-- 7. Count emergencies by current status
SELECT status, COUNT(*) AS emergency_count
FROM emergency_reports
GROUP BY status;

-- 8. Display assignments with response estimates
SELECT assignment_id, report_id, ambulance_id,
       assigned_at, estimated_response_minutes
FROM assignments
ORDER BY assigned_at DESC;

-- 9. Display emergency reports with no assignment (LEFT JOIN)
SELECT e.report_id, e.emergency_type, e.location, e.severity
FROM emergency_reports e
LEFT JOIN assignments a ON a.report_id = e.report_id
WHERE a.assignment_id IS NULL;

-- 10. Display emergency types reported more than once
SELECT emergency_type, COUNT(*) AS report_count
FROM emergency_reports
GROUP BY emergency_type
HAVING COUNT(*) > 1;
