# ResQFlow Project Glossary

| Term | Meaning in ResQFlow |
|---|---|
| Emergency Report | A record containing the emergency type, location, severity, reporting time, and status. |
| Ambulance | A resource recorded with a name, location, and availability status. |
| Assignment | A database record linking an emergency report to an ambulance. |
| PostgreSQL | The relational database management system used to store project data. |
| FastAPI | The Python framework used to provide the project's API endpoints. |
| API | An interface that allows the frontend or another client to communicate with the backend. |
| Endpoint | A specific API path, such as `/emergencies` or `/ambulances`. |
| Primary Key (PK) | A column that uniquely identifies a row in a database table. |
| Foreign Key (FK) | A column that references a key in another table to connect related records. |
| SQL | Structured Query Language, used to retrieve and manage relational database data. |
| JOIN | An SQL operation that combines related data from multiple tables. |
| GROUP BY | An SQL clause used to group rows for summary calculations. |
| Machine Learning | A method that learns patterns from data to make predictions. |
| Random Forest Regressor | The machine-learning model identified by the project API for estimating emergency demand. |
| Virtual Environment | An isolated Python environment for a project's dependencies. |
| Schema | The database structure, including tables, columns, keys, and constraints. |
| Response-Time Estimate | A demonstration estimate returned by ResQFlow; it is not a real travel-time calculation. |

## Project Limitation

ResQFlow is an academic prototype. Its emergency-demand prediction uses simulated training data, and its response-time estimate is illustrative rather than a real-world forecast.
