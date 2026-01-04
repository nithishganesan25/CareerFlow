import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

with open('available_models.txt', 'w') as f:
    try:
        for m in genai.list_models():
            line = f"Name: {m.name}, Methods: {m.supported_generation_methods}\n"
            print(line.strip())
            f.write(line)
    except Exception as e:
        f.write(f"Error: {e}")
