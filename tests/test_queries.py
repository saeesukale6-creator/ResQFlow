
import unittest
from pathlib import Path

QUERIES_FILE = Path(__file__).resolve().parents[1] / "queries.sql"


class TestResQFlowQueries(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.queries = QUERIES_FILE.read_text(
            encoding="utf-8"
        ).lower()

    def test_queries_file_is_not_empty(self):
        self.assertTrue(self.queries.strip())

    def test_select_queries_exist(self):
        self.assertIn("select", self.queries)

    def test_join_query_exists(self):
        self.assertIn("join", self.queries)

    def test_group_by_query_exists(self):
        self.assertIn("group by", self.queries)

    def test_left_join_query_exists(self):
        self.assertIn("left join", self.queries)


if __name__ == "__main__":
    unittest.main()
