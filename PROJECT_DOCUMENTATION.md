# 🧠 EverMind — Technical Documentation & Architecture Overview

EverMind is a comprehensive, microservices-based application designed to support Alzheimer's patients, their caregivers, and medical professionals. This document explains the primary technologies, microservice components, and how they function together.

---

## 🏗️ 1. Core Architecture & Technologies

EverMind uses a **Microservices Architecture**. Instead of having one massive application, the project is divided into small, independent services that run on their own and communicate with each other.

### Technologies Used

| Category | Technology | Why it's used |
| :--- | :--- | :--- |
| **Backend Framework** | **Java & Spring Boot** | Used to build all backend microservices. Provides strong dependency injection, REST APIs, and enterprise-grade security. *(Reference: `Backend/User/User/pom.xml`)* |
| **Frontend Framework**| **Angular** | A TypeScript-based web framework used for the main Patient/Caregiver dashboard. *(Reference: `Frontend/alzheimer-care-web/package.json`)* |
| **Database** | **PostgreSQL** | A relational database. To adhere to microservice best practices, we use **one database schema per microservice**. *(Reference: `Backend/init-db.sh`)* |
| **Service Discovery** | **Netflix Eureka** | Acts as a phonebook. Services register themselves here so they can find each other without hardcoding IP addresses. *(Reference: `Backend/Eureka/EurekaServer`)* |
| **API Gateway** | **Spring Cloud Gateway**| The single entry point for the frontend. It routes incoming requests (e.g., `localhost:8090/auth/...`) to the correct underlying microservice `localhost:8082`. *(Reference: `Backend/Gateway`)* |
| **Messaging broker** | **RabbitMQ** | Used for asynchronous, event-driven communication between services. *(Reference: `Backend/LoginLog/LoginLog/src/main/java/tn/esprit/loginlog/config/RabbitMQConfig.java`)* |
| **Containerization** | **Docker & Compose** | Every service runs inside a Docker container. `docker-compose.yml` launches all 15+ services, databases, and monitoring tools automatically. *(Reference: `docker-compose.yml`)* |
| **Monitoring** | **Prometheus & Grafana**| Prometheus scrapes metrics (`/actuator/prometheus`) and Grafana visualizes them in dashboards. *(Reference: `Monitoring/prometheus.yml`)* |
| **Artificial Intelligence**| **Google Gemini API** | Used to provide an intelligent Chatbot or RAG application that queries medical context. *(Reference: `Backend/Chatbot/...` & `docker-compose.yml` ENV vars)* |

---

## ⚙️ 2. Core Microservices

Here is an overview of the primary microservices and what they do. 

### 1. User Service (Authentication & Identity)
- **Role**: Handles User creation (Admin, Doctor, Caregiver), JWT generation, and email verification.
- **Key Code**: `AuthenticationServiceImpl.java` processes logins, validates passwords, and issues a JWT token.

### 2. LoginLog Service (Auditing)
- **Role**: A standalone service that listens to login events over RabbitMQ and stores a history of who logged in and when.
- **Key Code**: `LoginEventConsumer.java` uses the `@RabbitListener` annotation to consume messages from the User service.

### 3. Patient & Profile Services
- **Role**: Manages the core medical and personal data of the Alzheimer's patients. Handles their relationships with caregivers.

### 4. Alert & SensorSimulator Services
- **Role**: Simulates real-time IoT sensors (like GPS movement or fall detection) and triggers alerts if the patient wanders outside a safe zone.

### 5. Chatbot Service
- **Role**: Integrates with the Google Gemini AI. Allows natural language queries across the platform's databases to act as an assistant for doctors or family members.

### 6. Intervention & CognitiveAssessment Services
- **Role**: Allows medical professionals to schedule and log interventions, and track the progression of the patient's cognitive decline over time.

---

## 🔄 3. How Different Features Work (Flows)

### 🔐 Feature 1: Asynchronous Login Logging (RabbitMQ)
**Goal:** When a user logs in, we need to save it to an audit database *without* slowing down the login process.

1. **Frontend** sends a POST request with email/password to `Gateway` (:8090).
2. **Gateway** routes it to **User Service** (:8082).
3. **User Service** validates the user (`AuthenticationServiceImpl.java`), creates a JWT token, and sends a `LoginEventDTO` payload to **RabbitMQ**'s `login.exchange`.
4. **User Service** immediately returns the JWT to the Frontend.
5. In the background, the **LoginLog Service** (:8100) picks the message up from `login.queue` and writes a row to its PostgreSQL database.

### 🧠 Feature 2: Service Discovery (Eureka)
**Goal:** Services shouldn't need to know each other's IP addresses, especially since Docker IPs can change.

1. When the **User Service** starts up, it tells **Eureka**: *"I am USER-SERVICE and I live at 172.19.0.7:8082"*.
2. The **Gateway** receives a request mapped to `/auth/login`.
3. The Gateway asks **Eureka**: *"Where is the USER-SERVICE?"*
4. Eureka replies with the IP address.
5. The Gateway forwards the request. This means your Spring configurations rely on the logical name (`lb://USER`) rather than static IPs.

### 🐳 Feature 3: Local Deployment (Docker Compose)
**Goal:** Launch 15 complicated interconnected applications with one command.

1. The `docker-compose.yml` file lists every single service as a "container".
2. It uses `depends_on` to ensure the **Database (Postgres)**, **RabbitMQ**, and **Eureka Server** start *before* the Spring Boot applications.
3. The `init-db.sh` file runs inside the Postgres container automatically, explicitly running `CREATE DATABASE "XYZ"` for every single microservice so they all have their independent data environments on startup.
