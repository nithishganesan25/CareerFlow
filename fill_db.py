import os
import chromadb
import google.generativeai as genai
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from chromadb import Documents, EmbeddingFunction, Embeddings

load_dotenv()

# 1. Setup Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# 2. Define a Gemini Embedding Function for Chroma
class GeminiEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        # Using Gemini's latest embedding model
        model = 'models/text-embedding-004'
        result = genai.embed_content(
            model=model,
            content=input,
            task_type="retrieval_document"
        )
        return result['embedding']

# 3. Environment paths
DATA_PATH = r"data"
CHROMA_PATH = r"chroma_db"

# Initialize Chroma and Collection with the Gemini Embedding Function
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
gemini_ef = GeminiEmbeddingFunction()

# IMPORTANT: If you had an old OpenAI collection, delete it or rename this one
collection = chroma_client.get_or_create_collection(
    name="placement", 
    embedding_function=gemini_ef
)

# 4. Load the documents
loader = PyPDFDirectoryLoader(DATA_PATH)
raw_documents = loader.load()

# 5. Split the documents
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=700,  # Increased slightly for better Gemini context
    chunk_overlap=100,
    length_function=len,
    is_separator_regex=False,
)
chunks = text_splitter.split_documents(raw_documents)

# 6. Prepare data for Chroma
documents = []
metadata = []
ids = []

for i, chunk in enumerate(chunks):
    documents.append(chunk.page_content)
    ids.append(f"ID{i}")
    metadata.append(chunk.metadata)

# 7. Add to ChromaDB
# Chroma will now automatically use GeminiEmbeddingFunction to embed these docs
collection.upsert(
    documents=documents,
    metadatas=metadata,
    ids=ids
)

print(f"✅ Successfully ingested {len(documents)} chunks into ChromaDB using Gemini embeddings.")