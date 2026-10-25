# 🚨 ResQFlow – Emergency Response Management System

**A smart and user-friendly platform for managing emergency reports and supporting emergency response operations.**

## 🌐 Live Demo

- **Live Website:** [ResQFlow](https://resqflow-emergency-eosin.vercel.app/)
- **Backend API:** [ResQFlow Backend](https://resqflow-backend-sfry.onrender.com)
- **API Documentation:** [Explore API Endpoints](https://resqflow-backend-sfry.onrender.com/docs)
- **GitHub Repository:** [ResQFlow Source Code](https://github.com/saeesukale6-creator/ResQFlow)

> **Note:** ResQFlow is an academic prototype developed for learning and demonstration. It is not a replacement for official emergency services. In India, call **112** for emergencies.

---

## 📌 About the Project

ResQFlow is an Emergency Response Management System designed to help organize emergency reports and support the management of emergency response activities.

The platform provides a web interface where users can submit emergency reports, including the emergency type, location, and severity. The backend processes these reports and stores the information in a PostgreSQL database.

The project aims to demonstrate how web technologies and database management can be used to support emergency response workflows.

## 🎯 Objectives

- Provide a simple interface for reporting emergencies.
- Store emergency information in a structured database.
- Organize emergency reports by type, location, and severity.
- Support the management and tracking of emergency response information.
- Demonstrate frontend, backend, and database integration.
- Build a foundation for future emergency resource allocation and response optimization.

## ✨ Features

- **Emergency Reporting:** Submit emergency details through the web interface.
- **Emergency Information Management:** Store and retrieve emergency reports.
- **Severity Classification:** Record the severity of an emergency.
- **Location Details:** Maintain location information for reported emergencies.
- **Database Integration:** Use PostgreSQL to store emergency data.
- **REST API:** Connect the frontend to the backend using FastAPI.
- **API Documentation:** Explore and test available endpoints through Swagger UI.
- **Web Deployment:** Access the prototype through its deployed website.

*Features available in the live demo may depend on the current deployment and database configuration.*

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Database Management | pgAdmin |
| API Documentation | Swagger UI |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Version Control | Git and GitHub |

## 🏗️ System Architecture

```text
              USER
                |
                v
       React + Vite Frontend
                |
                v
         FastAPI Backend
                |
                v
        PostgreSQL Database
                |
                v
       Emergency Report Data
```

The frontend sends requests to the FastAPI backend. The backend processes these requests and interacts with PostgreSQL to store or retrieve emergency information.

## 🔄 How It Works

1. The user opens the ResQFlow website.
2. The user enters the required emergency details.
3. The frontend sends the information to the backend API.
4. The backend validates and processes the request.
5. The emergency report is stored in the PostgreSQL database.
6. The application can retrieve stored reports through the API.

## 📂 Project Structure

The main project files are organized as follows:

```text
ResQFlow/
│
├── main.py
├── backend/
│   └── db.py
│
├── database/
│   └── render_schema.sql
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│
├── README.md
└── requirements.txt
```

*Note: The exact files and folders may vary depending on the current version of the repository.*

## ⚙️ Installation and Setup

Follow these steps to run the project locally.

### Prerequisites

Install the following software:

- Python 3.11 or later
- Node.js and npm
- PostgreSQL
- Git
- Visual Studio Code (recommended)

### 1. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/saeesukale6-creator/ResQFlow.git
cd ResQFlow
```

### 2. Set Up the Python Backend

Create a virtual environment:

```bash
python -m venv venv
```

Activate it in Windows Command Prompt:

```cmd
venv\Scripts\activate.bat
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure the Database

1. Open PostgreSQL through pgAdmin.
2. Create or select the database required by the project.
3. Configure the database connection settings used by the backend.
4. Apply the appropriate database schema if required.
5. Keep database credentials in environment variables or a local configuration file that is not committed to GitHub.

**Important:** Do not publish database passwords or secret connection strings in this repository.

### 4. Start the Backend

From the project root, run:

```bash
uvicorn main:app --reload
```

The backend should be available at:

```text
http://127.0.0.1:8000
```

Open the API documentation at:

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 5. Set Up the Frontend

Open a second terminal and navigate to the frontend folder:

```bash
cd frontend
npm install
```

Create or update the frontend environment file, such as `frontend/.env`, with the correct backend URL:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in the terminal, usually:

[http://localhost:5173](http://localhost:5173)

*Setup instructions may need adjustment if the repository's current configuration differs from these examples.*

## ☁️ Deployment

ResQFlow uses the following deployment services:

| Service | Purpose | Link |
|---|---|---|
| Vercel | Hosts the frontend | [Open Website](https://resqflow-emergency-eosin.vercel.app/) |
| Render | Hosts the backend API | [Open Backend](https://resqflow-backend-sfry.onrender.com) |
| Render API Docs | Documents and tests API endpoints | [Open Swagger UI](https://resqflow-backend-sfry.onrender.com/docs) |
| GitHub | Stores the project source code | [View Repository](https://github.com/saeesukale6-creator/ResQFlow) |

## 🧪 Testing

The application can be tested by:

- Opening the live website.
- Submitting an emergency report with valid details.
- Checking whether the report is saved successfully.
- Opening the API documentation to explore the endpoints.
- Verifying that the backend can connect to the PostgreSQL database.
- Checking the browser console and backend logs if an error occurs.

## 🚀 Future Enhancements

Possible future improvements include:

- Real-time emergency status updates.
- Interactive maps for emergency locations.
- Ambulance and emergency resource allocation.
- Notifications for relevant response teams.
- Role-based access for administrators and responders.
- Analytics and emergency report dashboards.
- Optimization algorithms for resource allocation.
- Machine learning support for emergency analysis, where appropriate.

These are potential enhancements and should not be considered implemented features unless they are available in the current application.

## 👥 Team Members

ResQFlow is developed collaboratively as an academic project.

| Sr. No. | Team Member | Roll Number | GitHub Profile |
|:---:|---|:---:|---|
| 1 | Nikita Kulkarni | 1262241563 | [@Nikitakulkarni05](https://github.com/Nikitakulkarni05) |
| 2 | Saee Sukale | 1262241881 | [@saeesukale6-creator](https://github.com/saeesukale6-creator) |

### 🔗 Project Links

- **Nikita's GitHub:** [github.com/Nikitakulkarni05](https://github.com/Nikitakulkarni05)
- **Saee's GitHub:** [github.com/saeesukale6-creator](https://github.com/saeesukale6-creator)
- **Shared Project Repository:** [github.com/saeesukale6-creator/ResQFlow](https://github.com/saeesukale6-creator/ResQFlow)

## 📄 Disclaimer

ResQFlow is an educational prototype intended for academic demonstration and learning. It has not been represented as a certified emergency dispatch system. Do not rely on it for real-life emergency response decisions.

For emergencies in India, contact the official emergency number **112**.

---

⭐ **Thank you for visiting ResQFlow!**
