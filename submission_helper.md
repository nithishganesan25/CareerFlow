# Hackathon Submission Details

Here are the details you can copy and paste directly into the submission form.

## 1. Project Name
**CareerFlow** (or **CareerPrep AI**)

## 2. Brief Description of Your Solution
*Option 1 (Focus on Impact):*
"CareerFlow is an AI-powered career accelerator that democratizes elite interview preparation. By combining real-time RAG with Google's Gemini 1.5 Flash, it delivers hyper-personalized company interview guides, professional resume audits, and adaptive mock tests to help candidates crack top-tier roles."

*Option 2 (Focus on Tech):*
"A full-stack RAG application leveraging Gemini 1.5 Flash and DuckDuckGo to generate real-time, company-specific interview roadmaps. Features include an ATS-grade resume scorer, adaptive technical quizzes, and secure Firebase Google Authentication."

## 3. List the Google Technologies Used
- **Firebase Authentication** (Google Sign-In integration)
- **Google Cloud Platform** (via Firebase config)
- **Google Fonts** (Inter/Outfit typography)
- **Google Generative AI SDK** (Python Client)

## 4. Mention the Google AI Tools Integrated
- **Gemini 1.5 Flash** (Primary reasoning engine for speed and accuracy)
- **Gemini 1.5 Pro** (Fallback for complex reasoning)
- **Gemini 2.0 Flash** (Experimental integration for low latency)

## 5. GitHub Repository Link
You will need to push your current code to GitHub.
*   **Step 1:** Create a new repository on GitHub.
*   **Step 2:** Run `git remote add origin https://github.com/nithishganesan25/CareerFlow.git` in your terminal.
*   **Step 3:** Run `git push -u origin main`.
*   Link: https://github.com/nithishganesan25/CareerFlow.git

## 6. MVP Link
*   **Option A (Fastest):** Use **Ngrok** to expose your local server temporarily.
*   **Option B (Better):** Deploy Frontend to **Vercel** and Backend to **Render** or **Railway**.
*   [Paste your link here]

---

# 5-Minute Video Presentation Script (Draft)

**[0:00-0:30] The Problem**
"Hi, I'm [Your Name]. Job hunting today is broken. Candidates rely on generic advice, outdated blog posts, and 'black box' ATS systems that reject them without feedback. We built CareerFlow to change that."

**[0:30-1:30] The Solution (Demo Start - Resume Scorer)**
"CareerFlow is an intelligent career companion. Let's start with the Resume Scorer. Unlike basic keyword matchers, we use Gemini 1.5 Flash acting as an 'Elite Recruiter'. I upload my PDF... and within seconds, I get a ruthless, quantitative audit with specific rewriting suggestions and an ATS compatibility score."

**[1:30-3:00] RAG Interview Prep**
"But getting the interview is just step one. Here's our killer feature: The Interview Intelligence Engine. I type 'Google' or 'Amazon'.
*Show the search bar and result page*
Our RAG pipeline fetches real-time interview experiences from the web and synthesizes them into a 4-week study roadmap using Gemini. It's not generic; it's tailored to the specific patterns found *this week*."

**[3:00-4:00] Mock Tests & Architecture**
"We also generate adaptive mock tests to practice those specific topics. Under the hood, we use FastAPI, DuckDuckGo for live context, and a multi-model Gemini architecture to ensure resilience."

**[4:00-4:30] Conclusion**
"CareerFlow doesn't just give you data; it gives you a strategy. We're using Google's AI to level the playing field for job seekers everywhere. Thank you."

