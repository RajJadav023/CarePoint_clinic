# CarePoint Clinic — Patient Management System

CarePoint is a simple clinic application built with the MERN stack. It supports the day-to-day flow from registering a patient to booking a visit and recording a completed consultation.

## Technology

- **Database:** MongoDB
- **Backend:** Node.js, Express.js, Mongoose, dotenv, cors, bcryptjs, jsonwebtoken
- **Frontend:** React functional components and hooks, React Router, Vite
- **API requests:** Browser `fetch`, wrapped in a shared frontend service

The assignment originally described Spring Boot/JPA and Angular. This implementation uses the requested MongoDB, Express, React, Node, Mongoose, fetch, and React Router stack. Doctors register with their name, email, phone, and password, then sign in to access clinic screens.

## Features and screens

### Patients — `/patients`

- Register a patient with name, gender, age, and phone.
- List saved patients and search by name or phone.
- Show registration success and validation/API errors.

### Doctor access — `/register` and `/login`

- Register a doctor account with name, email, phone, and password.
- Sign in with email and password; sign out from the clinic navigation.
- Passwords are hashed before storage. A signed, time-limited token is required by clinic APIs.

### Appointments — `/appointments`

- Book an appointment for an existing patient with a doctor, date, and time.
- Show appointments scheduled for today.
- Show appointment status and a **Consult** action for scheduled visits.
- Available doctors: Dr. Rahul Shah, Dr. Priya Patel, and Dr. Amit Mehta.

### Consultation — `/consultation` and `/consultation/:appointmentId`

- Choose from pending appointments only.
- Record blood pressure, temperature in °C, and consultation notes.
- Complete the consultation and change its appointment status to `Completed`.
- Choose a patient with completed visits to view that patient's consultation history.

## Normal user and data flow

1. **Register or sign in as a doctor.** Registration sends name, email, phone, and password to `POST /api/auth/register`; sign-in sends email and password to `POST /api/auth/login`. The backend stores a password hash and returns a signed session token.
2. **Register a patient.** The Patients screen validates the form and sends a JSON `POST /api/patients` request through the shared `fetch` service with the doctor token.
3. **Save the patient.** The Express patient route calls the patient controller. The controller validates the request, creates a Mongoose `Patient`, and returns the saved patient. MongoDB stores it in the `patients` collection.
4. **Book a visit.** The Appointments screen sends the selected patient ID, doctor, date, and time to `POST /api/appointments`. The backend checks the fields and patient, then stores a `Scheduled` appointment in `appointments`.
5. **Open a pending visit.** The Consultation screen loads appointments and the pending-only list. `GET /api/appointments/pending` excludes visits already marked completed or already associated with a consultation.
6. **Complete the visit.** The consultation form sends the appointment ID and clinical details to `POST /api/consultations`. The backend saves a consultation in `consultations` and marks the matching appointment `Completed`.
7. **Review history.** `GET /api/consultations/patients` provides patients that have consultation records. Selecting a patient loads their records from `GET /api/consultations/patient/:patientId`.

In short:

```text
React screen → shared fetch service → Express route → controller
             → Mongoose model → MongoDB collection
             ← JSON response and success/error message
```

## Data models

| Collection | Fields | Purpose |
| --- | --- | --- |
| `doctors` | `name`, `email`, `phone`, `passwordHash`, `createdAt` | Doctor account; password is stored as a hash, not plain text |
| `patients` | `name` (String), `gender` (String), `age` (Number), `phone` (String), `createdAt` (Date) | Patient identity and contact details |
| `appointments` | `patient` (Patient ObjectId), `doctor` (String), `date` (String, `YYYY-MM-DD`), `time` (String, `HH:mm`), `status` (String), `createdAt` (Date) | A patient's booked visit; status starts as `Scheduled` |
| `consultations` | `appointment` (Appointment ObjectId), `patient` (Patient ObjectId), `doctor` (String), `bloodPressure` (String), `temperature` (Number), `notes` (String), `completedAt` (Date) | Clinical details for a completed appointment |

Appointments and consultations store references to related documents. Mongoose `populate` is used where the UI needs patient or appointment details alongside a record. Each appointment can have at most one consultation.

## Validation and API behavior

Validation is applied in the browser for user feedback and again in the backend before database writes.

- **Patient:** name and gender required; age must be a positive whole number; phone must contain exactly 10 digits.
- **Appointment:** patient, doctor, date, and time required; the patient must exist; doctor must be one of the listed doctors; date/time must have valid formats and values.
- **Consultation:** appointment, blood pressure, positive temperature, and notes required; appointment must exist and not already be completed.
- **Doctor registration:** name, valid email, 10-digit phone, and password of at least 8 characters; email and phone must be unique.
- **API errors:** responses include a readable JSON `message` and suitable HTTP status (for example, `400` invalid input, `404` missing record, `409` already completed, `500` unexpected server error).

