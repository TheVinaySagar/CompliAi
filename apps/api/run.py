import shutil
import time
import os

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import warnings
warnings.filterwarnings("ignore")


def create_vector_store_from_pdf(pdf_path="CompliAI.pdf", db_path="./chroma_db", embedding_choice='Ollama'):
    """
    Create a vector store from a PDF file.
    Args:
    pdf_path (str): Path to the PDF file
    db_path (str): Path where the vector store will be saved
    embedding_choice (str): The embedding model to use
    Returns:
    Chroma vector store object
    """
    print(f"Creating vector store from {pdf_path}...")
    
    # Load PDF
    loader = PyPDFLoader(file_path=pdf_path)
    pages = loader.load()
    
    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=200
    )
    chunks = text_splitter.split_documents(pages)
    
    # Load embeddings
    embeddings = load_embedding_model(embedding_choice)
    
    # Save to Chroma
    save_to_chroma(chunks, embeddings, db_path)
    
    # Return the created vector store
    return Chroma(persist_directory=db_path, embedding_function=embeddings)

def load_embedding_model(embedding_choice='OpenAI'):
    if embedding_choice == 'OpenAI':
        embeddings = OpenAIEmbeddings(
            model=os.getenv('OPENAI_EMBEDDING', 'text-embedding-ada-002'),
            api_key=os.getenv('OPENAI_API_KEY')
        )
    elif embedding_choice == 'Ollama':
        embeddings = OllamaEmbeddings(
            model=os.getenv('OLLAMA_EMBEDDING', 'nomic-embed-text:latest'),
            base_url=os.getenv('BASE_URL_OLLAMA', 'http://localhost:11434'),
        )
    else: 
        embeddings = GoogleGenerativeAIEmbeddings(
            model=os.getenv('GEMINI_EMBEDDING', 'models/embedding-001'),
            google_api_key=os.getenv('GOOGLE_API_KEY')
        )
    return embeddings

def save_to_chroma(chunks, embeddings, db_path):
    """
    Save the given list of Document objects to a Chroma database.
    Args:
    chunks (list[Document]): List of Document objects representing text chunks to save.
    Returns:
    None
    """

    # Clear out the existing database directory if it exists
    if os.path.exists(db_path):
        shutil.rmtree(db_path)

    # Create a new Chroma database from the documents using OpenAI embeddings
    db = Chroma.from_documents(
        chunks,
        embeddings,
        persist_directory=db_path
    )

    # print(f"Saved {len(chunks)} chunks to {db_path}.")

def load_llm(llm_service='OpenAI'):
    """
    Load the specified language model.
    Args:
    llm_service (str): The LLM service to use ('OpenAI', 'Ollama', or 'Google')
    Returns:
    LLM object
    """
    if llm_service == 'OpenAI':
        return ChatOpenAI(
            model=os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo'),
            api_key=os.getenv('OPENAI_API_KEY'),
            temperature=0.1
        )
    elif llm_service == 'Ollama':
        return ChatOllama(
            model=os.getenv('OLLAMA_MODEL', 'llama3.1:latest'),
            base_url=os.getenv('BASE_URL_OLLAMA', 'http://localhost:11434')
        )
    else:  # Google
        return ChatGoogleGenerativeAI(
            model=os.getenv('GEMINI_MODEL', 'gemini-pro'),
            api_key=os.getenv('GOOGLE_API_KEY')
        )

def load_vector_store(vector_name='chroma_db', embedding_choice='OpenAI'):
    """
    Load the vector store from the specified path.
    Args:
    vector_name (str): Name/path of the vector store
    embedding_choice (str): The embedding model to use
    Returns:
    Chroma vector store object
    """
    embeddings = load_embedding_model(embedding_choice)
    db_path = f"./{vector_name}"
    
    if os.path.exists(db_path):
        return Chroma(persist_directory=db_path, embedding_function=embeddings)
    else:
        print(f"Vector store not found at {db_path}. Please create it first.")
        return None

