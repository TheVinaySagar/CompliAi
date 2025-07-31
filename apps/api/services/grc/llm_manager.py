"""
LLM Service Manager
Handles different LLM providers and configurations.
"""

import os
from typing import Optional, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain.schema import HumanMessage, SystemMessage

from config import settings
from utils.exceptions import LLMServiceError

class LLMManager:
    """Manages different LLM providers and configurations"""
    
    def __init__(self):
        self.llm_configs = {
            'google': {
                'model': "gemini-2.5-pro",
                'api_key': settings.google_api_key,
                'temperature': 0.2
            },
            'openai': {
                'model': settings.openai_model,
                'api_key': settings.openai_api_key,
                'temperature': 0.1
            },
            'ollama': {
                'model': settings.ollama_model,
                'base_url': settings.ollama_base_url
            }
        }
        
        self._llm_instances = {}
        self._embedding_instances = {}
    
    def get_primary_llm(self):
        """Get primary LLM instance for general chat"""
        service = settings.llm_service.lower()
        
        if service not in self._llm_instances:
            self._llm_instances[service] = self._create_llm_instance(service)
        
        return self._llm_instances[service]
    
    def get_rag_llm(self):
        """Get LLM instance for RAG operations"""
        service = settings.llm_service.lower()
        
        if f"{service}_rag" not in self._llm_instances:
            self._llm_instances[f"{service}_rag"] = self._create_llm_instance(service)
        
        return self._llm_instances[f"{service}_rag"]
    
    def get_embedding_model(self):
        """Get embedding model instance"""
        choice = settings.embedding_choice.lower()
        
        if choice not in self._embedding_instances:
            self._embedding_instances[choice] = self._create_embedding_instance(choice)
        
        return self._embedding_instances[choice]
    
    def _create_llm_instance(self, service: str):
        """Create LLM instance based on service type"""
        try:
            # if service == 'google':
            return ChatGoogleGenerativeAI(
                model=self.llm_configs['google']['model'],
                google_api_key=self.llm_configs['google']['api_key'],
                temperature=self.llm_configs['google']['temperature']
            )
            # elif service == 'openai':
            #     if not self.llm_configs['openai']['api_key']:
            #         raise LLMServiceError("OpenAI API key not configured")
                
            #     return ChatOpenAI(
            #         model=self.llm_configs['openai']['model'],
            #         api_key=self.llm_configs['openai']['api_key'],
            #         temperature=self.llm_configs['openai']['temperature']
            #     )
            # elif service == 'ollama':

            # return ChatOllama(
            #     model=self.llm_configs['ollama']['model'],
            #     base_url=self.llm_configs['ollama']['base_url']
            # )
            # else:
                # raise LLMServiceError(f"Unsupported LLM service: {service}")
        
        except Exception as e:
            raise LLMServiceError(f"Failed to create LLM instance: {str(e)}")
    
    def _create_embedding_instance(self, choice: str):
        """Create embedding model instance"""
        try:
            if choice == 'google':
                return GoogleGenerativeAIEmbeddings(
                    model=settings.gemini_embedding,
                    google_api_key=self.llm_configs['google']['api_key']
                )
            elif choice == 'openai':
                if not self.llm_configs['openai']['api_key']:
                    raise LLMServiceError("OpenAI API key not configured")
                
                return OpenAIEmbeddings(
                    model=settings.openai_embedding,
                    api_key=self.llm_configs['openai']['api_key']
                )
            elif choice == 'ollama':
                return OllamaEmbeddings(
                    model=settings.ollama_embedding,
                    base_url=self.llm_configs['ollama']['base_url']
                )
            else:
                raise LLMServiceError(f"Unsupported embedding service: {choice}")
        
        except Exception as e:
            raise LLMServiceError(f"Failed to create embedding instance: {str(e)}")
    
    async def generate_response(self, prompt: str, service: Optional[str] = None) -> str:
        """Generate response using specified or default LLM"""
        try:
            llm = self.get_primary_llm() if not service else self._create_llm_instance(service)
            response = await llm.agenerate([[HumanMessage(content=prompt)]])
            return response.generations[0][0].text
        
        except Exception as e:
            raise LLMServiceError(f"Failed to generate response: {str(e)}")
    
    def get_available_services(self) -> Dict[str, Dict[str, Any]]:
        """Get list of available LLM services and their status"""
        services = {}
        
        for service, config in self.llm_configs.items():
            try:
                # Try to create instance to check availability
                self._create_llm_instance(service)
                services[service] = {
                    "available": True,
                    "model": config.get('model'),
                    "status": "Ready"
                }
            except Exception as e:
                services[service] = {
                    "available": False,
                    "model": config.get('model'),
                    "status": f"Error: {str(e)}"
                }
        
        return services

# Global instance
llm_manager = LLMManager()
