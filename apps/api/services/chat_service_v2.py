"""
Refactored Unified Chat Service
Clean, modular implementation of the chat service with proper separation of concerns.
"""

import uuid
from typing import Dict, List, Optional
from datetime import datetime

from models.chatModels import ChatRequest, ChatResponse
from services.grc.knowledge_base import grc_knowledge
from services.grc.llm_manager import llm_manager
from services.grc.document_processor import document_processor
from services.grc.response_formatter import response_formatter
from utils.exceptions import LLMServiceError

class ChatService:
    """
    Unified chat service that handles both general GRC queries and document-based queries.
    Uses modular components for better maintainability and testing.
    """
    
    def __init__(self):
        self.conversations: Dict[str, List[Dict]] = {}
        self.max_conversation_history = 10
    
    async def process_chat(self, request: ChatRequest, current_user: dict) -> ChatResponse:
        """
        Main entry point for processing chat requests.
        Determines the appropriate processing method based on the request.
        """
        conversation_id = request.conversation_id or str(uuid.uuid4())
        user_id = current_user.get('user_id', 'anonymous')
        
        try:
            # Determine query type and route accordingly
            if self._is_document_query(request) and request.document_id:
                response = await self._process_document_query(request, conversation_id, user_id)
            else:
                response = await self._process_general_query(request, conversation_id, user_id)
            
            return response
            
        except Exception as e:
            return ChatResponse(
                response=f"Sorry, I encountered an error while processing your request: {str(e)}",
                conversation_id=conversation_id,
                error=str(e),
                confidence_score=0.0
            )
    
    def _is_document_query(self, request: ChatRequest) -> bool:
        """Determine if the query is document-specific"""
        document_indicators = [
            "in this document", "from the document", "based on the uploaded",
            "according to the file", "in the policy", "from the manual",
            "in the uploaded", "document says", "policy states"
        ]
        
        has_document_id = bool(request.document_id)
        has_document_language = any(indicator in request.message.lower() for indicator in document_indicators)
        is_explicit_document_mode = request.mode == "document"
        
        return has_document_id or has_document_language or is_explicit_document_mode
    
    async def _process_general_query(self, request: ChatRequest, conversation_id: str, user_id: str) -> ChatResponse:
        """Process general GRC queries using built-in knowledge base"""
        try:
            # Build enhanced prompt with conversation history
            prompt = self._build_general_prompt(request, conversation_id)
            
            # Generate response using LLM
            llm = llm_manager.get_primary_llm()
            raw_response = await llm_manager.generate_response(prompt)
            
            # Format and enhance response
            formatted_response = response_formatter.format_response(raw_response)
            
            # Extract references and calculate metadata
            clause_refs, control_ids = response_formatter.extract_references(
                formatted_response, request.framework_context
            )
            confidence_score = response_formatter.calculate_confidence_score(
                formatted_response, request.message
            )
            sources = response_formatter.generate_sources(clause_refs, control_ids)
            
            # Save conversation
            self._save_conversation(conversation_id, request.message, formatted_response, user_id)
            
            return ChatResponse(
                response=formatted_response,
                conversation_id=conversation_id,
                clause_references=clause_refs,
                control_ids=control_ids,
                confidence_score=confidence_score,
                sources=sources,
                framework_context=request.framework_context,
                mode="general"
            )
            
        except Exception as e:
            raise LLMServiceError(f"Error processing general query: {str(e)}")
    
    async def _process_document_query(self, request: ChatRequest, conversation_id: str, user_id: str) -> ChatResponse:
        """Process document-based queries using RAG"""
        try:
            # Query the document using RAG
            rag_response = await document_processor.query_document(
                request.document_id, request.message
            )
            
            answer = rag_response.get('answer', 'No answer generated')
            source_docs = rag_response.get('source_documents', [])
            
            # Format response
            formatted_answer = response_formatter.format_response(answer)
            
            # Generate document-based sources
            sources = response_formatter.generate_document_sources(source_docs, request.document_id)
            
            # Extract references and calculate confidence
            clause_refs, control_ids = response_formatter.extract_references(formatted_answer)
            confidence_score = response_formatter.calculate_confidence_score(formatted_answer, request.message)
            
            # Save conversation
            self._save_conversation(conversation_id, request.message, formatted_answer, user_id)
            
            return ChatResponse(
                response=formatted_answer,
                conversation_id=conversation_id,
                clause_references=clause_refs,
                control_ids=control_ids,
                confidence_score=confidence_score,
                sources=sources,
                framework_context=request.framework_context,
                mode="document",
                document_id=request.document_id
            )
            
        except Exception as e:
            raise LLMServiceError(f"Error processing document query: {str(e)}")
    
    def _build_general_prompt(self, request: ChatRequest, conversation_id: str) -> str:
        """Build comprehensive prompt for general queries"""
        
        # Base system prompt
        system_prompt = self._create_system_prompt(request.framework_context)
        
        # Add relevant GRC knowledge context
        knowledge_context = self._get_relevant_knowledge_context(request.message, request.framework_context)
        
        # Build conversation history
        conversation_history = self._get_conversation_history(conversation_id)
        
        # Construct full prompt
        full_prompt = f"{system_prompt}\n\n"
        
        if knowledge_context:
            full_prompt += f"Relevant GRC Knowledge:\n{knowledge_context}\n\n"
        
        if conversation_history:
            full_prompt += f"Conversation History:\n{conversation_history}\n\n"
        
        full_prompt += f"Current User Question: {request.message}\n\nResponse:"
        
        return full_prompt
    
    def _create_system_prompt(self, framework_context: str = None) -> str:
        """Create comprehensive system prompt"""
        
        base_prompt = """You are CompliAI, an expert AI assistant specializing in Governance, Risk, and Compliance (GRC).

Your expertise spans multiple compliance frameworks:
• ISO 27001 - Information Security Management Systems
• SOC 2 - Service Organization Controls  
• NIST Cybersecurity Framework - Infrastructure Protection
• PCI DSS - Payment Card Industry Data Security
• GDPR - General Data Protection Regulation
• HIPAA - Healthcare Privacy and Security

Core Capabilities:
• Risk assessment and management strategies
• Audit planning and execution guidance
• Policy development and implementation
• Control design and testing methodologies
• Regulatory compliance mapping
• Security framework implementation

Response Guidelines:
1. Provide accurate, actionable compliance guidance
2. Reference specific clauses, controls, or requirements when applicable
3. Include control IDs and framework mappings
4. Explain implementation steps clearly
5. Highlight key risks and mitigation strategies
6. Use professional formatting with clear structure

Format Requirements:
• Use "##" for main section headers
• Use "###" for subsection headers  
• Use "•" for bullet points in lists
• Use **bold** for important terms and concepts
• Use numbered lists (1., 2., 3.) for sequential steps
• Include practical examples when relevant
• Add implementation timelines when appropriate

Always maintain accuracy and provide practical, implementable advice."""

        if framework_context:
            base_prompt += f"\n\nCurrent Focus: Prioritize {framework_context} requirements and controls in your response."
        
        return base_prompt
    
    def _get_relevant_knowledge_context(self, query: str, framework: str = None) -> str:
        """Get relevant context from GRC knowledge base"""
        
        # Search for relevant controls
        relevant_controls = grc_knowledge.search_controls(query, framework)
        
        if not relevant_controls:
            return ""
        
        context = "Relevant Controls and Requirements:\n"
        for control in relevant_controls[:3]:  # Limit to top 3 matches
            context += f"• {control['framework']} {control['control_id']}: {control['title']}\n"
            context += f"  Description: {control['description']}\n"
            
            # Get detailed implementation guidance
            details = grc_knowledge.get_control_details(control['framework'], control['control_id'])
            if details.get('implementation_guidance'):
                guidance = details['implementation_guidance'][:2]  # First 2 items
                context += f"  Implementation: {', '.join(guidance)}\n"
            
            context += "\n"
        
        return context
    
    def _get_conversation_history(self, conversation_id: str) -> str:
        """Get formatted conversation history"""
        
        if conversation_id not in self.conversations:
            return ""
        
        history = self.conversations[conversation_id]
        if not history:
            return ""
        
        # Get last few exchanges for context
        recent_history = history[-3:]  # Last 3 exchanges
        
        formatted_history = ""
        for exchange in recent_history:
            formatted_history += f"User: {exchange['user']}\n"
            formatted_history += f"Assistant: {exchange['assistant'][:200]}...\n\n"
        
        return formatted_history
    
    def _save_conversation(self, conversation_id: str, user_message: str, assistant_response: str, user_id: str):
        """Save conversation exchange to memory"""
        
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        
        # Add new exchange
        self.conversations[conversation_id].append({
            "user": user_message,
            "assistant": assistant_response,
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "response_length": len(assistant_response)
        })
        
        # Trim conversation history if too long
        if len(self.conversations[conversation_id]) > self.max_conversation_history:
            self.conversations[conversation_id] = self.conversations[conversation_id][-self.max_conversation_history:]
    
    def get_conversation_history(self, conversation_id: str, user_id: str = None) -> List[Dict]:
        """Get conversation history for a specific conversation"""
        
        if conversation_id not in self.conversations:
            return []
        
        history = self.conversations[conversation_id]
        
        # Filter by user_id if provided (for security)
        if user_id:
            history = [exchange for exchange in history if exchange.get('user_id') == user_id]
        
        return history
    
    def delete_conversation(self, conversation_id: str, user_id: str = None) -> bool:
        """Delete a conversation"""
        
        if conversation_id not in self.conversations:
            return False
        
        # Additional security check - ensure user owns the conversation
        if user_id:
            history = self.conversations[conversation_id]
            if history and history[0].get('user_id') != user_id:
                return False
        
        del self.conversations[conversation_id]
        return True
    
    def list_conversations(self, user_id: str) -> List[Dict]:
        """List all conversations for a user"""
        
        user_conversations = []
        
        for conv_id, history in self.conversations.items():
            if history and history[0].get('user_id') == user_id:
                last_exchange = history[-1]
                user_conversations.append({
                    "conversation_id": conv_id,
                    "last_message": last_exchange.get('user', '')[:100],
                    "last_response": last_exchange.get('assistant', '')[:100],
                    "timestamp": last_exchange.get('timestamp'),
                    "message_count": len(history)
                })
        
        # Sort by timestamp (most recent first)
        user_conversations.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return user_conversations

# Global instance
chat_service = ChatService()
