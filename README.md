# EverMind – Alzheimer Care Application

## Overview
This project was developed as part of the PIDEV – 3rd Year Engineering Program at **Esprit School of Engineering** (Academic Year 2025–2026).
It consists of a full-stack microservices web application dedicated to Alzheimer's patient care, allowing healthcare professionals and caregivers to monitor patients, conduct cognitive assessments, track autonomy, and manage related tasks and inventory efficiently.

## Features
- **Patient Management:** Comprehensive patient profiles.
- **Alert System & Predictive Analysis:** Real-time alerts and predictive insights for patient health.
- **Cognitive Assessments:** Tools to evaluate patient cognitive status over time.
- **Autonomy Tracking:** Monitoring daily living activities and autonomy levels.
- **Stock Management:** Managing necessary medical supplies and inventory.
- **Intervention & Consultation:** Scheduling and tracking medical interventions.
- **Secure Communication:** Built-in conversational features between caregivers.

## Tech Stack
### Frontend
- Angular 
- Chart.js (for analytics and dashboards)
- TypeScript

### Backend
- Spring Boot (Java)
- Spring Cloud Gateway
- Spring Cloud Netflix Eureka (Service Discovery)
- Node.js & Express (for specific microservices or frontend SSR)

## Architecture
The platform is built on a robust **Microservices Architecture**. 
It includes a centralized **Eureka Discovery Server** for seamless microservice registration and an **API Gateway** acting as the single entry point for all frontend requests, ensuring scalability and maintainability. Background services include distinct domain-specific endpoints (Alerts, Autonomy, CognitiveAssessment, Intervention, Patient, Product, Profile, Stock, User, and Conversation).

## Contributors
- The EverMind Team 

## Academic Context
Developed at **Esprit School of Engineering – Tunisia**
PIDEV – 4A | 2025–2026

## Getting Started
### Prerequisites
- Node.js and npm
- Angular CLI
- Java Development Kit (JDK) 17+
- Maven

### Installation & Execution
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd EverMind
   ```

2. **Run the Backend (Microservices):**
   Navigate to the `Backend/` directory and start the services. Ensure you start them in the following order:
   - `Eureka`
   - `Gateway`
   - All other domain microservices (e.g., `Patient`, `Alert`, `Stock`, etc.)

3. **Run the Frontend:**
   ```bash
   cd Frontend/alzheimer-care-web
   npm install
   ng serve
   ```
   Open your browser and navigate to `http://localhost:4200/`.

## Acknowledgments
We would like to thank our instructors and mentors at the **Esprit School of Engineering** for their guidance and support throughout this PIDEV project.
