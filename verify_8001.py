import requests
import json

def verify_server():
    url = "http://localhost:8001/fetch-more-questions"
    payload = {
        "name": "Amazon",
        "existing": ["Implement an LRU Cache.", "Design a Distributed Crawler."]
    }
    
    print(f"--- Verifying Endpoint: {url} ---")
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            print("SUCCESS! Received unique questions:")
            for i, q in enumerate(data.get("questions", []), 1):
                print(f"{i}. {q['question']}")
        else:
            print(f"FAILED: Status {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    verify_server()
