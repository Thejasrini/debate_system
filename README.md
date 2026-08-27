# LexAgent — AI-Powered Consumer Dispute Adjudication System

**LexAgent** is an autonomous, multi-agent adversarial legal intelligence system tailored for the **Consumer Protection Act, 2019 (CPA 2019)** in India. It models real-world courtroom proceedings using an adversarial petitioner counsel (Support Agent), respondent counsel (Oppose Agent), a 2-layer statutory grounding validator, and an impartial judicial bench agent producing formal IRAC court orders and PDF exports.

---

## 🏛️ System Architecture

```
User Query (Intake Form / API)
       │
       ▼
 01. Intent Classifier Agent  ──► Classifies dispute into CPA 2019 Jurisdiction
       │
       ▼
 02. Case Reasoning Agent     ──► Extracts material facts, legal issues & statutory elements
       │
       ▼
 03. Closed-Book FAISS RAG    ──► Retrieves 3,638 self-contained statutory chunks & precedents
       │
       ├─────────────────────────────────────┐
       ▼                                     ▼
 04. Support Counsel Agent (Petitioner)   05. Oppose Counsel Agent (Respondent)
       │                                     │
       └──────────────────┬──────────────────┘
                          ▼
            06. Semantic Grounding Layer
            (Layer 1 Regex + Layer 2 LLM Entailment)
                          │
                          ▼
             07. Judicial Bench Agent
             (IRAC Verdict & PDF Court Order)
```

---

## ✨ Key Features

- **Adversarial Legal Debate**: Simulates Petitioner Counsel (Support) and Respondent Counsel (Oppose) arguing under statutory sections (e.g. Section 2(10), Section 39, Section 87).
- **Closed-Book FAISS Vector RAG**: 3,638 normalized statutory chunks embedded locally to prevent LLM hallucinations.
- **2-Layer Statutory Grounding Validator**:
  - **Layer 1**: Deterministic regex checker verifying citations against 3,622 normalized legal records.
  - **Layer 2**: NLI-based semantic entailment checker categorizing claim sentences as `entailed`, `contradicted`, or `unsupported`.
- **Sub-30 Second Response Latency**: Parallelized claim entailment checks and fast local FAISS vector similarity search (measured benchmark: **14.2s**).
- **Formal PDF Verdict Export**: Server-side court-formatted adjudication order generator using `pdfkit`.
- **Interactive D3 Citation Graph**: Visualizes co-citation networks between statutory sections, precedents, and rules.
- **Admin Analytics Dashboard (`/admin`)**: Interactive Recharts visualizations tracking query volume, category distribution, confidence trends, grounding interventions, and user feedback.
- **Full JWT Auth & History**: Secure password hashing with `bcryptjs`, access/refresh tokens, user thread management, and rate limiting.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend Runtime** | Node.js (ES Modules, Express.js) |
| **Database** | MongoDB (Mongoose ODM) |
| **Vector Index** | FAISS (Embedded local binary search) |
| **LLM Provider** | Google Gemini (`gemini-2.5-flash` primary with candidate rotation) |
| **PDF Generator** | PDFKit |
| **Frontend Framework** | React (Vite 8, React Router v7) |
| **Design System** | Custom CSS Tokens (Dark/Light Modes, Fraunces/Inter/IBM Plex Mono Fonts) |
| **Data Visualization** | D3.js (Citation Graph) & Recharts (Admin Analytics) |
| **Testing** | Jest (100% pass rate across 6 test suites) |
| **Rate Limiting** | `express-rate-limit` |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18.0.0 or higher
- MongoDB running locally on `mongodb://127.0.0.1:27017`
- Google Gemini API Key

### 1. Backend Setup
```bash
cd backend
npm install --legacy-peer-deps
cp .env.example .env
# Fill in GEMINI_API_KEY and JWT_SECRET in .env
node server.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

The web application will be accessible at **[http://localhost:5173/](http://localhost:5173/)** and backend API at **`http://127.0.0.1:5000`**.

---

## 🧪 Testing & Verification

Run the complete Jest test suite inside `backend/`:
```bash
cd backend
npm test
```
**Test Results**: `6/6 Test Suites Passed, 19/19 Tests Passed (100% Pass Rate)`.

---

## 📊 Evaluation & Benchmark Harness

Run the paper evaluation harness comparing System A (Baseline Direct LLM) vs System B (LexAgent RAG + Debate + Grounding):
```bash
cd backend
node eval/runPaperEvaluation.js
```
Generates comparative metrics report at `backend/eval/results/report.md`.

---

## 🛡️ License

Developed as a Research Project for Consumer Protection Legal Intelligence. All rights reserved © 2026.
