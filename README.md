# CarePoint Clinic

CarePoint is a small clinic management app for registering patients, booking visits, and recording consultations.

## What it does

- Register patients and search by name or phone. Name, gender, positive age, and a 10-digit phone number are required.
- Book appointments with one of the available doctors: Dr. Rahul Shah, Dr. Priya Patel, or Dr. Amit Mehta.
- View today's schedule and open a pending appointment for consultation.
- Record blood pressure, temperature, and notes. Completing a consultation marks the appointment completed and saves it in the patient's history.

## Run locally

Requirements: Node.js 20.13 or newer and a running local MongoDB.

1. Install backend and frontend dependencies:

   ```powershell
   cd backend
   npm install
   cd ..\frontend
   npm install
   ```

2. Ensure `backend/.env` contains your MongoDB connection and backend port:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/
   ```

   For a fresh setup, copy `backend/.env.example` to `backend/.env`. The example frontend configuration uses `http://localhost:5000/api`; copy `frontend/.env.example` to `frontend/.env` if needed.

3. Start the backend and frontend in separate terminals from the project folder:

   ```powershell
   cd backend
   npm run dev
   ```

   ```powershell
   cd frontend
   npm run dev
   ```

4. Open the local URL printed by Vite, usually `http://localhost:5173`.

The backend terminal should report **Connected to MongoDB**. Keep MongoDB and both app terminals running while using CarePoint.

## How the app works

**Patient → Appointment → Consultation:** Register a patient first. Book a dated appointment for that patient and a doctor. Open a pending appointment from the Consultation screen, enter the visit details, and complete it. Its status changes from `Scheduled` to `Completed`, and the saved record appears in consultation history.

**Frontend flow:** React Router displays the Patients, Appointments, and Consultation screens. React hooks manage form values, loading indicators, and success or error messages. A shared `fetch` service sends requests to the backend.

**Backend flow:** Express routes send API requests to controllers. Controllers validate input and use Mongoose models to save or read MongoDB records. Consultation completion saves the consultation and updates the related appointment.

## Main API routes

Base URL: `http://localhost:5000/api`

- `POST /patients`, `GET /patients`, `GET /patients?search=value`
- `POST /appointments`, `GET /appointments`, `GET /appointments/today`, `GET /appointments/pending`
- `POST /consultations`, `GET /consultations/patients`, `GET /consultations/patient/:patientId`
