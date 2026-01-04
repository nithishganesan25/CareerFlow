import os
import chromadb
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Setup Google Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-flash-latest')

# Define the same embedding function used in fill_db.py
class GeminiEmbeddingFunction(chromadb.EmbeddingFunction):
    def __call__(self, input: chromadb.Documents) -> chromadb.Embeddings:
        model = 'models/text-embedding-004'
        result = genai.embed_content(
            model=model,
            content=input,
            task_type="retrieval_query" # Important: different task type for queries
        )
        return result['embedding']

# Your existing ChromaDB setup
CHROMA_PATH = r"chroma_db"
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
gemini_ef = GeminiEmbeddingFunction()

collection = chroma_client.get_or_create_collection(
    name="placement",
    embedding_function=gemini_ef
)

user_query = input("What do you want to know about placement?\n\n")

# Retrieval
results = collection.query(query_texts=[user_query], n_results=4)
print(f"DEBUG: Found {len(results['documents'][0])} matching chunks.")
print(f"DEBUG: First chunk content: {results['documents'][0][0][:100]}...")
context = "\n".join(results['documents'][0])

# Generation
prompt = f"""
You are a helpful assistant. Answer based ONLY on the following knowledge.
If you don't know the answer, say: I don't know.
--------------------
The data:
{context}

User Question: {user_query}
"""

response = model.generate_content(prompt)

print("\n--- Assistant Response ---")
print(response.text)