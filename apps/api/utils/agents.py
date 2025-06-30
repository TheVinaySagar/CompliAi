from dotenv import load_dotenv
import os
import json
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import PromptTemplate
from sqlalchemy.testing.provision import temp_table_keyword_args

load_dotenv(dotenv_path='.env')

class ModelProvider:
    """Factory class to create LLM instances"""

    @staticmethod
    def get_model(provider: str = "openai") -> BaseChatModel:
        if provider == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
            return ChatOpenAI(
                model="gpt-3.5-turbo",
                api_key=api_key,
                temperature=0
            )
        elif provider == "gemini":
            api_key = os.getenv("GOOGLE_API_KEY")
            return ChatGoogleGenerativeAI(
                model="gemini-pro",
                api_key=api_key,
                temperature=0
            )
        else:
            raise ValueError(f"Unsupported provider: {provider}")


# class Agent:
#     def __init__(self, ):
