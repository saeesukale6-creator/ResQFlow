# ResQFlow Data Dictionary

This document describes the current six-table ResQFlow PostgreSQL schema.
The diagram and definitions should be updated if `database/schema.sql` changes.

## 1. `incident_types`
Stores the categories of emergencies.

| Column | Meaning | Rule |
|---|---|---|
| `incident_type_id` | Unique ID for each incident type | Primary key, auto-generated |
| `type_name` | Name such as Medical Emergency, Fire, Road Accident, Rescue | Unique, required |

## 2. `resource_types`
Stores categories of response resources.

| Column | Meaning | Rule |
|---|---|---|
| `resource_type_id` | Unique ID for each resource type | Primary key, auto-generated |
| `type_name` | Name such as Ambulance, Fire Engine, Police, Rescue Team | Unique, required |

## 3. `incidents`
Stores reported emergency incidents.

| Column | Meaning | Rule |
|---|---|---|
| `incident_id` | Unique incident ID | Primary key, auto-generated |
| `incident_type_id` | Category of incident | Foreign key to `incident_types` |
| `description` | Text describing the incident | Required |
| `severity` | Severity score from 1 to 5 | Check constraint |
| `latitude` | Incident latitude | Optional coordinate |
| `longitude` | Incident longitude | Optional coordinate |
| `status` | Current incident status | Defaults to `OPEN` |
| `created_at` | Time the row was created | Defaults to current timestamp |

## 4. `resources`
Stores response units that may be assigned to incidents.

| Column | Meaning | Rule |
|---|---|---|
| `resource_id` | Unique resource ID | Primary key, auto-generated |
| `resource_type_id` | Category of resource | Foreign key to `resource_types` |
| `resource_code` | Human-readable code such as `AMB-001` | Unique, required |
| `latitude` | Resource latitude | Optional coordinate |
| `longitude` | Resource longitude | Optional coordinate |
| `status` | Availability or current status | Defaults to `AVAILABLE` |

## 5. `incident_resource_needs`
Stores how many units of each resource type an incident needs.

| Column | Meaning | Rule |
|---|---|---|
| `need_id` | Unique need record ID | Primary key, auto-generated |
| `incident_id` | Incident requiring resources | Foreign key to `incidents`, cascade delete |
| `resource_type_id` | Type of resource needed | Foreign key to `resource_types` |
| `required_count` | Number of units needed | Must be zero or greater |
| `(incident_id, resource_type_id)` | Prevents duplicate need rows for the same incident and type | Unique combination |

## 6. `resource_assignments`
Records which resources are assigned to which incidents.

| Column | Meaning | Rule |
|---|---|---|
| `assignment_id` | Unique assignment record ID | Primary key, auto-generated |
| `incident_id` | Incident receiving a resource | Foreign key to `incidents` |
| `resource_id` | Resource being assigned | Foreign key to `resources` |
| `assigned_at` | Time of assignment | Defaults to current timestamp |
| `status` | Assignment status | Defaults to `ASSIGNED` |
| `(resource_id, incident_id)` | Prevents duplicate assignment of the same resource to the same incident | Unique combination |

## Relationships
- One incident type can be associated with many incidents.
- One resource type can be associated with many resources.
- One incident can have multiple resource-need records.
- One resource type can appear in many resource-need records.
- Incidents and resources can be linked through `resource_assignments`; each row records one resource assigned to one incident.

## Notes and limitations
- Sample locations and incidents are fictional and are for academic demonstration only.
- The current schema is a simplified version. Confirm that this document matches the actual `database/schema.sql` before submission.
- This prototype is not a real emergency dispatch service.
