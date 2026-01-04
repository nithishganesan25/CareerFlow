import requests
import json

def verify_rich_data():
    url = "http://localhost:8001/get-interview-data"
    payload = {"name": "Microsoft"}
    
    print(f"--- Verifying Rich Intelligence for: {payload['name']} ---")
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"SUCCESS!")
            print(f"Brief Length: {len(data.get('company_brief', ''))}")
            print(f"Rounds Count: {len(data.get('rounds', []))}")
            print(f"Questions Count: {len(data.get('questions', []))}")
            print(f"Practice Links: {len(data.get('practice_links', []))}")
            
            if len(data.get('questions', [])) >= 10:
                print("PASSED: High question volume.")
            else:
                print("WARNING: Lower question count than expected.")
                
            if data.get('company_brief'):
                print("PASSED: Strategic brief present.")
        else:
            print(f"FAILED: Status {response.status_code}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    verify_rich_data()
