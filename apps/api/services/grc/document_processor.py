"""
Document Processing Service
Handles document upload, processing, and RAG operations.
"""

import os
import uuid
import shutil
from typing import List, Dict, Optional, Tuple
from datetime import datetime

from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

from services.grc.llm_manager import llm_manager
from utils.exceptions import DocumentNotFoundError, LLMServiceError

class DocumentProcessor:
    """Handles document processing and RAG operations"""
    
    def __init__(self):
        self.vector_stores: Dict[str, Chroma] = {}
        self.qa_chains: Dict[str, RetrievalQA] = {}
        self.document_metadata: Dict[str, Dict] = {}
    
    async def upload_and_process_document(
        self, 
        file_path: str, 
        document_name: str = None,
        user_id: str = None
    ) -> Dict:
        """Upload and process a document for RAG queries"""
        try:
            document_id = document_name or str(uuid.uuid4())
            
            # Load document based on file type
            documents = self._load_document_by_type(file_path)
            
            # Split into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
            )
            chunks = text_splitter.split_documents(documents)
            
            # Create embeddings
            embeddings = llm_manager.get_embedding_model()
            
            # Create vector store directory
            db_path = f"./vector_stores/{document_id}"
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            
            # Remove existing vector store if it exists
            if os.path.exists(db_path):
                shutil.rmtree(db_path)
            
            # Create vector store
            vector_store = Chroma.from_documents(
                chunks,
                embeddings,
                persist_directory=db_path
            )
            
            # Store references
            self.vector_stores[document_id] = vector_store
            
            # Create QA chain
            qa_chain = self._create_qa_chain(vector_store)
            self.qa_chains[document_id] = qa_chain
            
            # Store document metadata
            self.document_metadata[document_id] = {
                "name": document_name or os.path.basename(file_path),
                "file_path": file_path,
                "user_id": user_id,
                "uploaded_at": datetime.utcnow(),
                "chunks_count": len(chunks),
                "status": "processed"
            }
            
            # Identify controls in document
            controls = await self._identify_controls_in_document(document_id, qa_chain)
            
            return {
                "document_id": document_id,
                "status": "success",
                "chunks_created": len(chunks),
                "controls_identified": len(controls),
                "message": f"Document {document_name or 'uploaded'} processed successfully"
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error processing document: {str(e)}"
            }
    
    def _load_document_by_type(self, file_path: str):
        """Load document based on file extension"""
        if not os.path.exists(file_path):
            raise DocumentNotFoundError(f"File not found: {file_path}")
        
        file_extension = os.path.splitext(file_path)[1].lower()
        
        try:
            if file_extension == '.pdf':
                loader = PyPDFLoader(file_path=file_path)
            elif file_extension == '.docx':
                loader = Docx2txtLoader(file_path)
            elif file_extension == '.txt':
                loader = TextLoader(file_path, encoding='utf-8')
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
            
            return loader.load()
        
        except Exception as e:
            raise DocumentNotFoundError(f"Failed to load document: {str(e)}")
    
    def _create_qa_chain(self, vector_store: Chroma):
        """Create QA chain for document queries"""
        try:
            rag_llm = llm_manager.get_rag_llm()
            prompt = self._create_rag_prompt_template()
            retriever = vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={'k': 3}
            )
            
            qa_chain = RetrievalQA.from_chain_type(
                llm=rag_llm,
                chain_type='stuff',
                retriever=retriever,
                return_source_documents=True,
                chain_type_kwargs={'prompt': prompt}
            )
            
            return qa_chain
        
        except Exception as e:
            raise LLMServiceError(f"Failed to create QA chain: {str(e)}")
    
    def _create_rag_prompt_template(self):
        """Create prompt template for RAG queries"""
        template = """You are CompliAI, an expert in Governance, Risk, and Compliance (GRC).
        Use the provided document context to answer the user's question accurately and comprehensively.
        
        IMPORTANT INSTRUCTIONS:
        1. Base your answer ONLY on the provided document context
        2. If the context doesn't contain enough information, clearly state what's missing
        3. Cite specific sections or paragraphs when possible
        4. For control-related questions:
           - Identify specific controls, policies, or procedures
           - Provide relevant excerpts from the document
           - Categorize controls as preventive, detective, or corrective when possible
           - Map to standard frameworks when applicable
        
        FORMAT YOUR RESPONSE:
        - Use clear headings with "##" for main sections
        - Use bullet points with "•" for lists
        - Use **bold** for important terms
        - Include specific quotes from the document in quotation marks
        - Add a confidence level at the end (High/Medium/Low)
        
        Document Context:
        {context}
        
        User Question: {question}
        
        Response:
        """
        
        return PromptTemplate(
            template=template,
            input_variables=['context', 'question']
        )
    
    async def query_document(self, document_id: str, query: str) -> Dict:
        """Query a specific document using RAG"""
        if document_id not in self.qa_chains:
            raise DocumentNotFoundError(f"Document {document_id} not found or not processed")
        
        try:
            qa_chain = self.qa_chains[document_id]
            rag_response = qa_chain.invoke({"query": query})
            
            return {
                "answer": rag_response.get('result', 'No answer generated'),
                "source_documents": rag_response.get('source_documents', []),
                "document_id": document_id,
                "query": query,
                "timestamp": datetime.utcnow()
            }
        
        except Exception as e:
            raise LLMServiceError(f"Error querying document: {str(e)}")
    
    async def _identify_controls_in_document(self, document_id: str, qa_chain) -> List[Dict]:
        """Identify controls in uploaded document"""
        controls_query = """
        Analyze this document and identify all internal controls, policies, procedures, and compliance requirements.
        For each control identified, provide:
        1. Control name/title
        2. Brief description
        3. Relevant text excerpt from the document
        4. Control type (preventive, detective, or corrective)
        5. Applicable compliance framework if identifiable (ISO 27001, SOC 2, NIST, PCI DSS, etc.)
        
        Format your response as a structured list with clear sections for each control.
        """
        
        try:
            response = qa_chain.invoke({"query": controls_query})
            return self._parse_controls_response(response.get('result', ''))
        
        except Exception as e:
            print(f"Error identifying controls: {e}")
            return []
    
    def _parse_controls_response(self, response: str) -> List[Dict]:
        """Parse controls from LLM response"""
        controls = []
        
        # Simple parsing - can be enhanced with more sophisticated NLP
        lines = response.split('\n')
        current_control = {}
        
        for line in lines:
            line = line.strip()
            
            if line.startswith(('1.', '2.', '3.', '4.', '5.')) or line.startswith('•'):
                if current_control:
                    controls.append(current_control)
                    current_control = {}
                
                current_control['description'] = line
                current_control['id'] = str(len(controls) + 1)
                current_control['type'] = 'administrative'  # Default
            
            elif line and current_control:
                if 'context' not in current_control:
                    current_control['context'] = line
                else:
                    current_control['context'] += ' ' + line
        
        if current_control:
            controls.append(current_control)
        
        return controls
    
    def get_document_info(self, document_id: str) -> Dict:
        """Get document information"""
        if document_id not in self.document_metadata:
            raise DocumentNotFoundError(f"Document {document_id} not found")
        
        return self.document_metadata[document_id]
    
    def list_documents(self, user_id: str = None) -> List[Dict]:
        """List all documents or documents for specific user"""
        documents = []
        
        for doc_id, metadata in self.document_metadata.items():
            if user_id is None or metadata.get('user_id') == user_id:
                documents.append({
                    "document_id": doc_id,
                    "name": metadata.get('name'),
                    "uploaded_at": metadata.get('uploaded_at'),
                    "chunks_count": metadata.get('chunks_count'),
                    "status": metadata.get('status')
                })
        
        return documents
    
    def delete_document(self, document_id: str) -> bool:
        """Delete document and cleanup resources"""
        try:
            # Remove from memory
            if document_id in self.vector_stores:
                del self.vector_stores[document_id]
            
            if document_id in self.qa_chains:
                del self.qa_chains[document_id]
            
            if document_id in self.document_metadata:
                del self.document_metadata[document_id]
            
            # Remove vector store directory
            db_path = f"./vector_stores/{document_id}"
            if os.path.exists(db_path):
                shutil.rmtree(db_path)
            
            return True
        
        except Exception as e:
            print(f"Error deleting document: {e}")
            return False

# Global instance
document_processor = DocumentProcessor()
