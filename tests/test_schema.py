
import unittest
from pathlib import Path


SCHEMA_FILE = Path(__file__).resolve().parents[1] / "schema.sql"


class TestResQFlowSchema(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.schema = SCHEMA_FILE.read_text(encoding="utf-8").lower()

    def test_all_three_tables_exist(self):
        for table in (
            "emergency_reports",
            "ambulances",
            "assignments",
        ):
            with self.subTest(table=table):
                self.assertIn(f"create table {table}", self.schema)

    def test_primary_keys_exist(self):
        self.assertIn("report_id serial primary key", self.schema)
        self.assertIn("ambulance_id serial primary key", self.schema)
        self.assertIn("assignment_id serial primary key", self.schema)

    def test_assignment_foreign_keys_exist(self):
        self.assertIn(
            "report_id int references emergency_reports(report_id)",
            self.schema,
        )
        self.assertIn(
            "ambulance_id int references ambulances(ambulance_id)",
            self.schema,
        )

    def test_default_status_values_exist(self):
        self.assertIn("default 'pending'", self.schema)
        self.assertIn("default 'available'", self.schema)


if __name__ == "__main__":
    unittest.main()
