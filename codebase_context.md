# EverMind Codebase Context

This document provides a high-level overview of the EverMind codebase structure, its modules, and functionalities. It is designed to help LLMs and new developers quickly understand the project architecture.

## Overview
EverMind is a distributed application likely designed for Alzheimer's care management. It consists of a Spring Boot microservices backend and an Angular frontend.

## Frontend (`Frontend/alzheimer-care-web`)
The frontend is built with Angular 17+ and uses standard features for routing, server-side rendering (SSR), and styling.

### Key Functional Modules (`src/app/features`):
- **`admin`**: Administration panel and settings.
- **`alerts`**: System for managing notifications and warnings.
- **`assesements`**: Interfaces for cognitive or behavioral assessments.
- **`auth`**: Authentication and authorization flows (login, register).
- **`communication`**: Messaging or video calling features.
- **`dashboard`**: Main overview screens for users/staff.
- **`patients`**: Management of patient records and details.
- **`profile`**: User profile management.
- **`stock-front`**: Inventory or stock management interface.

## Backend (`Backend`)
The backend is a collection of Spring Boot microservices. Each directory typically represents a standalone service.

### Infrastructure Services
- **`Eureka`**: Service discovery registry (Netflix Eureka) for microservices registration.
- **`Gateway`**: API Gateway routing requests to respective microservices.

### Domain Microservices
- **`Alert`**: Manages event triggers and notifications.
- **`Autonomy`**: Functionalities related to tracking or promoting patient independence.
- **`CognitiveAssessment`**: Handles logic and data for cognitive tests.
- **`Conversation`**: Manages messaging or communication logs.
- **`Intervention`**: Tracks medical or caregiver interventions and treatments.
- **`Patient`**: Core domain service for patient data management.
- **`Product`**: Manages catalog or items available in the system.
- **`Profile`**: Handles user/staff profile data beyond basic auth.
- **`Stock`**: Inventory management logic, likely tying into `Product`.
- **`User`**: Core user management and potentially authentication/authorization logic.

## Technology Stack
- **Frontend**: Angular, TypeScript, RxJS, Chart.js, Express (for SSR).
- **Backend**: Java, Spring Boot, Spring Cloud (Eureka, Gateway), Maven.
