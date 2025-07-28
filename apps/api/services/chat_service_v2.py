"""
Refactored Unified Chat Service
Clean, modular implementation of the chat service with proper separation of concerns.
Now includes database persistence for conversations and messages.
"""

import uuid
from typing import Dict, List, Optional
from datetime import datetime

from models.chatModels import ChatRequest, ChatResponse
from models.conversation_models import ConversationCreate, MessageCreate
from database.conversation_repository import conversation_repository
from services.grc.knowledge_base import grc_knowledge
from services.grc.llm_manager import llm_manager
from services.grc.document_processor import document_processor
from services.grc.response_formatter import response_formatter
from utils.exceptions import LLMServiceError

class ChatService:
    """
    Unified chat service that handles both general GRC queries and document-based queries.
    Uses modular components for better maintainability and testing.
    Now includes database persistence.
    """
    
    def __init__(self):
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
            prompt = await self._build_general_prompt(request, conversation_id, user_id)
            
            # Generate response using LLM
            llm_manager.get_primary_llm()
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
            await self._save_conversation(conversation_id, request.message, formatted_response, user_id, request)
            
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
            await self._save_conversation(conversation_id, request.message, formatted_answer, user_id, request)
            
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
    
    async def _build_general_prompt(self, request: ChatRequest, conversation_id: str, user_id: str) -> str:
        """Build comprehensive prompt for general queries"""
        
        # Base system prompt
        system_prompt = self._create_system_prompt(request.framework_context)
        
        # Add relevant GRC knowledge context
        knowledge_context = self._get_relevant_knowledge_context(request.message, request.framework_context)
        
        # Build conversation history
        conversation_history = await self._get_conversation_history(conversation_id, user_id)
        
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
        
        better_prompt = """You are CompliAI, a world-class AI assistant specializing in Governance, Risk, and Compliance (GRC). Your persona is that of a seasoned, pragmatic GRC consultant who bridges the gap between deep technical requirements and strategic business objectives.
            ## 1. Persona & Guiding Principles

            * **Persona:** You are an expert consultant. You are precise, authoritative, and practical.
            * **Core Mission:** To provide clear, actionable, and prioritized guidance that helps organizations build, manage, and demonstrate compliance effectively.
            * **Guiding Principles:**
                * **Context First:** If a user's request lacks key details (e.g., company size, industry, maturity level, specific goals), ask targeted clarifying questions before providing a full response.
                * **Risk-Driven Prioritization:** Never just list requirements. Always frame your advice around a risk-based approach. Help users prioritize based on impact, cost, and effort.
                * **Business Enabler:** Frame compliance not as a cost center, but as a business enabler that builds trust and resilience.

            ## 2. Core Expertise & Scope

            ### 2.1. Frameworks & Regulations
            Your primary expertise covers, but is not limited to:
            * **Information Security:** ISO 27001, SOC 2 (Types 1 & 2), NIST Cybersecurity Framework (CSF), Cloud Security Alliance (CSA) STAR
            * **Data Privacy:** GDPR, HIPAA (Security & Privacy Rules), CCPA/CPRA
            * **Financial & Payments:** PCI DSS, Sarbanes-Oxley (SOX) IT General Controls (ITGC)
            * **Government & Public Sector:** FedRAMP

            ### 2.2. Core Capabilities
            * Regulatory compliance mapping and gap analysis
            * Risk assessment methodologies (e.g., NIST RMF, FAIR) and management strategies
            * Control design, testing, and evidence collection guidance
            * Policy and procedure development and lifecycle management
            * Audit planning, preparation, and execution support
            * Security framework implementation from scratch to certification
            * Stakeholder communication strategies (from board-level summaries to developer-specific tasks)

            ## 3. Interaction & Response Protocol

            ### 3.1. Standard Operating Procedure
            1.  **Acknowledge & Analyze:** Briefly acknowledge the user's request.
            2.  **Clarify (If Needed):** Ask targeted questions to understand the user's context (e.g., "To give you the most relevant advice, could you tell me if this is for a B2B SaaS startup or a large healthcare provider?").
            3.  **Provide Structured Response:** Deliver the detailed guidance as per the format requirements below.
            4.  **Summarize & Prioritize:** Conclude with a high-level summary and a list of prioritized next steps.

            ### 3.2. Output Structure & Content
            * Use `##` for main section headers and `###` for subsections.
            * Use `**bold**` for key terms, concepts, and framework names.
            * Use bullet points `•` for lists and numbered lists `1., 2., 3.` for sequential steps or priorities.
            * **Executive Summary (TL;DR):** Begin complex responses with a brief, high-level summary of the key takeaways and recommendations.
            * **Reference Specifics:** Always reference specific clauses, controls, or requirements (e.g., **ISO 27001 Annex A.12.1.2**, **SOC 2 CC6.1**, **PCI DSS Req. 3.4**).
            * **Explain the "Why":** Don't just state what to do. Briefly explain the rationale behind a control or requirement.
            * **Actionable Implementation Steps:** Provide clear, step-by-step guidance. Where possible, include estimated timelines (e.g., Phase 1: 0-30 days).
            * **Risks & Mitigations:** For each major area, highlight the **Key Risk** of non-compliance and the **Mitigation Strategy**.
            * **Practical Examples:** Use relevant examples (e.g., "For a SaaS company using AWS, an example of implementing this control would be...").
            * **Professional Disclaimer:** Conclude every response with the following disclaimer: _"This guidance is for informational purposes and is not a substitute for formal legal or certified audit advice. Always consult with qualified professionals for your specific situation."_
        """
        if framework_context:
            best_prompt += f"\n\nCurrent Focus: Prioritize {framework_context} requirements and controls in your response."
        
        return best_prompt
    
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
    
    async def _get_conversation_history(self, conversation_id: str, user_id: str) -> str:
        """Get formatted conversation history from database"""
        try:
            messages = await conversation_repository.get_conversation_messages(
                conversation_id, user_id, limit=6  # Last 6 messages (3 exchanges)
            )
            
            if not messages:
                return ""
            
            # Format the recent messages for context
            formatted_history = ""
            for i in range(0, len(messages), 2):  # Process in pairs (user + assistant)
                if i < len(messages):
                    user_msg = messages[i]
                    formatted_history += f"User: {user_msg.content}\n"
                
                if i + 1 < len(messages):
                    assistant_msg = messages[i + 1]
                    content = assistant_msg.content[:200] + "..." if len(assistant_msg.content) > 200 else assistant_msg.content
                    formatted_history += f"Assistant: {content}\n\n"
            
            return formatted_history
            
        except Exception as e:
            print(f"Failed to get conversation history: {e}")
            return ""
    
    async def _save_conversation(self, conversation_id: str, user_message: str, assistant_response: str, user_id: str, request: ChatRequest = None):
        """Save conversation exchange to database"""
        try:
            # Get or create conversation
            conversation = await conversation_repository.get_or_create_conversation(
                conversation_id, user_id
            )
            
            # Save user message
            user_message_data = MessageCreate(
                conversation_id=conversation_id,
                user_id=user_id,
                content=user_message,
                sender="user",
                framework_context=request.framework_context if request else None,
                mode=request.mode if request else None,
                document_id=request.document_id if request else None
            )
            await conversation_repository.add_message(user_message_data)
            
            # Save assistant response
            assistant_message_data = MessageCreate(
                conversation_id=conversation_id,
                user_id=user_id,
                content=assistant_response,
                sender="assistant",
                framework_context=request.framework_context if request else None,
                mode=request.mode if request else None,
                document_id=request.document_id if request else None
            )
            await conversation_repository.add_message(assistant_message_data)
            
        except Exception as e:
            # Log error but don't fail the response
            print(f"Failed to save conversation to database: {e}")

    async def get_conversation_history(self, conversation_id: str, user_id: str) -> List[Dict]:
        """Get conversation history for a specific conversation from database"""
        try:
            messages = await conversation_repository.get_conversation_messages(
                conversation_id, user_id
            )
            
            return [
                {
                    "id": str(message.id),
                    "content": message.content,
                    "sender": message.sender,
                    "timestamp": message.timestamp.isoformat(),
                    "confidence_score": message.confidence_score,
                    "sources": message.sources,
                    "clause_references": message.clause_references,
                    "control_ids": message.control_ids,
                    "framework_context": message.framework_context,
                    "mode": message.mode,
                    "document_id": message.document_id
                }
                for message in messages
            ]
        except Exception as e:
            print(f"Failed to get conversation history: {e}")
            return []

    async def list_conversations(self, user_id: str) -> List[Dict]:
        """List all conversations for a user"""
        try:
            conversations = await conversation_repository.list_conversations(user_id)
            
            return [
                {
                    "conversation_id": conv.conversation_id,
                    "title": conv.title or f"Chat {conv.created_at.strftime('%Y-%m-%d %H:%M')}",
                    "last_message": conv.last_message or "",
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat(),
                    "message_count": conv.message_count,
                    "framework_context": conv.framework_context
                }
                for conv in conversations
            ]
        except Exception as e:
            print(f"Failed to list conversations: {e}")
            return []

    async def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        """Delete a conversation"""
        try:
            return await conversation_repository.delete_conversation(conversation_id, user_id)
        except Exception as e:
            print(f"Failed to delete conversation: {e}")
            return False

# Global instance
chat_service = ChatService()
