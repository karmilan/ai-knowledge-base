import unittest
from pathlib import Path
from types import SimpleNamespace

from app import app as app_module


class UploadOnlyBehaviorTests(unittest.TestCase):
    def test_ask_returns_upload_prompt_before_any_document_is_loaded(self):
        response = app_module.ask_question(app_module.AskRequest(question="What is in the document?"))

        self.assertEqual(response["response"], "Please upload a PDF first so I can answer questions from it.")


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
