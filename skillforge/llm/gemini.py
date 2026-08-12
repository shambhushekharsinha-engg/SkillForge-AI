from typing import Type, TypeVar, Any
from pydantic import BaseModel
from google import genai
from google.genai import types

from .base import BaseLLM
from ..config import config

T = TypeVar('T', bound=BaseModel)

class GeminiLLM(BaseLLM):
    def __init__(self, api_key: str = None, model_name: str = None):
        api_key = api_key or config.GEMINI_API_KEY
        self.model_name = model_name or config.DEFAULT_MODEL
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set.")
        self.is_mock = api_key == "dummy"
        if not self.is_mock:
            self.client = genai.Client(api_key=api_key)

    def generate_structured(self, prompt: str, schema: Type[T], temperature: float = 0.7) -> T:
        if self.is_mock:
            import json
            # Generate a very basic mock dictionary that loosely fits any Pydantic model
            # by instantiating it with default/mock values
            return _generate_mock_for_schema(schema)

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=schema,
                    temperature=temperature,
                ),
            )
            return schema.model_validate_json(response.text)
        except Exception as e:
            print(f"Gemini API Error (fallback to mock): {e}")
            import json
            return _generate_mock_for_schema(schema)

    def generate_text(self, prompt: str, temperature: float = 0.7) -> str:
        if self.is_mock:
            return "This is a mocked LLM response since GEMINI_API_KEY is 'dummy'."
            
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=temperature,
                ),
            )
            return response.text
        except Exception as e:
            print(f"Gemini API Error (fallback to mock): {e}")
            return "This is a mocked LLM response due to Gemini API rate limits/errors."

def _generate_mock_for_schema(schema: Type[T]) -> T:
    # A generic mock data builder for Pydantic models
    mock_data = {}
    for field_name, field_info in schema.model_fields.items():
        type_str = str(field_info.annotation).lower()
        if 'str' in type_str: mock_data[field_name] = f"Mocked {field_name}"
        elif 'int' in type_str: mock_data[field_name] = 42
        elif 'float' in type_str: mock_data[field_name] = 0.95
        elif 'bool' in type_str: mock_data[field_name] = True
        elif 'list' in type_str: mock_data[field_name] = []
        else: mock_data[field_name] = None
    return schema(**mock_data)
