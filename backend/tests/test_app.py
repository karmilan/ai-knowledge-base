import unittest
from pathlib import Path

from app import app as app_module


class ResumePathTests(unittest.TestCase):
    def test_resume_path_is_resolved_from_the_app_directory(self):
        resume_path = app_module.get_resume_path()

        self.assertTrue(resume_path.exists(), msg=f"Expected resume file at {resume_path}")
        self.assertEqual(resume_path.parent.name, "data")
        self.assertEqual(resume_path.suffix.lower(), ".pdf")


if __name__ == "__main__":
    unittest.main()
