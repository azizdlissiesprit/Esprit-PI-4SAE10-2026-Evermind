# EverMind Docker Guide

This guide explains how to set up, run, and manage the EverMind microservices ecosystem using Docker.

## Phase 0: Prerequisites

Before starting, ensure you have:
1. **Docker Desktop** installed and running.
2. **RAM Allocation**: This project runs 15+ containers. Ensure Docker has at least **8GB-12GB of RAM** allocated (Settings -> Resources -> Advanced).
3. **Terminal**: Use PowerShell, CMD, or Git Bash from the project root (`EverMind/`).

---

## Phase 1: Running the Entire Stack from Scratch

Run this command from the directory containing `docker-compose.yml`:

```bash
docker-compose up -d --build
```

### What does this command do?
- `docker-compose`: The tool that manages multi-container applications.
- `up`: Builds, (re)creates, starts, and attaches to containers for all services.
- `-d` (Detached): Runs the containers in the background, allowing you to keep using your terminal.
- `--build`: Forces Docker to rebuild the images even if they already exist (crucial after code changes).

---

## Phase 2: Essential Lifecycle Commands

### 1. Checking Status
```bash
docker-compose ps
```
*   **What it does**: Lists all containers managed by the `docker-compose.yml`, showing their status (Running, Exited), ports, and names.

### 2. Viewing Logs
To see logs for all services:
```bash
docker-compose logs -f
```
To see logs for a specific service (e.g., gateway):
```bash
docker-compose logs -f gateway
```
*   **What it does**: `-f` (Follow) streams the output of the application logs to your terminal in real-time.

### 3. Stopping the System
```bash
docker-compose stop
```
*   **What it does**: Stops the running containers but does **not** delete them. Databases will keep their data.

### 4. Stopping and Cleaning Up
```bash
docker-compose down
```
*   **What it does**: Stops and **removes** the containers and the internal network.
*   **Note**: This does **not** delete your volumes (database data) by default.

---

## Phase 3: Targeted Updates (Incremental Workflow)

If you change code in a single service (e.g., `user-service`), you don't need to restart everything.

```bash
docker-compose up -d --build user-service
```
*   **What it does**: Only rebuilds and restarts the `user-service`. Other containers (DB, Kafka, etc.) stay running and connected.

---

## Phase 4: Database & Infrastructure

The project uses a single PostgreSQL instance with multiple databases initialized via `init-db.sh`.

### Accessing the Database
The DB is exposed on port `5433` on your localhost.
- **Host**: `localhost`
- **Port**: `5433`
- **User**: `postgres`
- **Password**: `123`

### Force Re-initializing Databases
If you need to wipe the DB and let `init-db.sh` run again:
```bash
docker-compose down -v
docker-compose up -d
```
*   **What it does**: `-v` (Volumes) deletes the persistent data volumes, forcing a fresh setup next time you run `up`.

---

## Phase 5: Troubleshooting Common Issues

| Issue | Solution | Command |
| :--- | :--- | :--- |
| **Port Conflict** | Another app is using port 8090 or 5433. | Stop the local app or change the mapping in `docker-compose.yml`. |
| **Out of Memory** | Services crash or stay in "Exited" state. | Increase Docker Desktop RAM limits (Settings > Resources). |
| **Eureka Discovery** | Services can't find each other. | Ensure `eureka-server` started correctly first. |
| **Rebuild Fail** | Stale cache causing build errors. | Run `docker-compose build --no-cache [service]`. |

---

## Phase 6: Monitoring & Access Dashboards

Once everything is running, access these tools in your browser:

- **Eureka Dashboard**: [http://localhost:8761](http://localhost:8761) (Service registry)
- **Gateway Swagger**: [http://localhost:8090/swagger-ui.html](http://localhost:8090/swagger-ui.html) (API Docs)
- **RabbitMQ Management**: [http://localhost:15672](http://localhost:15672) (guest/guest)
- **Grafana**: [http://localhost:3000](http://localhost:3000) (admin/admin)
