# 🧠 EverMind – Alzheimer Care Platform

## Overview

**EverMind** is a full-stack, microservices-based web application dedicated to Alzheimer's patient care. It enables healthcare professionals and caregivers to monitor patients, conduct cognitive and autonomy assessments, manage alerts and interventions, handle medical supplies, and communicate securely — all from a unified platform.

> Developed as part of **PIDEV – 4A** at **Esprit School of Engineering – Tunisia** (Academic Year 2025–2026).

---

## ✨ Features

| Module | Description |
| :--- | :--- |
| **Patient Management** | Comprehensive patient profiles, caregiver assignment, medical reports, and GPS tracking |
| **Alert System & IoT Simulation** | Real-time alerts triggered by simulated IoT sensors (fall detection, geo-fencing) with predictive analysis |
| **Cognitive Assessments** | Tools to evaluate and track patient cognitive decline over time with dashboard visualizations |
| **Autonomy Tracking** | Monitor daily living activities and autonomy levels with per-patient dashboards |
| **Stock & Product Management** | Full e-commerce flow — product catalog, categories, cart, wishlist, comparison, ordering, and admin analytics |
| **Intervention & Medical Agenda** | Schedule and log medical interventions; manage medical appointments |
| **AI Chatbot** | Gemini-powered assistant that queries across the platform's databases for doctors and caregivers |
| **Secure Communication** | Built-in real-time messaging between caregivers and medical professionals |
| **Reclamation System** | Submit, track, and resolve user complaints |
| **User & Auth Management** | JWT authentication, email verification, role-based access (Admin / Doctor / Caregiver), face recognition login |
| **Login Auditing** | Asynchronous login event logging via RabbitMQ |

---

## 🏗️ Architecture

The platform is built on a **Microservices Architecture** orchestrated via Docker Compose. Key architectural components:

- **Eureka Discovery Server** — All microservices register themselves for dynamic service discovery.
- **Spring Cloud Gateway** — Single entry point (`localhost:8090`) that routes requests to the correct microservice.
- **RabbitMQ** — Asynchronous, event-driven communication (e.g., login event auditing).
- **Per-service databases** — Each microservice has its own isolated PostgreSQL database.

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────────────────────┐
│   Angular    │──────▶│   Gateway    │──────▶│  Eureka Discovery Server         │
│  Frontend    │       │   :8090      │       │  :8761                           │
└──────────────┘       └──────┬───────┘       └──────────────────────────────────┘
                              │                         ▲
                    ┌─────────┼─────────┐               │  (service registration)
                    ▼         ▼         ▼               │
              ┌──────┐  ┌──────┐  ┌──────┐         ┌────┴────┐
              │User  │  │Alert │  │Stock │  ...     │RabbitMQ │
              │:8082 │  │:8081 │  │:8095 │         │:5672    │
              └──┬───┘  └──┬───┘  └──┬───┘         └─────────┘
                 │         │         │
                 ▼         ▼         ▼
              ┌──────────────────────────┐
              │   PostgreSQL :5433       │
              │  (isolated DB per svc)   │
              └──────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| Angular | 21.x | Main SPA framework |
| TypeScript | ~5.9 | Type-safe development |
| Chart.js / ng2-charts | 4.x / 8.x | Analytics & dashboard visualizations |
| SweetAlert2 | 11.x | User notifications & confirmations |
| ng-recaptcha-2 | 21.x | Bot protection on forms |
| Angular SSR | 21.x | Server-side rendering support |

### Backend
| Technology | Purpose |
| :--- | :--- |
| Java 17 & Spring Boot | Core microservice framework |
| Spring Cloud Gateway | API routing & load balancing |
| Spring Cloud Netflix Eureka | Service discovery & registration |
| Spring Security + JWT | Authentication & authorization |
| RabbitMQ | Async event-driven messaging |
| Python (Flask) | Stock analytics microservice |
| FastAPI (Python) | Face recognition service |
| Google Gemini API | AI chatbot integration |

### Database & Infrastructure
| Technology | Purpose |
| :--- | :--- |
| PostgreSQL 15 | Relational database (one schema per microservice) |
| Docker & Docker Compose | Container orchestration (20+ services) |
| Jenkins | CI/CD pipeline with parallel builds & SonarQube |
| GitHub Actions | Per-service CI workflows |
| Kubernetes (k8s) | Deployment manifests for cloud orchestration |
| Prometheus | Metrics collection (`/actuator/prometheus`) |
| Grafana | Monitoring dashboards & alerting |
| SonarQube | Static code analysis & quality gates |

---

## 📦 Microservices

| Service | Port | Database | Description |
| :--- | :--- | :--- | :--- |
| **Eureka Server** | 8761 | — | Service discovery registry |
| **API Gateway** | 8090 | — | Request routing & load balancing |
| **User Service** | 8082 | `User` | Auth, JWT, email verification, face recognition |
| **LoginLog Service** | 8100 | `loginlog` | Async login audit via RabbitMQ |
| **Patient Service** | 8084 | `Patient` | Patient CRUD & caregiver relationships |
| **Profile Service** | 8085 | `Profile` | User profile management |
| **Alert Service** | 8081 | `Alert` | Alert CRUD & notifications |
| **Sensor Simulator** | 8089 | `SensorSimulator` | IoT sensor data simulation |
| **Intervention Service** | 8086 | `Intervention` | Medical intervention logging |
| **Conversation Service** | 8088 | `Conversation` | Real-time messaging |
| **Autonomy Service** | 8097 | `autonomy` | Daily living activity tracking |
| **Cognitive Assessment** | 8098 | `cognitive_assessment` | Cognitive test management |
| **Stock Service** | 8095 | `alzheimer_stock` | Product & inventory management |
| **Stock Analytics** | 8083 | `alzheimer_stock` | Python-based analytics engine |
| **Product Service** | 8087 | `Product` | Product catalog service |
| **Chatbot Service** | 8099 | `Chatbot` | Gemini AI-powered assistant |
| **Agenda Medical** | 8101 | `agendamedical` | Medical appointment scheduling |
| **Reclamation Service** | 8096 | `Reclamation` | Complaint management |
| **Face Service** | 8000 | — | Face recognition (FastAPI / Python) |
| **Frontend** | 4200 | — | Angular SSR application |

