import unittest
from pathlib import Path
from types import SimpleNamespace

from app import app as app_module


class ResumePathTests(unittest.TestCase):
    def test_resume_path_is_resolved_from_the_app_directory(self):
        resume_path = app_module.get_resume_path()

        self.assertTrue(resume_path.exists(), msg=f"Expected resume file at {resume_path}")
        self.assertEqual(resume_path.parent.name, "data")
        self.assertEqual(resume_path.suffix.lower(), ".pdf")


class ResponseFormattingTests(unittest.TestCase):
    def test_extract_message_text_returns_last_assistant_message(self):
        response = {
            "messages": [
                SimpleNamespace(content="Context:\nThis is the retrieved context"),
                SimpleNamespace(content="The candidate has a degree in software engineering."),
            ]
        }

        self.assertEqual(
            app_module.extract_message_text(response),
            "The candidate has a degree in software engineering.",
        )


if __name__ == "__main__":
    unittest.main()
