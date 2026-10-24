# ResQFlow Project Setup Guide

## 1. Project Overview

ResQFlow is an academic prototype for emergency reporting, ambulance allocation, and demonstration emergency-demand prediction.

## 2. Requirements

Install the following software:

- Python 3.11 or newer
- PostgreSQL
- Visual Studio Code (recommended)
- Git

## 3. Download the Project

Open a terminal and run:

```bash
git clone https://github.com/saeesukale6-creator/ResQFlow.git
cd ResQFlow
```

## 4. Create a Virtual Environment

On Windows PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, you can use Command Prompt and run:

```cmd
venv\Scripts\activate.bat
```

## 5. Install Python Dependencies

With the virtual environment activated, run:

```bash
python -m pip install -r requirements.txt
```

## 6. Create the PostgreSQL Database

Open PostgreSQL or pgAdmin and create a database named `resqflow`.

Then execute the SQL statements in the project's root `schema.sql` against that database.

## 7. Start the Application

From the project root, run:

```bash
uvicorn main:app --reload
```

If the command is unavailable, verify that the virtual environment is activated and that the dependencies were installed successfully.

## 8. Open the Application

- API status: `http://127.0.0.1:8000/`
- Interactive API documentation: `http://127.0.0.1:8000/docs`
- Dashboard: `http://127.0.0.1:8000/dashboard`

## 9. Important Notes

- The application expects PostgreSQL to be accessible through the configured database connection.
- The machine-learning prediction uses demonstration data and is not a real-world emergency forecast.
- Response-time estimates are illustrative, not actual travel-time calculations.
- Never commit passwords, secret keys, `.env` files, or your virtual environment to GitHub.
- ResQFlow is an academic prototype, not a replacement for official emergency services.
