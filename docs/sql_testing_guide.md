# ResQFlow SQL Testing Guide

## Objective

To verify that the SQL queries used in ResQFlow correctly retrieve and summarize emergency reports, ambulance details, and assignment records.

## Prerequisites

- PostgreSQL is installed and running.
- The `resqflow` database exists.
- The tables in `schema.sql` have been created.
- Sample data is available for testing.

## Test Cases

| Test | Query purpose | Expected result |
|---|---|---|
| 1 | Display all emergency reports | Shows reports ordered by reporting time, newest first |
| 2 | Display pending emergencies | Shows only reports with status `Pending` |
| 3 | Display available ambulances | Shows only ambulances with status `Available` |
| 4 | Join reports and assignments | Shows assignment details with the related emergency and ambulance |
| 5 | Count emergencies by severity | Shows the number of reports in each severity group |
| 6 | Count ambulances by status | Shows the number of ambulances in each status group |
| 7 | Count emergencies by status | Shows the number of reports in each status group |
| 8 | Display response estimates | Shows assignment records and their estimated response times |
| 9 | Find emergencies without assignments | Shows reports that have no matching assignment |
| 10 | Find repeated emergency types | Shows emergency types reported more than once |

## How to Run the Tests

1. Open pgAdmin and connect to PostgreSQL.
2. Open the Query Tool for the `resqflow` database.
3. Open or copy the queries from `queries.sql`.
4. Execute each query separately.
5. Compare the returned rows with the expected result described above.
6. Record the actual result and whether the test passed.

## Important Notes

- The expected results depend on the data currently stored in the database.
- An empty result does not always mean a query is incorrect. For example, Query 9 returns no rows when every emergency has an assignment.
- Query 10 returns only emergency types that occur more than once.
- Estimated response time is a demonstration estimate, not a real-world travel-time calculation.

## Conclusion

This guide provides a structured way to test the ten SQL queries used in ResQFlow. Running the queries against the project database helps verify data retrieval, filtering, grouping, and table relationships.
