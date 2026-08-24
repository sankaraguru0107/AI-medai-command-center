# 🏥 MedAI Command Center

> Enterprise-grade Healthcare AI Platform powered by **FastAPI**, **MySQL**, & **Azure OpenAI GPT-4**

![MedAI Command Center](https://img.shields.io/badge/MedAI-Command%20Center-0c90e6?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql)
![Azure OpenAI](https://img.shields.io/badge/Azure-OpenAI%20GPT--4-0078D4?style=for-the-badge&logo=microsoftazure)

---

## 📋 Overview

MedAI Command Center is a modular, production-ready healthcare AI platform that unifies:

- **11+ Clinical Modules** (RCM, ICU monitoring, medication safety, diagnostics, SOC security, and more)
- **5 Role-based Dashboards** (Admin, Doctor, Nurse, Operations, Patient)
- **FastAPI + MySQL Backend** with SQLAlchemy ORM, Pydantic schemas, and REST endpoints
- **Real Azure OpenAI GPT-4** integration for clinical decision support
- **Google-Caliber UI/UX** with glassmorphism, Framer Motion animations, and live metrics

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ & npm
- Python 3.10+ & MySQL Server (or MySQL Workbench with `medai_db` schema)

### 1. Configure Environment Files

Configure your API keys directly in `.env`:

#### Root `.env` (Frontend):
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
VITE_AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-4
VITE_AZURE_OPENAI_API_VERSION=2024-02-01
```

#### Backend `.env` (`backend/.env`):
```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/medai_db
SECRET_KEY=medai_secret_key_super_secure_12345
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]
```

---

### 2. Start FastAPI Backend (Python)

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
> Note: If Windows blocks `pip.exe`, use `python -m pip` as shown above.

---

### 3. Start React Frontend

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.
# AI-medai-command-center
