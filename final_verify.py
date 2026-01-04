import asyncio
import os
import re
import json
from dotenv import load_dotenv
import google.generativeai as genai
from search_service import search_company_interview

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class AIClient:
    def __init__(self):
        self.models = ['gemini-1.5-flash', 'gemini-pro']
        
    def generate_content(self, prompt):
        for model_name in self.models:
            try:
                print(f"Testing {model_name}...")
                m = genai.GenerativeModel(model_name)
                response = m.generate_content(prompt)
                return response
            except Exception as e:
                print(f"Failed {model_name}: {str(e)[:50]}")
                continue
        return None

async def verify_final():
    client = AIClient()
    company = "Amazon"
    print(f"--- Final Verification for: {company} ---")
    
    results = await search_company_interview(company)
    context = "\n".join([r['body'] for r in results])
    prompt = f"Using context: {context}\nReturn JSON with 2 interview questions for {company}: {{'questions': []}}"
    
    response = client.generate_content(prompt)
    if response:
        print("Success! AI Response received via fallback/main model.")
        print(response.text)
    else:
        print("All models failed.")

if __name__ == "__main__":
    asyncio.run(verify_final())
