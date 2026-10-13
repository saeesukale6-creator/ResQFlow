
CREATE TABLE emergency_reports (
    report_id SERIAL PRIMARY KEY,
    emergency_type VARCHAR(50) NOT NULL,
    location VARCHAR(200) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'Pending'
);

CREATE TABLE ambulances (
    ambulance_id SERIAL PRIMARY KEY,
    ambulance_name VARCHAR(50) NOT NULL,
    location VARCHAR(200) NOT NULL,
    status VARCHAR(30) DEFAULT 'Available'
);

CREATE TABLE assignments (
    assignment_id SERIAL PRIMARY KEY,
    report_id INT REFERENCES emergency_reports(report_id),
    ambulance_id INT REFERENCES ambulances(ambulance_id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_response_minutes INT
);