## API reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Register doctor |
| `POST` | `/auth/login` | Sign in doctor |
| `POST` | `/patients` | Register a patient |
| `GET` | `/patients` | List patients |
| `GET` | `/patients?search=asha` | Search patient name or phone |
| `POST` | `/appointments` | Book an appointment |
| `GET` | `/appointments` | List all appointments |
| `GET` | `/appointments/today` | List appointments dated today |
| `GET` | `/appointments/pending` | List appointments available for consultation |
| `POST` | `/consultations` | Save consultation and complete its appointment |
| `GET` | `/consultations/patients` | List patients who have consultation records |
| `GET` | `/consultations/patient/:patientId` | List one patient's consultation history |

### Test the API in PowerShell

Register or sign in first; save the returned `token` to use in the `Authorization` header for clinic API calls. Save returned `_id` values for subsequent requests.

```powershell
$auth = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:5000/api/auth/register" `
  -ContentType "application/json" `
  -Body (@{
    name = "Dr. Asha Desai"
    email = "asha@clinic.com"
    phone = "9876543210"
    password = "clinicpass123"
  } | ConvertTo-Json)

$headers = @{ Authorization = "Bearer $($auth.token)" }
```

```powershell
$patient = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:5000/api/patients" `
  -ContentType "application/json" `
  -Headers $headers `
  -Body (@{
    name = "Asha Desai"
    gender = "Female"
    age = 34
    phone = "9876543210"
  } | ConvertTo-Json)

$patient
```

Book a visit using that patient's ID:

```powershell
$appointment = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:5000/api/appointments" `
  -ContentType "application/json" `
  -Headers $headers `
  -Body (@{
    patient = $patient._id
    doctor = "Dr. Rahul Shah"
    date = (Get-Date -Format "yyyy-MM-dd")
    time = "10:30"
  } | ConvertTo-Json)

Invoke-RestMethod "http://localhost:5000/api/appointments/today" -Headers $headers
Invoke-RestMethod "http://localhost:5000/api/appointments/pending" -Headers $headers
```

Complete the visit, then view the saved history:

```powershell
$consultation = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:5000/api/consultations" `
  -ContentType "application/json" `
  -Headers $headers `
  -Body (@{
    appointment = $appointment._id
    bloodPressure = "120/80 mmHg"
    temperature = 36.8
    notes = "Follow-up advised."
  } | ConvertTo-Json)

Invoke-RestMethod "http://localhost:5000/api/consultations/patient/$($patient._id)" -Headers $headers
```

You can also search patients with:

```powershell
Invoke-RestMethod "http://localhost:5000/api/patients?search=asha" -Headers $headers
```

No sample records need to be preloaded; register a patient through the app or API.

## Local setup and start

Requirements: Node.js 20.13 or newer and a running local MongoDB instance (or another MongoDB URI).

Install dependencies from the project root:

```powershell
cd backend
npm install
cd ..\frontend
npm install
```

Create `backend/.env` with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/
JWT_SECRET=replace-with-a-long-random-secret
```

The URI above uses MongoDB's default database, `test`. To use a named database, for example `clinic_management`, use `mongodb://localhost:27017/clinic_management`. Set `JWT_SECRET` to a long, random, private value. Keep `.env` private; it is excluded from Git. `backend/.env.example` is a safe template.

The frontend defaults to `http://localhost:5000/api`. To change it, create `frontend/.env` from `frontend/.env.example` and set `VITE_API_URL`.

Run the backend and frontend in **separate terminals**:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

The backend should print **Connected to MongoDB**. Open the frontend URL printed by Vite, usually `http://localhost:5173`. Keep MongoDB and both app processes running while using the application.

## Project structure

```text
backend/
  config/         MongoDB connection
  controllers/    Request validation and data operations
  models/         Patient, Appointment, Consultation schemas
  routes/         REST API routes
  server.js       Express setup and startup
frontend/
  src/components/ Shared navigation and patient UI
  src/pages/      Patients, Appointments, Consultation screens
  src/services/   Centralized fetch API service
  App.jsx         React Router routes
  main.jsx        React entry point
```

## Short project explanation for a demo or interview

> CarePoint is a small MERN clinic management system with doctor registration and login. Passwords are hashed with bcrypt, and a signed token protects the clinic API. A doctor registers a patient, books an appointment for that patient, and records vitals and notes during consultation. Express controllers validate requests and use Mongoose to store related records in MongoDB. Completing a consultation changes the appointment to `Completed`, removes it from the pending list, and makes the consultation available in patient history.

### Common questions

- **Why use MongoDB and Mongoose?** The project uses a document database for its small patient and visit records, with Mongoose schemas, validation, and ObjectId references to keep the data shape clear.
- **How does doctor authentication work?** Registration validates the doctor's details and hashes their password. Login compares the submitted password to the hash and returns a signed, expiring JWT. Protected API routes verify that token.
- **How are pending visits identified?** The pending endpoint returns appointments with `Scheduled` status and excludes appointments that already have consultation records.
- **How is invalid data handled?** The frontend gives immediate feedback; backend controllers repeat validation and return an error message with an appropriate HTTP status.
- **How is a consultation connected to a patient?** It stores both the appointment and patient ObjectIds, along with a copy of the doctor, so history can be queried by patient and populated with visit details.
- **What would you improve for production?** Add authentication and role-based access, audit logging, automated tests, stricter clinical data access controls, and a MongoDB transaction around saving a consultation and completing its appointment.
