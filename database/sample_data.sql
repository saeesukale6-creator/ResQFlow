
-- ResQFlow sample data
-- All locations and incidents below are fictional.

-- 1. Add incident types
INSERT INTO incident_types (type_name)
VALUES
    ('Medical Emergency'),
    ('Fire'),
    ('Road Accident'),
    ('Rescue');

-- 2. Add emergency response resource types
INSERT INTO resource_types (type_name)
VALUES
    ('Ambulance'),
    ('Fire Engine'),
    ('Police'),
    ('Rescue Team');

-- 3. Add fictional incidents
INSERT INTO incidents
    (incident_type_id, description, severity, latitude, longitude, status)
VALUES
    (
        (SELECT incident_type_id FROM incident_types
         WHERE type_name = 'Medical Emergency'),
        'Fictional medical emergency near Central Park',
        5, 18.5204, 73.8567, 'OPEN'
    ),
    (
        (SELECT incident_type_id FROM incident_types
         WHERE type_name = 'Fire'),
        'Fictional building fire near Market Road',
        4, 18.5314, 73.8446, 'OPEN'
    ),
    (
        (SELECT incident_type_id FROM incident_types
         WHERE type_name = 'Road Accident'),
        'Fictional road accident near City Junction',
        3, 18.5074, 73.8077, 'OPEN'
    );

-- 4. Add fictional emergency resources
INSERT INTO resources
    (resource_type_id, resource_code, latitude, longitude, status)
VALUES
    (
        (SELECT resource_type_id FROM resource_types
         WHERE type_name = 'Ambulance'),
        'AMB-001', 18.5190, 73.8550, 'AVAILABLE'
    ),
    (
        (SELECT resource_type_id FROM resource_types
         WHERE type_name = 'Ambulance'),
        'AMB-002', 18.5350, 73.8500, 'AVAILABLE'
    ),
    (
        (SELECT resource_type_id FROM resource_types
         WHERE type_name = 'Fire Engine'),
        'FIRE-001', 18.5300, 73.8430, 'AVAILABLE'
    ),
    (
        (SELECT resource_type_id FROM resource_types
         WHERE type_name = 'Fire Engine'),
        'FIRE-002', 18.5100, 73.8200, 'AVAILABLE'
    ),
    (
        (SELECT resource_type_id FROM resource_types
         WHERE type_name = 'Police'),
        'POL-001', 18.5080, 73.8090, 'AVAILABLE'
    ),
    (
        (SELECT resource_type_id FROM resource_types
         WHERE type_name = 'Police'),
        'POL-002', 18.5250, 73.8500, 'AVAILABLE'
    ),
    (
        (SELECT resource_type_id FROM resource_types
         WHERE type_name = 'Rescue Team'),
        'RES-001', 18.5280, 73.8460, 'AVAILABLE'
    ),
    (
        (SELECT resource_type_id FROM resource_types
         WHERE type_name = 'Rescue Team'),
        'RES-002', 18.5150, 73.8300, 'AVAILABLE'
    );

-- 5. Specify the response resources each incident needs
INSERT INTO incident_resource_needs
    (incident_id, resource_type_id, required_count)
SELECT i.incident_id, rt.resource_type_id, v.required_count
FROM (
    VALUES
        ('Medical Emergency', 'Ambulance', 1),
        ('Medical Emergency', 'Police', 1),
        ('Fire', 'Fire Engine', 2),
        ('Fire', 'Ambulance', 1),
        ('Fire', 'Police', 1),
        ('Road Accident', 'Ambulance', 1),
        ('Road Accident', 'Police', 1),
        ('Rescue', 'Rescue Team', 1)
) AS v(incident_type, resource_type, required_count)
JOIN incidents i
    ON i.incident_type_id = (
        SELECT incident_type_id
        FROM incident_types
        WHERE type_name = v.incident_type
    )
JOIN resource_types rt
    ON rt.type_name = v.resource_type
WHERE i.status = 'OPEN'
  AND i.description = CASE v.incident_type
      WHEN 'Medical Emergency'
          THEN 'Fictional medical emergency near Central Park'
      WHEN 'Fire'
          THEN 'Fictional building fire near Market Road'
      WHEN 'Road Accident'
          THEN 'Fictional road accident near City Junction'
      ELSE ''
  END;
