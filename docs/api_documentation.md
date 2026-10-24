# ResQFlow API Documentation

## Overview

ResQFlow provides a FastAPI backend for managing emergency reports, ambulance availability, ambulance assignments, and demonstration emergency-demand predictions.

## Base URL

When running locally, the API is typically available at:

`http://127.0.0.1:8000`

## API Endpoints

### 1. Check API Status

- **Method:** GET
- **Path:** `/`
- **Purpose:** Confirms that the API is running.

### 2. List Emergency Reports

- **Method:** GET
- **Path:** `/emergencies`
- **Purpose:** Returns emergency reports ordered by reporting time, newest first.

### 3. Create an Emergency Report

- **Method:** POST
- **Path:** `/emergencies`
- **Purpose:** Creates a new emergency report.
- **Request fields:** `emergency_type`, `location`, `severity`
- **Accepted severity values:** `Low`, `Medium`, `High`, `Critical`

### 4. List Ambulances

- **Method:** GET
- **Path:** `/ambulances`
- **Purpose:** Returns ambulance IDs, names, locations, and statuses.

### 5. Open the Dashboard

- **Method:** GET
- **Path:** `/dashboard`
- **Purpose:** Serves the dashboard HTML page.

### 6. Assign an Ambulance

- **Method:** POST
- **Path:** `/assign-ambulance`
- **Purpose:** Assigns an available ambulance to a pending emergency.
- **Request field:** `report_id`
- **Possible errors:** Emergency not found, emergency is not pending, or no ambulance is available.

The response-time estimate is a demonstration estimate based on whether the ambulance and emergency locations match. It is not a real travel-time calculation.

### 7. List Assignments

- **Method:** GET
- **Path:** `/assignments`
- **Purpose:** Returns assignment records with related emergency and ambulance information.

### 8. Predict Emergency Demand

- **Method:** GET
- **Path:** `/predict-demand`
- **Required query parameters:** `location`, `hour`, `day_of_week`
- **Validation:** `hour` must be between 0 and 23; `day_of_week` must be between 0 and 6.
- **Purpose:** Returns a demonstration prediction from the saved machine-learning model.

The prediction uses simulated training data and should not be treated as a real-world emergency forecast.

## Testing the API

When the application is running, open:

`http://127.0.0.1:8000/docs`

FastAPI provides an interactive API page where the available endpoints can be explored and tested.

## Safety Note

ResQFlow is an academic demonstration prototype. It must not be relied upon for real emergency dispatch or emergency-demand decisions.
