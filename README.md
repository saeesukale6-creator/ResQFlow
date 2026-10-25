# 🚨 ResQFlow – Emergency Response Management System

**A database-driven emergency response management and resource allocation system.**

<p align="center">

  <a href="https://resqflow-emergency-eosin.vercel.app/">
    
  </a>
  
</p>

## 🌐 Live Demo

**Website:** https://resqflow-emergency-eosin.vercel.app/



ResQFlow is an academic project designed to demonstrate how database systems and intelligent resource allocation can support emergency response management.

> **Safety Notice:** ResQFlow is a student prototype and is not connected to real emergency services. Do not use it to report real emergencies. In India, call **112** for emergency assistance.

---

## 📌 1. Project Overview

ResQFlow is a web-based Emergency Response Management System that helps users report emergencies and enables dispatchers to manage incidents and emergency response resources.

The system stores emergency information in a PostgreSQL database and provides a platform for viewing incident records and managing emergency response operations.

Based on the type, severity, and location of an incident, the system is designed to recommend suitable available response teams. Dispatchers can review recommendations, confirm assignments, and monitor incident status.

The project focuses on database management, backend API development, web application design, and resource allocation.

## 🎯 2. Objectives

- Develop a database-driven system for managing emergency incidents.
- Store and retrieve incident, resource, and assignment information.
- Organize emergency response resources according to their type and availability.
- Recommend suitable response teams based on incident requirements and location.
- Help dispatchers review assignments and update incident status.
- Explore and compare baseline resource allocation with Integer Linear Programming (ILP).
- Investigate machine-learning techniques for emergency demand forecasting.
- Maintain data accuracy using database constraints and validation.

## ✨ 3. Main Features

### Emergency Reporting
- Web-based interface for recording emergency details.
- Capture emergency type, location, and severity.
- Store emergency reports through the backend API.

### Dispatcher Dashboard
- View emergency records.
- Review incident details and status.
- Support emergency record management.

### Emergency Resource Management
The system is designed to support four types of emergency response teams:

- 🚑 Ambulance
- 🚒 Fire engine
- 🚓 Police
- 🛟 Rescue team

### Resource Allocation
- Identify response resources suitable for an incident.
- Consider resource availability and recorded location coordinates.
- Recommend teams for dispatcher review and confirmation.

### Incident Tracking
- Track incident status throughout the response process.
- Maintain assignment information and incident history where implemented.

### Future Enhancements
- Integer Linear Programming (ILP) optimization using Google OR-Tools.
- Machine-learning-based emergency demand forecasting.
- Automated comparison of baseline and optimized allocation methods.
- Expanded automated testing and performance evaluation.

*Features listed as future enhancements should be considered under development until they are implemented and tested.*

## 🛠️ 4. Technologies Used

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Database Administration | pgAdmin 4 |
| API Testing | FastAPI Swagger UI |
| Deployment – Frontend | Vercel |
| Deployment – Backend | Render |
| Version Control | Git and GitHub |
| Optimization – Planned | Google OR-Tools |
| Machine Learning – Planned | scikit-learn, pandas, NumPy |
| Testing – Planned/Developing | pytest |

## ⚙️ 5. How ResQFlow Works

1. **Report an emergency:** A user or dispatcher enters the incident details.
2. **Validate the request:** The FastAPI backend receives the request and validates the submitted information.
3. **Store the data:** Valid emergency information is saved in the PostgreSQL database.
4. **Review the incident:** The dispatcher views the emergency record through the web interface.
5. **Recommend resources:** The allocation module can identify suitable available teams based on the incident requirements and recorded coordinates, where implemented.
6. **Confirm assignments:** The dispatcher reviews and confirms recommended assignments.
7. **Track progress:** Incident status and assignment information can be updated as the response progresses.

The workflow depends on the features currently implemented in the deployed application.

## 🏗️ 6. System Architecture

```text
        User / Dispatcher
                |
                v
       React + Vite Frontend
             (Vercel)
                |
                | HTTP Requests / REST API
                v
          FastAPI Backend
             (Render)
                |
                v
        PostgreSQL Database
                |
                v
       Emergency Records
       Resources & Assignments
```