def create_prompt_template():
    """

    :return:
    """
    # prepare the template we will use when prompting the AI
    template = """Use the provided context to answer the user's question.
    If you don't know the exact answer from the provided context. 
    Do not use your prior knowledge.
    Generate at least one long paragraph.
    The answer must be relevant to the query.
    and finally give a confidence_score from 0% to 100% for your answer. Use white space between words.

    Context: {context}
    Question: {question}
    Answer:
    """

    prompt = PromptTemplate(
        template=template,
        input_variables=['context', 'question'])
    return prompt

def create_qa_chain():
    """
    Create and return the QA chain using the global components.
    Returns:
    RetrievalQA chain object
    """
    llm = load_llm(LLM_SERVICE)
    db = load_vector_store(vector_name='chroma_db', embedding_choice=EMBEDDING_CHOICE)
    prompt = create_prompt_template()
    
    if db:
        retriever = db.as_retriever(search_kwargs={'k': 3})
        
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type='stuff',
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={'prompt': prompt}
        )
        return qa_chain
    else:
        print("Database not found. Please ensure the vector store exists.")
        return None

def generate_response(query, qa_chain):
    """
    Generate response using the QA chain.
    Args:
    query (str): User query
    qa_chain: The RetrievalQA chain object
    Returns:
    dict: Response containing result and source documents
    """
    if qa_chain is None:
        return {"result": "Error: QA chain not initialized properly."}
    
    try:
        response = qa_chain.invoke({"query": query})
        
        if 'source_documents' in response and response['source_documents']:
            print(f"\nSources: Found {len(response['source_documents'])} relevant document chunks")
        
        return response
    except Exception as e:
        error_msg = str(e)
        if "Failed to connect to Ollama" in error_msg:
            return {
                "result": "Error: Cannot connect to Ollama. Please ensure Ollama is installed and running.\n"
            }
        return {"result": f"Error generating response: {error_msg}"}

# Initialize the components
LLM_SERVICE = os.getenv('LLM_SERVICE', 'Ollama')
EMBEDDING_CHOICE = os.getenv('EMBEDDING_CHOICE', 'Ollama')

llm = load_llm(LLM_SERVICE)
db = load_vector_store(vector_name='chroma_db', embedding_choice=EMBEDDING_CHOICE)
prompt = create_prompt_template()

if __name__ == "__main__":
    # Check if vector store exists, if not create it
    db_path = "./chroma_db"
    if not os.path.exists(db_path):
        print("Vector store not found. Creating it from PDF...")
        try:
            # Check if Ollama is running before creating vector store
            if EMBEDDING_CHOICE == 'Ollama':
                try:
                    test_embeddings = load_embedding_model(EMBEDDING_CHOICE)
                    test_embeddings.embed_query("test")
                except Exception as e:
                    print(f"Error: Cannot connect to Ollama for embeddings: {str(e)}")
                    print("Please ensure Ollama is running and the embedding model is available.")
                    print("Try running: ollama pull nomic-embed-text")
                    exit(1)
            
            create_vector_store_from_pdf(
                pdf_path="CompliAI.pdf", 
                db_path=db_path, 
                embedding_choice=EMBEDDING_CHOICE
            )
            print("Vector store created successfully!")
        except Exception as e:
            print(f"Error creating vector store: {str(e)}")
            print("Please ensure 'CompliAI.pdf' exists in the current directory.")
            exit(1)
    
    # Create QA chain once
    qa_chain = create_qa_chain()
    
    if qa_chain is None:
        print("Error: Could not create QA chain. Please check your configuration.")
        exit(1)
    
    print("CompliAI is ready! Type 'exit' or 'quit' to stop.")
    print("-" * 50)
    
    # Interactive loop
    while True:
        try:
            query = input("\nYou: ").strip()
            
            if query.lower() in ['exit', 'quit', 'q']:
                print("Goodbye!")
                break
            
            if not query:
                continue
            
            print("AI is thinking...")
            start_time = time.time()
            response = generate_response(query=query, qa_chain=qa_chain)
            end_time = time.time()
            
            print(f"Response time: {end_time - start_time:.1f} seconds")
            print(f"\nAI: {response['result']}")
            
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {str(e)}")
            continue