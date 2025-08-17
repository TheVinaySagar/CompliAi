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
import json

from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

from services.grc.llm_manager import llm_manager
from utils.exceptions import DocumentNotFoundError, LLMServiceError
from repositories.document_repository import document_repository    
from services.grc.knowledge_base import grc_knowledge

MAX_DOCUMENT_CHARS = 50000  # Increased limit
MAX_CHUNK_SIZE = 15000  # Size per chunk for processing


def extract_json(text):
        """Attempts to extract valid JSON from LLM output."""
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError as e:
                print("JSON extraction failed:", e)
        return {}
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
            print(f"Starting document processing for file: {file_path}")
            
            # Always generate a unique document ID
            document_id = str(uuid.uuid4())
            print(f"Generated document ID: {document_id}")
            
            # Use document_name for display, fallback to filename
            display_name = document_name or os.path.basename(file_path)
            print(f"Document display name: {display_name}")
            
            # Load document based on file type
            print("Loading document...")
            documents = self._load_document_by_type(file_path)
            print(f"Loaded {len(documents)} document pages/sections")
            
            # Split into chunks
            print("Splitting document into chunks...")
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=3000,
                chunk_overlap=600,
                length_function=len,
            )
            chunks = text_splitter.split_documents(documents)
            print(f"Created {len(chunks)} chunks")
            
            # Create embeddings
            print("Getting embedding model...")
            embeddings = llm_manager.get_embedding_model()
            if not embeddings:
                raise Exception("Failed to get embedding model from LLM manager")
            
            # Create vector store directory
            db_path = f"./vector_stores/{document_id}"
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            print(f"Vector store directory: {db_path}")
            
            # Remove existing vector store if it exists
            if os.path.exists(db_path):
                shutil.rmtree(db_path)
                print("Removed existing vector store")
            
            # Create vector store
            print("Creating vector store...")
            vector_store = Chroma.from_documents(
                chunks,
                embeddings,
                persist_directory=db_path
            )
            print("Vector store created successfully")
            
            # Store references
            self.vector_stores[document_id] = vector_store
            
            # Create QA chain
            print("Creating QA chain...")
            qa_chain = self._create_qa_chain(vector_store)
            self.qa_chains[document_id] = qa_chain
            print("QA chain created successfully")
            
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
            
            # Store in memory for immediate access (including the chunks for policy analysis)
            self.document_metadata[document_id] = metadata
            # Store the actual chunks for policy analysis - this is key!
            self.document_metadata[document_id]["original_chunks"] = chunks
            
            # Save to database for persistence
            print("Saving document metadata to database...")
            try:
                await document_repository.save_document_metadata(metadata)
                print("Document metadata saved to database successfully")
            except Exception as db_error:
                print(f"Warning: Failed to save document metadata to database: {db_error}")
            
            # Process controls analysis
            print("Starting controls analysis...")
            try:
                controls = await self._policies(document_id)
                
                if controls and "analysis_summary" in controls:
                    controls_count = controls["analysis_summary"]["identified_controls_count"]
                    print(f"Controls analysis completed: {controls_count} controls identified")
                    
                    self.document_metadata[document_id]["controls_identified"] = controls_count
                    self.document_metadata[document_id]["framework_mapping"] = controls
                else:
                    print("Warning: Controls analysis returned empty or invalid result")
                    controls = {
                        "analysis_summary": {"identified_controls_count": 0},
                        "mapped_controls": [],
                        "gap_analysis": {}
                    }
                    self.document_metadata[document_id]["controls_identified"] = 0
                    self.document_metadata[document_id]["framework_mapping"] = controls
                    
            except Exception as controls_error:
                print(f"Error during controls analysis: {controls_error}")
                import traceback
                traceback.print_exc()
                
                # Set default values if controls analysis fails
                controls = {
                    "analysis_summary": {"identified_controls_count": 0},
                    "mapped_controls": [],
                    "gap_analysis": {}
                }
                self.document_metadata[document_id]["controls_identified"] = 0
                self.document_metadata[document_id]["framework_mapping"] = controls
                self.document_metadata[document_id]["status"] = "controls_analysis_failed"

            # Update database with control count and mapping
            print("Updating database with controls analysis results...")
            try:
                await document_repository.update_document_metadata(
                    document_id, 
                    user_id, 
                    {
                        "controls_identified": self.document_metadata[document_id]["controls_identified"], 
                        "framework_mapping": controls,
                        "status": self.document_metadata[document_id].get("status", "processed")
                    }
                )
                print("Database updated successfully with controls analysis")
            except Exception as db_error:
                print(f"Warning: Failed to update control count in database: {db_error}")
            
            print("Document processing completed successfully")
            
            return {
                "document_id": document_id,
                "status": "success",
                "chunks_created": len(chunks),
                "controls_identified": self.document_metadata[document_id].get("controls_identified", 0),
                "processing_status": self.document_metadata[document_id].get("status", "processed"),
                "character_count": len("\n".join([doc.page_content for doc in documents])) if documents else 0,
                "message": f"Document '{display_name}' processed successfully with {self.document_metadata[document_id].get('controls_identified', 0)} controls identified"
            }
            
        except Exception as e:
            error_msg = f"Error processing document: {str(e)}"
            print(error_msg)
            import traceback
            traceback.print_exc()
            
            return {
                "status": "error",
                "message": error_msg,
                "document_id": document_id if 'document_id' in locals() else None
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

      # prevent LLM cutoff

    async def _policies(self, document_id):
        try:
            print(f"Starting policy analysis for document {document_id}")
            
            # Get the original chunks from metadata instead of reconstructing from vector store
            document_metadata = self.document_metadata.get(document_id)
            if not document_metadata:
                print(f"Error: No metadata found for document {document_id}")
                return {}
            
            # Get original chunks
            original_chunks = document_metadata.get("original_chunks", [])
            if not original_chunks:
                print(f"Warning: No original chunks found, falling back to vector store")
                # Fallback to vector store method
                vector_store = self.vector_stores.get(document_id)
                if not vector_store:
                    print(f"Error: No vector store found for document {document_id}")
                    return {}
                all_chunks = vector_store.get()['documents']
                full_text = "\n".join(all_chunks)
            else:
                # Use original chunks - this preserves the proper chunking
                chunk_texts = [chunk.page_content for chunk in original_chunks]
                full_text = "\n".join(chunk_texts)
                print(f"Using {len(original_chunks)} original chunks for analysis")
            
            print(f"Full document text length: {len(full_text)} characters")

            # Process each chunk individually for better analysis
            if len(original_chunks) > 1:
                print(f"Processing {len(original_chunks)} chunks individually for comprehensive analysis")
                return await self._process_chunks_individually(original_chunks, document_id)
            else:
                # Single chunk processing
                if len(full_text) > MAX_DOCUMENT_CHARS:
                    print(f"Document is large ({len(full_text)} chars), processing in sub-chunks")
                    return await self._process_large_document_in_chunks(full_text)
                else:
                    print(f"Processing document as single chunk ({len(full_text)} chars)")
                    return await self._process_document_chunk(full_text)

        except Exception as e:
            print(f"Error in _policies method: {e}")
            import traceback
            traceback.print_exc()
            return {}

    async def _process_chunks_individually(self, chunks, document_id):
        """Process each original chunk individually for comprehensive analysis"""
        try:
            print(f"Processing {len(chunks)} chunks individually...")
            
            all_controls = []
            all_gap_analysis = {}
            total_chars = 0
            
            for idx, chunk in enumerate(chunks):
                chunk_text = chunk.page_content
                total_chars += len(chunk_text)
                
                print(f"Processing chunk {idx + 1}/{len(chunks)} ({len(chunk_text)} chars)")
                
                # Skip very small chunks that might not contain meaningful content
                if len(chunk_text.strip()) < 100:
                    print(f"Skipping chunk {idx + 1} - too small ({len(chunk_text)} chars)")
                    continue
                
                chunk_result = await self._process_document_chunk(chunk_text, chunk_number=idx + 1)
                
                if chunk_result and "mapped_controls" in chunk_result:
                    controls_found = len(chunk_result["mapped_controls"])
                    if controls_found > 0:
                        print(f"Chunk {idx + 1} found {controls_found} controls")
                        all_controls.extend(chunk_result["mapped_controls"])
                    else:
                        print(f"Chunk {idx + 1} found no controls")
                    
                if chunk_result and "gap_analysis" in chunk_result:
                    # Merge gap analysis results
                    for framework, gaps in chunk_result["gap_analysis"].items():
                        if framework not in all_gap_analysis:
                            all_gap_analysis[framework] = []
                        all_gap_analysis[framework].extend(gaps)
            
            # Remove duplicate controls based on extracted_statement and ai_control_summary
            unique_controls = []
            seen_controls = set()
            
            for control in all_controls:
                # Create a unique identifier from statement and summary
                statement = control.get("extracted_statement", "").strip()
                summary = control.get("ai_control_summary", "").strip()
                control_key = f"{statement[:100]}|{summary[:100]}"  # Use first 100 chars to create key
                
                if control_key not in seen_controls and statement:
                    seen_controls.add(control_key)
                    unique_controls.append(control)
            
            # Remove duplicate gaps
            for framework in all_gap_analysis:
                unique_gaps = []
                seen_control_ids = set()
                for gap in all_gap_analysis[framework]:
                    control_id = gap.get("control_id", "")
                    if control_id not in seen_control_ids:
                        seen_control_ids.add(control_id)
                        unique_gaps.append(gap)
                all_gap_analysis[framework] = unique_gaps
            
            print(f"Chunk processing completed:")
            print(f"  - Total chunks processed: {len(chunks)}")
            print(f"  - Total characters analyzed: {total_chars}")
            print(f"  - Total controls found: {len(all_controls)}")
            print(f"  - Unique controls after deduplication: {len(unique_controls)}")
            
            return {
                "analysis_summary": {
                    "document_character_count": total_chars,
                    "identified_controls_count": len(unique_controls),
                    "frameworks_analyzed": ["ISO 27001", "SOC 2", "NIST"],
                    "chunks_processed": len(chunks),
                    "total_raw_controls_found": len(all_controls)
                },
                "mapped_controls": unique_controls,
                "gap_analysis": all_gap_analysis
            }
            
        except Exception as e:
            print(f"Error processing chunks individually: {e}")
            import traceback
            traceback.print_exc()
            return {}

    async def _process_large_document_in_chunks(self, full_text):
        """Process large documents by splitting into manageable chunks"""
        try:
            print("Processing large document in chunks...")
            
            # Split document into overlapping chunks
            chunks = []
            chunk_size = MAX_CHUNK_SIZE
            overlap = 1000  # Overlap to maintain context
            
            for i in range(0, len(full_text), chunk_size - overlap):
                chunk = full_text[i:i + chunk_size]
                if chunk.strip():  # Only add non-empty chunks
                    chunks.append(chunk)
            
            print(f"Split document into {len(chunks)} processing chunks")
            
            # Process each chunk
            all_controls = []
            all_gap_analysis = {}
            total_identified_controls = 0
            
            for idx, chunk in enumerate(chunks):
                print(f"Processing chunk {idx + 1}/{len(chunks)} ({len(chunk)} chars)")
                
                chunk_result = await self._process_document_chunk(chunk, chunk_number=idx + 1)
                
                if chunk_result and "mapped_controls" in chunk_result:
                    all_controls.extend(chunk_result["mapped_controls"])
                    
                if chunk_result and "gap_analysis" in chunk_result:
                    # Merge gap analysis results
                    for framework, gaps in chunk_result["gap_analysis"].items():
                        if framework not in all_gap_analysis:
                            all_gap_analysis[framework] = []
                        all_gap_analysis[framework].extend(gaps)
                
                if chunk_result and "analysis_summary" in chunk_result:
                    total_identified_controls += chunk_result["analysis_summary"].get("identified_controls_count", 0)
            
            # Remove duplicate controls based on extracted_statement
            unique_controls = []
            seen_statements = set()
            
            for control in all_controls:
                statement = control.get("extracted_statement", "")
                if statement not in seen_statements:
                    seen_statements.add(statement)
                    unique_controls.append(control)
            
            # Remove duplicate gaps
            for framework in all_gap_analysis:
                unique_gaps = []
                seen_control_ids = set()
                for gap in all_gap_analysis[framework]:
                    control_id = gap.get("control_id", "")
                    if control_id not in seen_control_ids:
                        seen_control_ids.add(control_id)
                        unique_gaps.append(gap)
                all_gap_analysis[framework] = unique_gaps
            
            print(f"Final results: {len(unique_controls)} unique controls identified")
            
            return {
                "analysis_summary": {
                    "document_character_count": len(full_text),
                    "identified_controls_count": len(unique_controls),
                    "frameworks_analyzed": ["ISO 27001", "SOC 2", "NIST"],
                    "processed_in_chunks": len(chunks)
                },
                "mapped_controls": unique_controls,
                "gap_analysis": all_gap_analysis
            }
            
        except Exception as e:
            print(f"Error processing large document in chunks: {e}")
            import traceback
            traceback.print_exc()
            return {}

    async def _process_document_chunk(self, text_content, chunk_number=1):
        """Process a single document chunk"""
        try:
            print(f"Processing text chunk {chunk_number} with {len(text_content)} characters")
            
            # 2. Construct prompt
            prompt = f"""
            You are CompliAI, a world-class AI assistant specializing in Governance, Risk, and Compliance (GRC). Your task is to perform a detailed, automated control mapping and gap analysis based on the provided document text.

            Analyze the document to identify all security controls, policies, and procedures. For each identified control, generate:
            - Control Name/Title
            - Description
            - Relevant Text Excerpt
            - Control Type (preventive, detective, corrective)
            - Applicable Compliance Framework (if identifiable)

            Then, perform a **gap analysis** against major frameworks like ISO 27001, SOC 2, and NIST. Identify any missing controls.

            Only output a valid JSON object. Do not include any commentary, markdown, or explanations.

            Format:
            {{
            "analysis_summary": {{
                "document_character_count": {len(text_content)},
                "identified_controls_count": 0,
                "frameworks_analyzed": ["ISO 27001", "SOC 2", "NIST"]
            }},
            "mapped_controls": [
                {{
                "extracted_statement": "<quote>",
                "ai_control_summary": "<summary>",
                "mappings": [
                    {{
                    "framework": "<framework>",
                    "control_id": "<e.g., A.5.17>",
                    "control_title": "<title>",
                    "mapping_confidence": "<High/Medium/Low>",
                    "rationale": "<reason>"
                    }}
                ]
                }}
            ],
            "gap_analysis": {{
                "ISO 27001": [
                {{
                    "control_id": "<missing control>",
                    "control_title": "<title>",
                    "description": "<description>"
                }}
                ]
            }}
            }}

            DOCUMENT_TEXT:
            \"\"\"
            {text_content}
            \"\"\"
            """

            # 3. Call LLM
            llm = llm_manager.get_rag_llm()
            if not llm:
                print("Error: Failed to get LLM from manager")
                return {}
                
            print(f"Calling LLM for chunk {chunk_number}...")
            response = llm.invoke(prompt)
            print(f"LLM response received for chunk {chunk_number}")

            # 4. Clean & parse output
            raw_text = getattr(response, "content", str(response))
            result = extract_json(raw_text)

            if not result:
                print(f"Failed to parse LLM output as valid JSON for chunk {chunk_number}")
                print("Raw output was:\n", raw_text[:500] + "..." if len(raw_text) > 500 else raw_text)
                return {}

            # Update the identified_controls_count in the result
            if "mapped_controls" in result and "analysis_summary" in result:
                result["analysis_summary"]["identified_controls_count"] = len(result["mapped_controls"])
            
            print(f"Chunk {chunk_number} processed successfully: {result.get('analysis_summary', {}).get('identified_controls_count', 0)} controls identified")
            return result

        except Exception as e:
            print(f"Error processing document chunk {chunk_number}: {e}")
            import traceback
            traceback.print_exc()
            return {}

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
# Global instance
document_processor = DocumentProcessor()