The frontend communicates with the backend API, while the backend handles application logic and database operations.

## 📂 7. Project Structure

The following is a simplified view of the current project and its intended organization. Individual files and modules may change as development progresses.

```text
ResQFlow/
├── README.md
├── requirements.txt
├── .gitignore
├── main.py
├── backend/
│   └── db.py
├── database/
│   └── render_schema.sql
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── src/
│   │   └── assets/
│   └── ...
└── docs/
    └── ...
```

**Important:** Keep your local `.env` file private. Never commit database passwords, secret API keys, or credentials to GitHub.

## 💻 8. Local Installation and Setup

### Prerequisites

Install the following software:

- Python 3.11 or newer
- PostgreSQL and pgAdmin 4
- Node.js and npm
- Visual Studio Code
- Git

### Step 1: Clone the repository

```bash
git clone https://github.com/saeesukale6-creator/ResQFlow.git
cd ResQFlow
```

### Step 2: Create a Python virtual environment

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution, use Command Prompt and activate with:

```cmd
venv\Scripts\activate.bat
```

### Step 3: Install Python dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Install frontend dependencies

Open a terminal in the `frontend` directory:

```bash
cd frontend
npm install
```

### Step 5: Configure the database

1. Create a PostgreSQL database named `resqflow`.
2. Configure the database connection using your local environment variables.
3. Use the appropriate SQL schema and setup scripts available in the repository.
4. Verify that the backend can connect to PostgreSQL.

Do not use production credentials in your local development files or upload them to GitHub.

### Step 6: Start the application

Start the backend using the entry point and command appropriate for the current project configuration. For example, if `main.py` exposes a FastAPI application named `app`:

```bash
uvicorn main:app --reload
```

Start the frontend in a separate terminal:

```bash
cd frontend
npm run dev
```

Open the local development URL displayed by Vite in your terminal.

*Note: The exact database configuration, environment variable names, and startup commands must match the files currently present in the repository.*

## ☁️ 9. Deployment

ResQFlow uses separate deployment services for the frontend and backend.

| Service | Platform | Link |
|---|---|---|
| Live Website | Vercel | https://resqflow-emergency-eosin.vercel.app/ |
| Backend API | Render | https://resqflow-backend-sfry.onrender.com |
| API Documentation | FastAPI / Swagger UI | https://resqflow-backend-sfry.onrender.com/docs |
| Source Code | GitHub | https://github.com/saeesukale6-creator/ResQFlow |

The frontend uses the backend API to send and retrieve emergency data. The backend connects to the hosted PostgreSQL database.

## 🧪 10. Testing and Validation

The application can be evaluated through the following checks:

- Verify that the website loads correctly.
- Confirm that emergency records can be submitted through the API.
- Check that submitted records are stored in PostgreSQL.
- Verify that existing emergency records can be retrieved.
- Test invalid input and error handling.
- Check that the frontend can communicate with the deployed backend.
- Test resource allocation and assignment logic as those modules are implemented.

Optimization and machine-learning experiments should be evaluated separately when their corresponding modules are available.

## ⚠️ 11. Limitations

- ResQFlow is an academic prototype, not a production emergency dispatch system.
- Sample incident and resource information may be fictional.
- Straight-line distance is not equivalent to actual road travel distance or travel time.
- Recommendations depend on the quality and availability of recorded resource data.
- Machine-learning experiments using synthetic data cannot establish real-world prediction accuracy.
- Resource recommendations require appropriate dispatcher review and confirmation.
- The application is not integrated with official emergency services.

## 👩‍💻 12. Team Members

| Sr. No. | Name | Roll Number |
|:---:|---|:---:|
| 1 | Nikita Kulkarni | 1262241563 |
| 2 | Saee Sukale | 1262241881 |

## 🎓 13. Academic Project Disclaimer

ResQFlow is developed for educational purposes, demonstration, and academic evaluation. It is intended to illustrate the use of web technologies, databases, APIs, and emergency resource management concepts.

It must not be used to handle real emergency calls, dispatch actual response teams, or replace official emergency response services.

**For real emergencies in India, call 112.**

---

<p align="center">

  **ResQFlow — Supporting Smarter Emergency Response Management**

  Developed as an academic project.

</p>