### Supporting Services

| Service | Port | Purpose |
| :--- | :--- | :--- |
| **PostgreSQL** | 5433 | Shared database server |
| **RabbitMQ** | 5672 / 15672 | Message broker & management UI |
| **Prometheus** | 9090 | Metrics scraping |
| **Grafana** | 3000 | Monitoring dashboards |

---

## 🚀 Getting Started

### Prerequisites

- **Docker** & **Docker Compose** (recommended for full deployment)
- **Java Development Kit (JDK)** 17+
- **Maven** 3.9+
- **Node.js** 18+ & **npm**
- **Angular CLI** (`npm install -g @angular/cli`)
- **Python** 3.x (for stock analytics & face service)

### Option 1: Docker Compose (Recommended)

Launch the entire platform with a single command:

```bash
git clone <repository-url>
cd EverMind
docker-compose up --build
```

This starts **all 20+ services**, databases, message broker, and monitoring tools. Once running:

| URL | Service |
| :--- | :--- |
| `http://localhost:4200` | Frontend (Angular) |
| `http://localhost:8090` | API Gateway |
| `http://localhost:8761` | Eureka Dashboard |
| `http://localhost:15672` | RabbitMQ Management (guest/guest) |
| `http://localhost:9090` | Prometheus |
| `http://localhost:3000` | Grafana (admin/admin) |

### Option 2: Manual Setup

1. **Start the Database:**
   ```bash
   # Ensure PostgreSQL is running with the databases created via Backend/init-db.sh
   ```

2. **Start Infrastructure Services (in order):**
   ```bash
   # 1. Eureka Server
   cd Backend/Eureka/EurekaServer && mvn spring-boot:run

   # 2. API Gateway
   cd Backend/Gateway && mvn spring-boot:run

   # 3. RabbitMQ (via Docker or local install)
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```

3. **Start Domain Microservices:**
   ```bash
   # Start each service individually, e.g.:
   cd Backend/User/User && mvn spring-boot:run
   cd Backend/Alert/Alert && mvn spring-boot:run
   cd Backend/Patient/Patient && mvn spring-boot:run
   # ... repeat for all required services
   ```

4. **Start the Frontend:**
   ```bash
   cd Frontend/alzheimer-care-web
   npm install
   ng serve
   ```
   Open your browser at `http://localhost:4200/`.

---

## 🔄 CI/CD Pipeline

### Jenkins
The project includes a comprehensive `Jenkinsfile` that:
- Builds the **Eureka Server** first
- Builds all **Spring Boot microservices** in parallel
- Builds the **Angular frontend**
- Runs **SonarQube** static code analysis

### GitHub Actions
Per-service CI workflows in `.github/workflows/`:
- `ci-eureka.yml`, `ci-gateway.yml`, `ci-frontend.yml`
- `ci-user-service.yml`, `ci-alert-service.yml`, `ci-patient-service.yml`
- `ci-intervention-service.yml`, `ci-stock-service.yml`, `ci-sensor-simulator.yml`

---

## 📊 Monitoring

- **Prometheus** scrapes metrics from all Spring Boot services via `/actuator/prometheus` every 15 seconds.
- **Grafana** provides real-time dashboards and alerting on top of Prometheus data.

---

## 📁 Project Structure

```
EverMind/
├── Backend/
│   ├── Eureka/              # Service discovery server
│   ├── Gateway/             # API gateway
│   ├── User/                # User & auth service
│   ├── LoginLog/            # Login audit service
│   ├── Patient/             # Patient management
│   ├── Profile/             # User profiles
│   ├── Alert/               # Alert system
│   ├── SensorSimulator/     # IoT sensor simulation
│   ├── Intervention/        # Medical interventions
│   ├── CognitiveAssessment/ # Cognitive testing
│   ├── Autonomy/            # Autonomy tracking
│   ├── Conversation/        # Messaging service
│   ├── Stock/               # Stock mgmt + Python analytics
│   ├── Product/             # Product catalog
│   ├── Chatbot/             # AI assistant
│   ├── AgendaMedical/       # Medical scheduling
│   ├── Reclamation/         # Complaints system
│   ├── Formation/           # Training module
│   ├── MemoryBankService/   # Memory bank features
│   ├── face-service/        # Face recognition (Python)
│   ├── k8s/                 # Kubernetes manifests
│   └── init-db.sh           # Database initialization script
├── Frontend/
│   └── alzheimer-care-web/  # Angular 21 application
├── Monitoring/
│   └── prometheus.yml       # Prometheus scrape config
├── .github/workflows/       # GitHub Actions CI pipelines
├── docker-compose.yml       # Full-stack orchestration
├── Jenkinsfile              # Jenkins CI/CD pipeline
└── README.md
```

---

## 👥 Contributors

The EverMind Team — Esprit School of Engineering, Tunisia

## 📄 Academic Context

- **Program:** PIDEV – 4A Engineering Project
- **Institution:** Esprit School of Engineering – Tunisia
- **Academic Year:** 2025–2026

## 🙏 Acknowledgments

We would like to thank our instructors and mentors at **Esprit School of Engineering** for their guidance and support throughout this PIDEV project.
