# CareerFlow: AI-Powered Career Accelerator

![CareerFlow](https://img.shields.io/badge/AI-Powered-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Stack](https://img.shields.io/badge/Stack-FastAPI%20|%20React%20|%20Gemini-orange)

CareerFlow is an intelligent interview preparation platform designed to help candidates crack top-tier tech roles. It leverages **Google's Gemini 1.5 Flash** and real-time **RAG (Retrieval-Augmented Generation)** to provide hyper-personalized interview guides, resume audits, and adaptive mock tests.

## 🚀 Key Features

*   **🔍 RAG Interview Intelligence**: Search for any company (e.g., "Google", "Amazon") and get a real-time, AI-synthesized 4-week preparation roadmap based on actual interview experiences from the web.
*   **📄 Elite Resume Scorer**: Upload your resume (PDF) and get a strict, quantitative audit simulating an elite recruiter. Includes ATS compatibility scores and specific rewrite suggestions.
*   **🧩 Adaptive Mock Tests**: Generate unique, non-repetitive technical quizzes tailored to the company's specific tech stack and interview style.
*   **🤖 Ask AI**: A career-focused chatbot that answers your questions with citations from live web sources.
*   **🔐 Secure & Premium UI**: Built with a sleek dark-mode interface, Framer Motion animations, and secure Firebase Google Authentication.

## 🛠️ Tech Stack

### Backend
*   **Language**: Python 3.10+
*   **Framework**: FastAPI
*   **AI Engine**: Google Gemini 1.5 Flash / Pro (via `google-generativeai`)
*   **Search**: DuckDuckGo Search API (for RAG context)
*   **Tools**: PyPDF2 (Resume Parsing), Uvicorn

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS, Vanilla CSS
*   **Animations**: Framer Motion
*   **Authentication**: Firebase Auth (Google Sign-In)
*   **Icons**: Lucide React

## 🔧 Installation & Setup

### Prerequisites
*   Node.js & npm
*   Python 3.10+
*   Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/careerflow.git
cd careerflow
```

### 2. Backend Setup
```bash
# Navigate to root directory
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "GOOGLE_API_KEY=your_gemini_api_key_here" > .env
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## 🏃‍♂️ Running the App

**Terminal 1 (Backend):**
```bash
# From root directory
python server.py
# Server runs on http://localhost:8001
```

**Terminal 2 (Frontend):**
```bash
# From frontend directory
npm run dev
# App runs on http://localhost:5173
```

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
