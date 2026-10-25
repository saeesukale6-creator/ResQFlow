
CREATE TABLE incident_types (
    incident_type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(60) UNIQUE NOT NULL
);

CREATE TABLE resource_types (
    resource_type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(60) UNIQUE NOT NULL
);

CREATE TABLE incidents (
    incident_id SERIAL PRIMARY KEY,
    incident_type_id INTEGER NOT NULL
        REFERENCES incident_types(incident_type_id),
    description TEXT NOT NULL,
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resources (
    resource_id SERIAL PRIMARY KEY,
    resource_type_id INTEGER NOT NULL
        REFERENCES resource_types(resource_type_id),
    resource_code VARCHAR(30) UNIQUE NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
);

CREATE TABLE incident_resource_needs (
    need_id SERIAL PRIMARY KEY,
    incident_id INTEGER NOT NULL
        REFERENCES incidents(incident_id) ON DELETE CASCADE,
    resource_type_id INTEGER NOT NULL
        REFERENCES resource_types(resource_type_id),
    required_count INTEGER NOT NULL CHECK (required_count >= 0),
    UNIQUE (incident_id, resource_type_id)
);

CREATE TABLE resource_assignments (
    assignment_id SERIAL PRIMARY KEY,
    incident_id INTEGER NOT NULL
        REFERENCES incidents(incident_id),
    resource_id INTEGER NOT NULL
        REFERENCES resources(resource_id),
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ASSIGNED',
    UNIQUE (resource_id, incident_id)
);
