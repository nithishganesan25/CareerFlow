# CareerFlow Enhancement Update

We have successfully upgraded the CareerFlow application with the following features:

## 1. Company Interview Roadmap
- **New Feature**: Added a detailed 4-week preparation roadmap for every company analysis.
- **Visuals**: The "Company" view now displays a week-by-week breakout of focus areas and actionable details.
- **Backend**: Updated `server.py` to prompt the AI for this specific structured data.

## 2. Robust Authentication (Firebase)
- **Login/Register**: Full email/password and Google Sign-In integration.
- **Notifications**: 
    - **Registration**: Automatically sends a verification email to the user (via Firebase Auth).
    - **Login**: Secure Google Sign-In with Gmail scope integration.
- **Profile Management**: Users can now update their "Display Name" in the newly created **Settings** page.

## 3. Resume Scoring V2 - PDF Support
- **PDF Upload**: You can now upload PDF files directly.
- **Enhanced Analysis**: The scoring engine now acts as a "Senior Executive Recruiter", providing:
    - Content Excellence Score
    - ATS Optimization Score
    - Professional Presentation Score
    - Specific formatting and keyword feedback.

## 4. How to Run
Ensure both servers are running:

**Backend (Python):**
```bash
uvicorn server:app --reload --port 8001
```

**Frontend (React):**
```bash
cd frontend
npm run dev
```

## 5. Notes
- The "Inbox Scout" feature requires you to sign in with Google to grant Read-Only access to your Gmail.
- Resume uploads support standard text-based PDFs. Image-based PDFs (scans) may need OCR (future enhancement).
