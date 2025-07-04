from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.schema import HumanMessage, SystemMessage
from langchain.memory import ConversationBufferMemory
import uuid
import re
from typing import Dict, List, Tuple
from config import settings
from models import ChatRequest, ChatResponse

class ChatService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key="AIzaSyCUe0COLfOG0wjpgEf1-lvGu0lQiBkT1TA",
            temperature=0.2,
            convert_system_message_to_human=True
        )
        
        # In-memory conversation storage (use database in production)
        self.conversations: Dict[str, List[Dict]] = {}
        
        # GRC Knowledge base (simplified for demo)
        self.grc_knowledge = {
            "ISO 27001": {
                "A.5.1.1": "Information security policies shall be defined and approved by management",
                "A.9.1.1": "An access control policy shall be established and reviewed",
                "A.12.1.1": "Documented operating procedures shall be prepared for all IT systems"
            },
            "SOC 2": {
                "CC1.1": "The entity demonstrates a commitment to integrity and ethical values",
                "CC2.1": "Management communicates information internally to support control environment",
                "CC3.1": "The entity specifies objectives clearly to enable risk identification"
            },
            "NIST CSF": {
                "ID.AM-1": "Physical devices and systems within the organization are inventoried",
                "PR.AC-1": "Identities and credentials are issued, managed, and revoked",
                "DE.AE-1": "A baseline of network operations and expected data flows is established"
            }
        }

    async def process_chat(self, request: ChatRequest, current_user: dict) -> ChatResponse:
        """Process chat request and return GRC-focused response."""
        
        # Generate conversation ID if new
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Get conversation history
        conversation_history = self.conversations.get(conversation_id, [])
        
        # Create system prompt for GRC context
        system_prompt = self._create_system_prompt(request.framework_context)
        
        # Build conversation context (Gemini works better with combined prompt)
        full_prompt = system_prompt + "\n\n"
        
        # Add conversation history
        for msg in conversation_history[-5:]:  # Last 5 messages for context
            full_prompt += f"Previous User: {msg['user']}\n"
            full_prompt += f"Previous Assistant: {msg['assistant']}\n\n"
        
        # Add current message
        full_prompt += f"Current User Question: {request.message}\n\nAssistant Response:"
        
        # Get response from Gemini
        response = await self.llm.agenerate([[HumanMessage(content=full_prompt)]])
        answer = response.generations[0][0].text
        
        # Extract references and control IDs
        clause_refs, control_ids = self._extract_references(answer, request.framework_context)
        
        # Calculate confidence score (simplified)
        confidence_score = self._calculate_confidence_score(answer, request.message)
        
        # Generate mock sources
        sources = self._generate_sources(clause_refs, control_ids)
        
        # Save conversation
        self._save_conversation(conversation_id, request.message, answer)
        
        return ChatResponse(
            response=answer,
            conversation_id=conversation_id,
            clause_references=clause_refs,
            control_ids=control_ids,
            confidence_score=confidence_score,
            sources=sources,
            framework_context=request.framework_context
        )
    
    def _create_system_prompt(self, framework_context: str = None) -> str:
        """Create system prompt for GRC context."""
        base_prompt = """
        You are CompliAI, an expert in Governance, Risk, and Compliance (GRC).
        
        Your expertise includes:
        - ISO 27001 Information Security Management
        - SOC 2 Service Organization Controls
        - NIST Cybersecurity Framework
        - GDPR Data Protection
        - HIPAA Healthcare Privacy
        - Risk assessment and management
        - Audit planning and execution
        - Policy development and implementation
        
        When answering questions:
        1. Provide accurate, specific compliance guidance
        2. Reference relevant clauses, controls, or requirements
        3. Include control IDs when applicable
        4. Explain implementation steps when relevant
        5. Highlight key risks and considerations
        
        Be concise but comprehensive in your responses.
        """
        
        if framework_context:
            base_prompt += f"\n\nFocus your response on {framework_context} requirements and controls."
        
        return base_prompt
    
    def _extract_references(self, response: str, framework: str = None) -> Tuple[List[str], List[str]]:
        """Extract clause references and control IDs from response."""
        
        clause_patterns = [
            r'ISO 27001:?[\s]*[A-Z]?\.?\d+\.?\d*\.?\d*',
            r'SOC 2[\s]*[A-Z]{2}\d+\.?\d*',
            r'NIST CSF[\s]*[A-Z]{2}\.[A-Z]{2}-\d+',
            r'Section[\s]*\d+\.?\d*\.?\d*',
            r'Clause[\s]*[A-Z]?\.?\d+\.?\d*\.?\d*',
            r'Control[\s]*[A-Z]{1,4}[-.]?\d+\.?\d*'
        ]
        
        control_patterns = [
            r'[A-Z]{1,4}[-.]?\d+\.?\d*\.?\d*',
            r'[A-Z]{2}\.[A-Z]{2}-\d+',
            r'CC\d+\.?\d*',
            r'A\.\d+\.?\d*\.?\d*'
        ]
        
        clause_refs = []
        for pattern in clause_patterns:
            matches = re.findall(pattern, response, re.IGNORECASE)
            clause_refs.extend(matches)
        
        control_ids = []
        for pattern in control_patterns:
            matches = re.findall(pattern, response, re.IGNORECASE)
            control_ids.extend(matches)
        
        # Remove duplicates and clean up
        clause_refs = list(set([ref.strip() for ref in clause_refs]))
        control_ids = list(set([ctrl.strip() for ctrl in control_ids]))
        
        return clause_refs, control_ids
    
    def _calculate_confidence_score(self, response: str, question: str) -> float:
        """Calculate confidence score based on response quality."""
        
        # Simple heuristic - can be improved with ML models
        score = 0.5  # Base score
        
        # Increase score for specific references
        if any(keyword in response.lower() for keyword in ['iso', 'soc', 'nist', 'control', 'clause']):
            score += 0.2
        
        # Increase score for detailed responses
        if len(response) > 200:
            score += 0.1
        
        # Increase score for structured responses
        if any(marker in response for marker in ['1.', '2.', '•', '-']):
            score += 0.1
        
        # Increase score for implementation guidance
        if any(word in response.lower() for word in ['implement', 'ensure', 'establish', 'maintain']):
            score += 0.1
        
        return min(score, 1.0)
    
    def _generate_sources(self, clause_refs: List[str], control_ids: List[str]) -> List[Dict]:
        """Generate mock sources for references."""
        sources = []
        
        for ref in clause_refs[:3]:  # Limit to 3 sources
            sources.append({
                "document": f"ISO 27001 Standard - {ref}",
                "page": 1,
                "relevance_score": 0.9,
                "excerpt": f"This clause {ref} covers the requirements for..."
            })
        
        for ctrl in control_ids[:2]:  # Limit to 2 control sources
            sources.append({
                "document": f"Control Framework - {ctrl}",
                "page": 1,
                "relevance_score": 0.85,
                "excerpt": f"Control {ctrl} requires implementation of..."
            })
        
        return sources
    
    def _save_conversation(self, conversation_id: str, user_message: str, assistant_response: str):
        """Save conversation to memory (use database in production)."""
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        
        self.conversations[conversation_id].append({
            "user": user_message,
            "assistant": assistant_response,
            "timestamp": "2024-01-01T00:00:00Z"
        })
