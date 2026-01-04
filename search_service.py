from duckduckgo_search import DDGS


async def search_company_interview(company_name: str):
    """
    Searches for deep interview patterns, rounds, and specific questions.
    """
    # Multi-faceted query for maximum richness
    query = f"{company_name} technical interview rounds interview experiences process technical questions 2024 2025"
    results = []
    
    try:
        with DDGS() as ddgs:
            # Increased results for better AI context
            for r in ddgs.text(query, max_results=15):
                results.append({
                    "title": r.get("title", ""),
                    "body": r.get("body", ""),
                    "link": r.get("href", "")
                })
    except Exception as e:
        print(f"Search Error: {e}")
            
    return results

async def search_general(query: str):
    """
    Performs a general web search for MCQs and technical deep-dives.
    """
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=12):
                results.append({
                    "title": r.get("title", ""),
                    "body": r.get("body", ""),
                    "link": r.get("href", "")
                })
    except Exception as e:
        print(f"General Search Error: {e}")
    return results

async def search_practice_links(company_name: str):
    """
    Searches for high-authority interview preparation and coding practice links.
    """
    queries = [
        f"site:leetcode.com {company_name} interview questions",
        f"site:geeksforgeeks.org {company_name} interview experience",
        f"site:interviewbit.com {company_name} preparation",
        f"{company_name} professional career interview prep official"
    ]
    
    links = []
    seen_urls = set()
    
    try:
        with DDGS() as ddgs:
            for query in queries:
                for r in ddgs.text(query, max_results=5):
                    url = r.get("href", "")
                    if url and url not in seen_urls:
                        title = r.get("title", "")
                        # Enhancing titles for a very professional UI feel
                        if "leetcode" in url.lower(): title = f"LeetCode: {company_name} Track"
                        elif "geeksforgeeks" in url.lower(): title = f"GeeksforGeeks: {company_name} Experience"
                        elif "interviewbit" in url.lower(): title = f"InterviewBit: {company_name} Path"
                        elif "glassdoor" in url.lower(): title = f"Glassdoor: {company_name} Insights"
                        
                        links.append({"title": title, "link": url})
                        seen_urls.add(url)
                    if len(links) >= 8: break
                if len(links) >= 8: break
    except Exception as e:
        print(f"Link Search Error: {e}")
    
    # Static but highly professional fallbacks
    fallbacks = [
        {"title": f"Official {company_name} Careers", "link": f"https://www.google.com/search?q={company_name}+careers+interview+process"},
        {"title": "LeetCode Company Tag", "link": f"https://leetcode.com/company/{company_name.lower().replace(' ', '-')}/"},
        {"title": "GFG Interview Experiences", "link": f"https://www.geeksforgeeks.org/tag/{company_name.lower().replace(' ', '-')}/"}
    ]
    for fb in fallbacks:
        if len(links) < 10 and fb["link"] not in seen_urls:
            links.append(fb)
            
    return links[:8]
