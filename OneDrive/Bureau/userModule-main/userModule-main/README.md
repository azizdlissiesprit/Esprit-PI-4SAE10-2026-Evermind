# EverMind Run Guide

## Prerequisites

- Java `17`
- Maven Wrapper support
- Node.js + npm
- Python `3.10` for `Backend/face-service`
- PostgreSQL

## Databases

Create these PostgreSQL databases before starting the backend:

- `User`
- `Reclamation`

If the `users` table already existed from an older version, run:

```sql
ALTER TABLE users
ADD COLUMN face_enabled boolean NOT NULL DEFAULT false;
```

## Startup Order

Start the services in this order:

1. `Backend/Eureka/EurekaServer`
2. `Backend/api-gateway`
3. `Backend/User/User`
4. `Backend/Reclamation`
5. `Backend/face-service`
6. `Frontend/alzheimer-care-web`

## Backend Services

Run each Spring Boot service from its own folder:

```powershell
.\mvnw.cmd spring-boot:run
```

Main services and ports:

- `Eureka` -> `http://localhost:8761`
- `api-gateway` -> `http://localhost:8090`
- `User` -> `http://localhost:8082`
- `Reclamation` -> `http://localhost:8083`

## Face Service

From `Backend/face-service`:

```powershell
py -3.10 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Notes:

- First startup may take longer because the face-recognition model downloads its weights.
- Keep the service running while testing registration/login with Face ID.

Health check:

- `http://localhost:8000/health`

## Frontend

From `Frontend/alzheimer-care-web`:

```powershell
npm install
npm start
```

Frontend URL:

- `http://localhost:4200`

## Login Modes

The application supports:

- `Email + Password`
- `Email + Face ID`

Face ID requires:

- a user already registered with a face image
- the Python face service running on port `8000`

## Useful Notes

- Use a normal browser like Chrome or Edge for Face ID.
- If webcam access fails, use the upload-photo fallback.
- Angular production build can be generated with:

```powershell
npm run build
```
