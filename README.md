# Skillpath — Your path from skills to career

Skillpath is an enterprise-grade AI-powered personalized learning platform with a multi-agent backend architecture. It connects an individual's existing technical competencies with target industry career requirements through automated diagnostics, topological learning roadmap synthesis, and adaptive remediation.

---

## ⚡ Quick Start

### 1. Run the Backend API (FastAPI + SQLite)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*Note: SQLite database (`skillbridge.db`) auto-seeds on first startup with demo user **Arjun Kumar**.*

### 2. Run the Frontend (React + Vite + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
### 3. Google Sign-In Setup (OAuth 2.0)
To enable real Google Identity Services account selection:
1. Go to **Google Cloud Console** -> **APIs & Services** -> **Credentials**.
2. Click **Create Credentials** -> **OAuth client ID**.
3. Select **Web application**.
4. Under **Authorized JavaScript origins**, add: `http://localhost:5173`.
5. Under **Authorized redirect URIs**, add: `http://localhost:5173`.
6. Copy the **Client ID** into both environment files:
   - `frontend/.env`: `VITE_GOOGLE_CLIENT_ID="<YOUR_CLIENT_ID>.apps.googleusercontent.com"`
   - `backend/.env`: `GOOGLE_CLIENT_ID="<YOUR_CLIENT_ID>.apps.googleusercontent.com"`
7. *(Optional)* If `GOOGLE_CLIENT_ID` is unset, Skillpath gracefully provides an interactive account chooser with demo profiles and the instant demo account login.

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🏗️ Architecture & Multi-Agent Architecture

Skillpath is driven by seven specialized learning agent classes coordinated by a master Orchestrator:

1. **SkillAnalyzerAgent**: Calculates multidimensional 0–100 proficiency ratings, radar telemetry, strengths, and blind spots.
2. **CareerMatchingAgent**: Audits profile against enterprise role taxonomies using weighted multi-criteria decision models.
3. **LearningPathAgent**: Synthesizes phased topological roadmaps respecting strict directional prerequisite dependencies.
4. **AssessmentAgent**: Dispatches technical diagnostic question batteries, grades submissions, and isolates weak topics.
5. **ProgressTrackerAgent**: Monitors completion velocity, streak continuity, pace milestones, and learning telemetry.
6. **MentorAgent**: Delivers contextual pedagogical advice, explains concepts, and updates active curriculum parameters.
7. **ResumeAgent**: Compiles ATS-compliant resumes strictly from verified learner data, diagnostic scores, and role taxonomies without hallucinating facts.
8. **OrchestratorAgent**: Routes lifecycle events (`PROFILE_UPDATED`, `GOAL_CHANGED`, `ASSESSMENT_SUBMITTED`, `RESUME_UPLOADED`, `RESUME_REQUESTED`, `MENTOR_QUERY`).

### Dual Execution Mode:
- **Live AI**: Powered by Google Gemini (`GEMINI_API_KEY` and `GEMINI_MODEL="gemini-2.0-flash"`).
- **Deterministic Offline Mode**: Fully functional offline fallback using rule-based topological sort, prerequisite graph algorithms, and evaluation heuristics.

---

## 🎯 Key Features & Differentiators

- **Career Readiness Score (0-100)**: Composite metric combining Role Match (40%), Assessment Mastery (30%), Curriculum Progress (20%), and Consistency (10%).
- **Time-to-Ready Estimator**: Interactive commitment slider (2 to 30 hrs/wk) with live calendar target date projections.
- **What-If Simulator**: Sandbox preview comparing prospective roles without committing state.
- **Explainable AI Drawer**: "Why this?" rationale for every recommendation with confidence meters and audit trails.
- **Agent Consensus View**: Multi-agent deliberation traces for curriculum re-sequencing.
- **Interactive Skill Graph**: SVG prerequisite dependency graph with status-coded nodes.
- **Resume Gap Analyzer**: Ingests resume text to extract skills and recalculate gap vectors.
- **Spaced-Repetition Revision**: Weak concepts resurface automatically at 1, 3, and 7 day intervals.
- **Enterprise Cohort Analytics**: Admin view with deficit heatmaps across 40 seeded learners and CSV export.
- **Verifiable Skill Passport**: Portable certificate page (`/passport/:id`) with QR verification and print stylesheet.

---

## 🧪 Running Automated Tests

Run backend agent and adaptive remediation tests:
```bash
cd backend
python3 -m pytest tests/
```
All 7 tests validate:
- Diagnostic skill profiling
- Career compatibility weighting
- Prerequisite-ordered roadmap compilation
- Adaptive remediation on quiz underperformance (<60%)
- Accelerated mastery on quiz success (≥85%)
- Dynamic goal adaptation
- State isolation during What-If simulations

