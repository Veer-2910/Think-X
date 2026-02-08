# Think-X Student Dropout Prevention System

A comprehensive AI-powered system designed to predict and prevent student dropouts. The system consists of a React frontend, a Node.js/Express backend, and a Python-based Machine Learning module.

## 🚀 Features

- **Dropout Prediction**: ML model trained to predict at-risk students based on attendance, CGPA, and other metrics.
- **Intervention Management**: Tools for tracking and managing interventions for at-risk students.
- **Dashboard**: Interactive analytics and charts for visualizing student data.
- **AI Integration**: Google Gemini integration for generating personalized student improvement plans and analyzing counselor notes.
- **Reports**: PDF report generation.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Framer Motion
- **Backend**: Node.js, Express, Prisma (PostgreSQL), JWT Auth
- **ML**: Python, Scikit-learn, Pandas, Joblib

## 📋 Prerequisites

- Node.js (v18+ recommended)
- Python (v3.8+ recommended)
- PostgreSQL

## ⚙️ Installation & Setup

### 1. Database Setup
Ensure PostgreSQL is running and create a database for the project.

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/your_database_name"
JWT_SECRET="your_super_secret_key"
GEMINI_API_KEY="your_google_gemini_api_key"
EMAIL_USER="your_email@example.com"
EMAIL_PASS="your_email_password"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
```

Run database migrations and seed data:

```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

### 4. ML Model Setup

Navigate to the ml directory:
```bash
cd ml
pip install -r requirements.txt
```

Train the model (if needed):
```bash
python train_model.py
```

## 📜 Scripts

| Component | Command | Description |
|-----------|---------|-------------|
| Backend | `npm run dev` | Starts backend server with Nodemon |
| Backend | `npx prisma studio` | Opens Prisma Studio to view/edit database |
| Frontend | `npm run dev` | Starts Vite development server |
| Frontend | `npm run build` | Builds frontend for production |

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.
