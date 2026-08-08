from abc import ABC, abstractmethod
from typing import TypeVar, Type, Any
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)

class BaseLLM(ABC):
    @abstractmethod
    def generate_structured(self, prompt: str, schema: Type[T], temperature: float = 0.7) -> T:
        """
        Generate a structured output conforming to the provided Pydantic schema.
        """
        pass
    
    @abstractmethod
    def generate_text(self, prompt: str, temperature: float = 0.7) -> str:
        """
        Generate plain text output.
        """
        pass
