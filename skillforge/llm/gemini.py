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
        self.client = genai.Client(api_key=api_key)

    def generate_structured(self, prompt: str, schema: Type[T], temperature: float = 0.7) -> T:
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema,
                temperature=temperature,
            ),
        )
        # Parse the JSON response into the Pydantic model
        return schema.model_validate_json(response.text)

    def generate_text(self, prompt: str, temperature: float = 0.7) -> str:
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=temperature,
            ),
        )
        return response.text
