# ResQFlow – Emergency Response Management System

## 1. Project Description

ResQFlow is a database-driven emergency response management system developed as an academic project.

The system allows a person or dispatcher to report an emergency through a website. It stores the incident details in a database and helps the dispatcher identify the nearest available emergency response teams.

The system supports four types of response teams:

- Ambulance
- Fire engine
- Police
- Rescue team

Based on the type and severity of an incident, ResQFlow recommends suitable available teams. The dispatcher can review the recommendations, confirm assignments, and update the incident status.

**Important:** ResQFlow is a student prototype only. It is not connected to real emergency services. For real emergencies in India, call 112.

## 2. Objectives

- To develop a database system for managing emergency incidents.
- To store incident details and emergency team information.
- To identify the teams required for different types of incidents.
- To recommend nearby available emergency response teams.
- To help dispatchers manage team assignments and incident status.
- To compare a basic allocation method with an optimization method.
- To explore machine learning for forecasting emergency demand.

## 3. Main Features

- Emergency incident reporting through an SOS web page.
- Dispatcher dashboard for viewing and managing incidents.
- Storage of incident, resource, and assignment details.
- Automatic identification of required response teams.
- Recommendation of nearby available teams using location coordinates.
- Manual confirmation of recommended assignments.
- Incident status tracking and history.
- Baseline allocation and Integer Linear Programming (ILP) optimization.
- Optional machine-learning-based demand forecasting.
- Database constraints to maintain data accuracy.

## 4. Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, FastAPI
- **Database:** PostgreSQL
- **Database interface:** pgAdmin
- **Optimization:** Google OR-Tools
- **Machine learning:** scikit-learn, pandas, NumPy
- **Testing:** pytest
- **Version control:** Git and GitHub

## 5. How the System Works

1. A person reports an emergency using the SOS page, or a dispatcher records an incident.
2. The backend validates the information and saves the incident in PostgreSQL.
3. The system identifies the default response teams required for that incident type.
4. The allocation logic recommends suitable available teams based on their recorded coordinates.
5. The dispatcher reviews and confirms the assignment.
6. The system updates the incident status, team availability, and assignment history.
7. The dispatcher can monitor the incident until it is completed or cancelled.

## 6. Project Structure

```text
ResQFlow-DBMS/
├── README.md
├── requirements.txt
├── .gitignore
├── .env
├── database/
│   ├── schema.sql
│   ├── sample_data.sql
│   └── queries.sql
├── backend/
│   ├── main.py
│   ├── db.py
│   ├── allocation.py
│   └── ilp.py
├── frontend/
│   ├── index.html
│   └── dispatcher.html
├── ml/
│   └── forecast.py
├── tests/
│   ├── test_allocation.py
│   └── compare.py
└── docs/
    ├── er_diagram.png
    └── data_dictionary.md
```

The `.env` file contains local database settings and must not be uploaded to GitHub. Some files, such as the ILP module, tests, and machine-learning script, will be added as development progresses.

## 7. Installation and Setup

1. Install Python 3.11 or newer.
2. Install PostgreSQL 16 and pgAdmin 4.
3. Install Visual Studio Code and Git.
4. Clone this repository to your computer.
5. Create a Python virtual environment.
6. Install the packages listed in `requirements.txt`.
7. Create a PostgreSQL database named `resqflow`.
8. Execute `database/schema.sql` and then `database/sample_data.sql` in that database.
9. Configure your local `.env` file with your database connection details.
10. Start the FastAPI backend from the `backend` folder.
11. Open the SOS page and dispatcher dashboard in your browser.
12. Run the automated tests and verify the project using fictional sample incidents.

Detailed instructions and required commands will be added as the project is implemented.

## 8. Limitations

- The project is an academic prototype and is not connected to real emergency services.
- The sample incident and resource data are fictional.
- The estimated travel times are calculated from straight-line distances and assumed speeds, not actual road routes.
- Machine-learning experiments use synthetic data and do not establish real-world prediction accuracy.
- Resource recommendations require dispatcher review and confirmation.

## 9. Team Members

| Name | Roll Number | 
|---|---|---|
| Nikita Kulkarni | 1262241563 | 
| Friend's Name | 1262241881 | 

Replace the example details with your actual team information and update responsibilities according to the work you both perform.

## 10. Academic Project Disclaimer

ResQFlow is intended for learning, demonstration, and academic evaluation. It must not be used to handle real emergency calls or replace official emergency response services.
