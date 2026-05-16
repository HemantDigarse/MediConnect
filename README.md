# 🏥 MediConnect — Telemedicine Platform

A production-ready, full-stack telemedicine platform enabling patients to consult doctors via secure HD video calls, book appointments, manage health records, and receive digital prescriptions.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| **Database** | PostgreSQL 16 + Flyway Migrations |
| **Cache / Sessions** | Redis 7 |
| **Auth** | JWT (access + refresh tokens), BCrypt |
| **Payments** | Razorpay (HMAC-SHA256 signature verification) |
| **Real-time** | Spring WebSocket / STOMP + SockJS |
| **Video** | WebRTC via PeerJS |
| **Storage** | AWS S3 (prescriptions, lab reports) |
| **Notifications** | JavaMailSender (HTML email), Twilio SMS |
| **PDF** | iText 8 prescription generation |
| **Frontend** | React 18, JavaScript (JSX), Vite 5 |
| **State** | Redux Toolkit |
| **Styling** | Tailwind CSS 3 |
| **Testing** | JUnit 5 + Mockito (backend), Jest + RTL (frontend) |
| **Container** | Docker + Docker Compose |
| **API Docs** | SpringDoc OpenAPI / Swagger UI |

---

## 📁 Project Structure

```
TelemedicinePlatform/
├── backend/                        # Spring Boot backend
│   ├── src/main/java/com/mediconnect/
│   │   ├── config/                 # Security, Redis, WebSocket, Swagger configs
│   │   ├── controller/             # REST & WebSocket controllers
│   │   ├── dto/                    # Request/Response DTOs
│   │   ├── entity/                 # JPA entities
│   │   ├── exception/              # Global exception handler
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── scheduler/              # Appointment reminder cron job
│   │   ├── security/               # JWT filter, JwtUtil
│   │   ├── service/                # Business logic services
│   │   └── util/                   # S3Util, PdfGenerator
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/V1__init_schema.sql
│   └── Dockerfile
├── frontend/                       # React + Vite frontend
│   ├── src/
│   │   ├── api/                    # Axios instance with JWT interceptor
│   │   ├── components/             # Navbar, Footer, Cards, Skeletons
│   │   ├── pages/                  # All route pages
│   │   ├── store/                  # Redux store + slices
│   │   └── __tests__/             # Jest + RTL tests
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚡ Quick Start (Local Dev)

### Prerequisites
- Java 17+, Maven 3.9+
- Node.js 20+, npm
- PostgreSQL 16 running locally (or Docker)
- Redis 7 running locally (or Docker)

### 1. Clone & Configure

```bash
git clone https://github.com/yourname/mediconnect.git
cd mediconnect
cp .env.example .env
# Edit .env with your credentials
```

### 2. Start Backend

```bash
cd backend
# Create the database first
psql -U postgres -c "CREATE DATABASE mediconnect;"
# Run the app (Flyway auto-runs migrations)
mvn spring-boot:run
# API available at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

---

## 🐳 Docker Deployment (Full Stack)

```bash
cp .env.example .env
# Fill in all required env vars in .env
docker compose up --build -d
# App live at http://localhost
# API at http://localhost/api
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|---|---|
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | HMAC-SHA256 secret (min 256-bit) |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `AWS_ACCESS_KEY` | AWS IAM access key |
| `AWS_S3_BUCKET` | S3 bucket name for file storage |
| `MAIL_USERNAME` | SMTP email address |
| `MAIL_PASSWORD` | SMTP app password |
| `TWILIO_ENABLED` | Set `true` to enable SMS |

---

## 🛡️ API Endpoints

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register patient or doctor |
| POST | `/api/auth/login` | Public | Login, returns JWT tokens |
| GET | `/api/doctors` | Public | Search doctors with filters |
| GET | `/api/doctors/:id` | Public | Doctor profile |
| POST | `/api/appointments` | PATIENT | Book appointment |
| POST | `/api/appointments/:id/payment/verify` | PATIENT | Verify Razorpay payment |
| PATCH | `/api/appointments/:id/confirm` | DOCTOR | Confirm appointment |
| POST | `/api/consultations/start/:appointmentId` | DOCTOR/PATIENT | Start video session |
| POST | `/api/consultations/:id/prescription` | DOCTOR | Issue prescription PDF |
| GET | `/api/records/patient/:id` | PATIENT/DOCTOR | Health profile |
| POST | `/api/records/lab-report` | PATIENT | Upload lab report to S3 |
| GET | `/api/admin/stats` | ADMIN | Platform statistics |
| WS | `/ws` (STOMP) | Auth | Real-time chat |

> Full interactive docs: `http://localhost:8080/swagger-ui.html`

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
mvn test

# Frontend tests
cd frontend
npm test
npm test -- --coverage
```

---

## 📋 Features

- ✅ **JWT Auth** — 15-min access + 7-day refresh tokens stored in Redis
- ✅ **Role-based Access** — PATIENT, DOCTOR, ADMIN
- ✅ **Doctor Search** — Filter by specialty, city, fee range, rating
- ✅ **Slot Management** — Doctors add availability, patients book slots
- ✅ **Razorpay Payments** — Order creation + HMAC signature verification
- ✅ **HD Video Call** — WebRTC via PeerJS with STUN servers
- ✅ **Real-time Chat** — STOMP WebSocket in-consultation messaging
- ✅ **Digital Prescriptions** — iText PDF generation + S3 storage
- ✅ **Lab Report Upload** — Multipart S3 upload
- ✅ **Email Reminders** — HTML email 1 hour before appointments
- ✅ **SMS Notifications** — Twilio (opt-in, graceful mock fallback)
- ✅ **Admin Panel** — User management + platform analytics
- ✅ **Docker Compose** — One-command full stack deployment

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file for details.
