"""
Document Processing Service
Handles document upload, processing, and RAG operations.
"""

import os
import uuid
import shutil
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import re

from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

from services.grc.llm_manager import llm_manager
from utils.exceptions import DocumentNotFoundError, LLMServiceError
from database.document_repository import document_repository    
from services.grc.knowledge_base import grc_knowledge

class DocumentProcessor:
    """Handles document processing and RAG operations"""
    
    def __init__(self):
        self.vector_stores: Dict[str, Chroma] = {}
        self.qa_chains: Dict[str, RetrievalQA] = {}
        self.document_metadata: Dict[str, Dict] = {}
    
    async def initialize_documents(self):
        """Load existing documents from database on startup"""
        try:
            print("Loading existing documents from database...")
            
            # Get all documents from database
            all_documents = await document_repository.list_all_documents()
            
            loaded_count = 0
            for doc in all_documents:
                document_id = doc.get("document_id")
                if document_id:
                    # Store metadata in memory
                    self.document_metadata[document_id] = {
                        "document_id": document_id,
                        "name": doc.get("name"),
                        "file_path": doc.get("file_path"),
                        "user_id": doc.get("user_id"),
                        "uploaded_at": doc.get("uploaded_at"),
                        "chunks_count": doc.get("chunks_count", 0),
                        "controls_identified": doc.get("controls_identified", 0),
                        "status": doc.get("status", "unknown"),
                        "file_type": doc.get("file_type")
                    }
                    
                    # Try to restore vector store if it exists
                    db_path = f"./vector_stores/{document_id}"
                    if os.path.exists(db_path):
                        try:
                            embeddings = llm_manager.get_embedding_model()
                            vector_store = Chroma(
                                persist_directory=db_path,
                                embedding_function=embeddings
                            )
                            self.vector_stores[document_id] = vector_store
                            
                            # Recreate QA chain
                            qa_chain = self._create_qa_chain(vector_store)
                            self.qa_chains[document_id] = qa_chain
                            
                        except Exception as vs_error:
                            print(f"Warning: Failed to restore vector store for {document_id}: {vs_error}")
                    
                    loaded_count += 1
            
            print(f"Successfully loaded {loaded_count} documents from database")
            
        except Exception as e:
            print(f"Warning: Failed to load documents from database: {e}")

    async def upload_and_process_document(
        self, 
        file_path: str, 
        document_name: str = None,
        user_id: str = None
    ) -> Dict:
        """Upload and process a document for RAG queries"""
        try:
            # Always generate a unique document ID
            document_id = str(uuid.uuid4())
            
            # Use document_name for display, fallback to filename
            display_name = document_name or os.path.basename(file_path)
            
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
            
            # Store document metadata (both in memory and database)
            metadata = {
                "document_id": document_id,
                "name": display_name,  # Use the display name from parameter or filename
                "file_path": file_path,
                "user_id": user_id,
                "uploaded_at": datetime.utcnow(),
                "chunks_count": len(chunks),
                "status": "processed",
                "file_type": os.path.splitext(file_path)[1].lower(),
                "controls_identified": 0  # Will be updated after control identification
            }
            
            # Store in memory for immediate access
            self.document_metadata[document_id] = metadata
            
            # Save to database for persistence
            try:
                await document_repository.save_document_metadata(metadata)
            except Exception as db_error:
                print(f"Warning: Failed to save document metadata to database: {db_error}")
            
            # Identify controls in document
            controls = await self._identify_controls_in_document(document_id, qa_chain)
            
            # Update control count in metadata
            self.document_metadata[document_id]["controls_identified"] = len(controls)
            
            # --- NEW: Multi-framework mapping ---
            mapping_results = self._map_controls_to_frameworks(controls)
            self.document_metadata[document_id]["framework_mapping"] = mapping_results
            
            # Update database with control count and mapping
            try:
                await document_repository.update_document_metadata(
                    document_id, 
                    user_id, 
                    {"controls_identified": len(controls), "framework_mapping": mapping_results}
                )
            except Exception as db_error:
                print(f"Warning: Failed to update control count in database: {db_error}")
            
            return {
                "document_id": document_id,
                "status": "success",
                "chunks_created": len(chunks),
                "controls_identified": len(controls),
                "framework_mapping_summary": {fw: {"covered": len(res["covered"]), "missing": len(res["missing"])} for fw, res in mapping_results.items()},
                "message": f"Document '{display_name}' processed successfully"
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
        """Parse controls from LLM response (robust version)"""
        controls = []
        lines = response.split('\n')
        current_control = {}
        control_id_pattern = re.compile(r'(A\.\d+\.\d+\.\d+|A\.\d+\.\d+|CC\d+\.\d+|CC\d+|ID\.[A-Z]{2}-\d+|PR\.[A-Z]{2}-\d+|\d+\.\d+\.\d+|\d+\.\d+|[A-Z]{2,}-\d+)', re.IGNORECASE)
        for line in lines:
            line = line.strip()
            if not line:
                continue
            # New control section
            if line.startswith(('1.', '2.', '3.', '4.', '5.')) or line.startswith('•'):
                if current_control:
                    controls.append(current_control)
                    current_control = {}
                # Try to extract control ID and title
                match = control_id_pattern.search(line)
                if match:
                    current_control['control_id'] = match.group(0)
                # Try to extract title (after control ID or after number/bullet)
                title = line
                if match:
                    title = line[match.end():].strip(' .:-')
                else:
                    # Remove bullet/number
                    title = re.sub(r'^(\d+\.|•)\s*', '', line).strip(' .:-')
                current_control['title'] = title if title else line
                current_control['raw'] = line
            else:
                # Add to description/context
                if 'description' not in current_control:
                    current_control['description'] = line
                else:
                    current_control['description'] += ' ' + line
        if current_control:
            controls.append(current_control)
        return controls
    
    async def get_document_info(self, document_id: str, user_id: str = None) -> Dict:
        """Get document information"""
        # First try to get from database
        try:
            db_document = await document_repository.get_document_by_id(document_id, user_id)
            if db_document:
                # Convert MongoDB document to dict and return
                doc_info = {
                    "document_id": db_document.get("document_id"),
                    "name": db_document.get("name"),
                    "file_path": db_document.get("file_path"),
                    "user_id": db_document.get("user_id"),
                    "uploaded_at": db_document.get("uploaded_at"),
                    "chunks_count": db_document.get("chunks_count", 0),
                    "controls_identified": db_document.get("controls_identified", 0),
                    "status": db_document.get("status", "unknown"),
                    "file_type": db_document.get("file_type"),
                    "framework_mapping": db_document.get("framework_mapping")
                }
                # Also store in memory for faster future access
                self.document_metadata[document_id] = doc_info
                return doc_info
                
        except Exception as db_error:
            print(f"Warning: Failed to retrieve document from database: {db_error}")
        
        # Fallback to in-memory data
        if document_id not in self.document_metadata:
            raise DocumentNotFoundError(f"Document {document_id} not found")
        
        # Check user ownership if user_id is provided
        metadata = self.document_metadata[document_id]
        if user_id and metadata.get('user_id') != user_id:
            raise DocumentNotFoundError(f"Document {document_id} not found")
        
        # Ensure framework_mapping is present in returned metadata
        if "framework_mapping" not in metadata:
            metadata["framework_mapping"] = None
        return metadata
    
    async def list_documents(self, user_id: str = None) -> List[Dict]:
        """List documents for specific user"""
        if not user_id:
            raise ValueError("user_id is required for security - cannot list all documents without user context")
        
        try:
            # Get user's documents from database first
            db_documents = await document_repository.list_documents_by_user(user_id)
            
            documents = []
            for doc in db_documents:
                documents.append({
                    "document_id": doc.get("document_id"),
                    "name": doc.get("name"),
                    "uploaded_at": doc.get("uploaded_at"),
                    "chunks_count": doc.get("chunks_count", 0),
                    "controls_identified": doc.get("controls_identified", 0),
                    "status": doc.get("status", "unknown"),
                    "file_type": doc.get("file_type")
                })
            
            return documents
            
        except Exception as db_error:
            print(f"Warning: Failed to retrieve documents from database: {db_error}")
            # Fallback to in-memory data filtered by user
            documents = []
            
            for doc_id, metadata in self.document_metadata.items():
                if metadata.get('user_id') == user_id:
                    documents.append({
                        "document_id": doc_id,
                        "name": metadata.get('name'),
                        "uploaded_at": metadata.get('uploaded_at'),
                        "chunks_count": metadata.get('chunks_count'),
                        "controls_identified": metadata.get('controls_identified', 0),
                        "status": metadata.get('status')
                    })
            
            return documents
    
    async def list_all_documents_admin(self) -> List[Dict]:
        """List all documents across all users (ADMIN ONLY)"""
        try:
            db_documents = await document_repository.list_all_documents()
            
            documents = []
            for doc in db_documents:
                documents.append({
                    "document_id": doc.get("document_id"),
                    "name": doc.get("name"),
                    "user_id": doc.get("user_id"),  # Include user_id for admin visibility
                    "uploaded_at": doc.get("uploaded_at"),
                    "chunks_count": doc.get("chunks_count", 0),
                    "controls_identified": doc.get("controls_identified", 0),
                    "status": doc.get("status", "unknown"),
                    "file_type": doc.get("file_type")
                })
            
            return documents
            
        except Exception as db_error:
            print(f"Warning: Failed to retrieve documents from database: {db_error}")
            # Fallback to in-memory data
            documents = []
            
            for doc_id, metadata in self.document_metadata.items():
                documents.append({
                    "document_id": doc_id,
                    "name": metadata.get('name'),
                    "user_id": metadata.get('user_id'),
                    "uploaded_at": metadata.get('uploaded_at'),
                    "chunks_count": metadata.get('chunks_count'),
                    "controls_identified": metadata.get('controls_identified', 0),
                    "status": metadata.get('status')
                })
            
            return documents

    async def delete_document(self, document_id: str, user_id: str = None) -> bool:
        """Delete document and cleanup resources"""
        try:
            # Remove from database first
            if user_id:
                try:
                    await document_repository.delete_document_metadata(document_id, user_id)
                except Exception as db_error:
                    print(f"Warning: Failed to delete document metadata from database: {db_error}")
            
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
    
    async def load_documents_from_database(self):
        """Load document metadata from database on startup"""
        try:
            db_documents = await document_repository.list_all_documents()
            
            for doc in db_documents:
                document_id = doc.get("document_id")
                if document_id:
                    # Store in memory for quick access
                    self.document_metadata[document_id] = {
                        "name": doc.get("name"),
                        "file_path": doc.get("file_path"),
                        "user_id": doc.get("user_id"),
                        "uploaded_at": doc.get("uploaded_at"),
                        "chunks_count": doc.get("chunks_count", 0),
                        "controls_identified": doc.get("controls_identified", 0),
                        "status": doc.get("status", "processed"),
                        "file_type": doc.get("file_type")
                    }
                    
                    # Try to restore vector store and QA chain if vector store exists
                    db_path = f"./vector_stores/{document_id}"
                    if os.path.exists(db_path):
                        try:
                            embeddings = llm_manager.get_embedding_model()
                            vector_store = Chroma(
                                persist_directory=db_path,
                                embedding_function=embeddings
                            )
                            self.vector_stores[document_id] = vector_store
                            
                            # Create QA chain
                            qa_chain = self._create_qa_chain(vector_store)
                            self.qa_chains[document_id] = qa_chain
                            
                        except Exception as restore_error:
                            print(f"Warning: Failed to restore vector store for document {document_id}: {restore_error}")
                            # Update status to indicate issue
                            self.document_metadata[document_id]["status"] = "vector_store_missing"
            
            print(f"Loaded {len(db_documents)} documents from database")
            
        except Exception as e:
            print(f"Warning: Failed to load documents from database: {e}")

    def _map_controls_to_frameworks(self, controls: list) -> dict:
        """
        Robust mapping: match by control ID, then by normalized title, then by fuzzy/partial description (case-insensitive).
        """
        from difflib import SequenceMatcher
        def normalize(text):
            return re.sub(r'[^a-zA-Z0-9]', '', text or '').lower()
        extracted_ids = set()
        extracted_titles = set()
        extracted_descs = []
        for ctrl in controls:
            if isinstance(ctrl, dict):
                if 'control_id' in ctrl:
                    extracted_ids.add(ctrl['control_id'].upper())
                if 'title' in ctrl:
                    extracted_titles.add(normalize(ctrl['title']))
                if 'description' in ctrl:
                    extracted_descs.append(ctrl['description'])
                if 'raw' in ctrl:
                    # Also search for control IDs in raw text
                    for m in re.findall(r'(A\.\d+\.\d+\.\d+|A\.\d+\.\d+|CC\d+\.\d+|CC\d+|ID\.[A-Z]{2}-\d+|PR\.[A-Z]{2}-\d+|\d+\.\d+\.\d+|\d+\.\d+|[A-Z]{2,}-\d+)', ctrl['raw'], re.IGNORECASE):
                        extracted_ids.add(m.upper())
            elif isinstance(ctrl, str):
                extracted_descs.append(ctrl)
        mapping = {}
        for fw, fw_data in grc_knowledge.frameworks.items():
            fw_controls = fw_data['controls']
            covered = set()
            missing = set()
            for ctrl_id, ctrl_data in fw_controls.items():
                # 1. Match by control ID (case-insensitive)
                if ctrl_id.upper() in extracted_ids:
                    covered.add(ctrl_id)
                    continue
                # 2. Match by normalized title
                ctrl_title_norm = normalize(ctrl_data.get('title', ''))
                if ctrl_title_norm in extracted_titles:
                    covered.add(ctrl_id)
                    continue
                # 3. Fuzzy/partial match by description
                found = False
                for desc in extracted_descs:
                    desc_norm = normalize(desc)
                    if ctrl_title_norm and ctrl_title_norm in desc_norm:
                        found = True
                        break
                    # Fuzzy match (ratio > 0.8)
                    if ctrl_title_norm and SequenceMatcher(None, ctrl_title_norm, desc_norm).ratio() > 0.8:
                        found = True
                        break
                if found:
                    covered.add(ctrl_id)
                    continue
                missing.add(ctrl_id)
            mapping[fw] = {
                "covered": list(covered),
                "missing": list(missing),
                "overlaps": []
            }
        return mapping

# Global instance
document_processor = DocumentProcessor()
