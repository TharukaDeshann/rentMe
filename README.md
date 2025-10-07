# 🚗 rentMe — Vehicle Rental Platform

A full-stack Vehicle Rental Platform that enables users to rent vehicles, manage bookings, and communicate with vehicle owners in real time.

This repository contains a Spring Boot backend (`rentMe_backend`) and a Next.js frontend (`rentMe_frontend`). The project is containerized with Docker and can be run locally with Docker Compose or individually.

---

## 🔎 Project Overview

- Backend: Spring Boot 3.5.6 (Java 21, Temurin OpenJDK)
- Frontend: Next.js (served with Nginx in production)
- Database: PostgreSQL (optional local service in Docker Compose; can use Supabase cloud)
- Containerization: Docker & Docker Compose

## 🧩 Folder Structure

rentMe/
├── rentMe_backend/ # Spring Boot backend (Maven)
├── rentMe_frontend/ # Next.js frontend
├── docker-compose.yml # Multi-container orchestration (backend, frontend, optional postgres)
└── README.md # This file

## ⚙️ Prerequisites

- Java 21 (Temurin/OpenJDK)
- Maven (optional — used to build the JAR locally)
- Node.js (for frontend development)
- Docker and Docker Compose

## 🛠️ Backend — Build & Docker

The backend produces an executable Spring Boot jar at `rentMe_backend/target/springrentMe-0.0.1-SNAPSHOT.jar` when built using Maven.

Build the JAR locally (from `rentMe_backend`):

```powershell
cd rentMe_backend
mvn clean package -DskipTests
```

Dockerfile for the backend (already present in `rentMe_backend/Dockerfile`) uses Temurin OpenJDK 21 and expects the built JAR at `target/springrentMe-0.0.1-SNAPSHOT.jar`. A recommended production-ready Dockerfile is shown below.

Recommended `Dockerfile` (multi-stage to keep image small):

```dockerfile
# Build stage: use Maven to build the JAR inside a build container (optional if you already build locally)
FROM maven:3.10.1-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml mvnw .
COPY .mvn .mvn
COPY src src
RUN mvn -B package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /build/target/springrentMe-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xms256m -Xmx512m"
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --spider http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
```

If you prefer to build locally and keep the current simple `Dockerfile` (which copies the JAR), ensure you run `mvn package` before building the image.

Build the Docker image (from repo root):

```powershell
docker build -t rentme-backend -f .\rentMe_backend\Dockerfile .\rentMe_backend
```

Run the container:

```powershell
docker run --rm -p 8080:8080 --env-file .env --name rentme-backend rentme-backend
```

Notes:

- Use `--env-file .env` to pass sensitive configuration (database URL, credentials). Do not commit `.env`.
- The backend exposes port `8080` by default — confirm with `application.properties` if you changed the server port.

## 🐳 Docker Compose (recommended)

A `docker-compose.yml` is included in the repository root. It defines `backend`, `frontend`, and an optional `postgres` service for local development. To run everything locally:

```powershell
docker compose up -d --build
```

If you use Supabase (cloud Postgres), set your `DATABASE_URL` in `.env` and remove/comment the `postgres` service in `docker-compose.yml`.

## 🔐 Environment & Secrets

- Create a `.env` file in the repo root (do NOT commit it).
- Example variables used by the backend (update to your values):

```env
DATABASE_URL=jdbc:postgresql://<host>:5432/<db>?sslmode=require
DATABASE_USERNAME=<username>
DATABASE_PASSWORD=<password>
SPRING_PROFILES_ACTIVE=prod
```

Add `.env` to `.gitignore`.

## 🔁 Healthchecks & Monitoring

- Backend: Spring Boot Actuator (`/actuator/health`) — recommended to enable for docker healthchecks.
- Frontend: Nginx can be configured to serve static assets; add a simple `/health` endpoint if desired.

## 🔧 Development Workflow

- Backend development: run with your IDE (IntelliJ/Eclipse) or via Maven:

```powershell
cd rentMe_backend
mvn spring-boot:run
```

- Frontend development: run in `rentMe_frontend` with `npm install` then `npm run dev`.

## ✅ Quick Commands Summary

```powershell
# Build backend JAR
cd rentMe_backend ; mvn clean package -DskipTests

# Build backend image and run
docker build -t rentme-backend -f .\rentMe_backend\Dockerfile .\rentMe_backend
docker run --rm -p 8080:8080 --env-file .env rentme-backend

# Full stack with docker compose
docker compose up -d --build
```

## 📦 Useful .dockerignore

```
target
.git
.mvn
.idea
*.iml
*.log
.env
```

## 🧾 Troubleshooting

- If the app doesn't start, check container logs:

```powershell
docker logs <container-name>
```

- Confirm the JAR exists at `rentMe_backend/target/springrentMe-0.0.1-SNAPSHOT.jar` before building the image if your Dockerfile copies it.

## 📚 Next Steps / Improvements

- Add CI to build the JAR and publish Docker images (GitHub Actions)
- Use Docker image scanning for vulnerabilities
- Use Docker Secrets or a secrets manager in production

---

If you'd like, I can:

- Update the existing `rentMe_backend/Dockerfile` to the multi-stage variant above (I can apply the change), or
- Create a `.dockerignore` file in `rentMe_backend`, or
- Show how to add Actuator endpoints and a minimal `application.properties` health config.

Tell me which of those you'd like me to do next.

# 🚗 rentMe – Vehicle Rental Platform

> A full-stack **Vehicle Rental Platform** that enables users to rent vehicles, manage bookings, and communicate with vehicle owners in real time.  
> Powered by **Spring Boot**, **Next.js**, **Docker**, and a **Supabase (PostgreSQL)** cloud database — with integrated **AI chatbot (RAG + LLM)** capabilities.

---

## 🧠 Key Features

- 🚘 **Vehicle Rentals** – Browse, book, and manage vehicle rentals easily.
- 📅 **Booking Management** – Real-time booking system with availability checks.
- 💬 **Chatbot Assistant (RAG + LLM)** – AI-powered chatbot to assist users with vehicle recommendations and rental process queries.
- 💭 **Real-time Messaging** – Secure WebSocket-based chat between renters and owners.
- 🧑‍💼 **Role-based Access** – Owner and renter roles with distinct dashboards.
- ☁️ **Cloud Database Integration** – Data persisted in **Supabase PostgreSQL**.
- 🐳 **Fully Containerized** – Backend, frontend, and database run in isolated Docker containers.

---

## 🧩 Tech Stack

| Layer                     | Technology                                                                                          |
| :------------------------ | :-------------------------------------------------------------------------------------------------- |
| **Frontend**              | [Next.js 15.5.3 (Turbopack)](https://nextjs.org/)                                                   |
| **Backend**               | [Spring Boot 3.5.6](https://spring.io/projects/spring-boot) with [Maven](https://maven.apache.org/) |
| **Database**              | [PostgreSQL (Supabase Cloud)](https://supabase.com/)                                                |
| **Containerization**      | [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)              |
| **Language**              | Java 21 (Temurin OpenJDK)                                                                           |
| **Runtime (Frontend)**    | Node.js v22.19.0                                                                                    |
| **Web Server (Frontend)** | Nginx                                                                                               |
| **AI Layer**              | RAG Pipeline + LLM Integration                                                                      |

---

## 🗂️ Folder Structure

rentMe/
├── rentMe_backend/ # Spring Boot backend
│ ├── src/ # Java source files
│ ├── target/ # Maven build artifacts
│ ├── pom.xml # Maven project configuration
│ ├── Dockerfile # Backend Dockerfile
│ └── .env # Backend environment variables (PostgreSQL)
│
├── rentMe_frontend/ # Next.js frontend
│ ├── public/ # Static assets
│ ├── src/ # Pages and components
│ ├── next.config.js # Next.js configuration
│ ├── Dockerfile # Frontend Dockerfile (Nginx-based)
│ └── package.json # Node dependencies
│
├── docker-compose.yml # Multi-container orchestration
└── README.md # Project documentation

yaml
Copy code

---

## ⚙️ Environment Configuration

The application relies on environment variables defined in a `.env` file (used by Docker Compose).

### Sample `.env`

```env
# --- Database (Supabase Cloud) ---
DATABASE_URL=jdbc:postgresql://<your-supabase-host>:5432/<your-database>?sslmode=require
DATABASE_NAME=<your-database>
DATABASE_USERNAME=<your-username>
DATABASE_PASSWORD=<your-password>
🟡 Note: Update the values with your Supabase project credentials
(Found under: Supabase Dashboard → Project Settings → Database → Connection Info).

🧱 Backend Setup (Spring Boot)
Java version: OpenJDK 21
Build tool: Maven

🔨 Build the JAR
bash
Copy code
mvn clean package -DskipTests
🐳 Run Backend via Docker
bash
Copy code
docker compose up -d --build
This will automatically build the backend JAR, create the Docker image, and connect to the Supabase PostgreSQL instance.

🧾 Exposed Port
arduino
Copy code
http://localhost:8080
💻 Frontend Setup (Next.js + Nginx)
Node version: v22.19.0

🚀 Development
bash
Copy code
cd rentMe_frontend
npm install
npm run dev
Access it at: http://localhost:3000

🏗️ Production Build
bash
Copy code
npm run build
🐳 Run via Docker (Production Mode)
Frontend is built and served using Nginx inside the container.

bash
Copy code
docker compose up -d --build
Access the app at:

arduino
Copy code
http://localhost:3000
🐳 Docker Compose Overview
docker-compose.yml orchestrates all services:

yaml
Copy code
version: "3.9"
services:
  backend:
    build: ./rentMe_backend
    container_name: rentme-backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: ${DATABASE_URL}
      SPRING_DATASOURCE_USERNAME: ${DATABASE_USERNAME}
      SPRING_DATASOURCE_PASSWORD: ${DATABASE_PASSWORD}
    depends_on:
      - postgres

  frontend:
    build: ./rentMe_frontend
    container_name: rentme-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  postgres:
    image: postgres:18-alpine
    container_name: rentme-db
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    ports:
      - "5432:5432"
🟢 Tip: If using Supabase, comment out the local postgres service and connect directly using the cloud DATABASE_URL.

🔒 Environment Security Best Practices
Never commit .env files to Git — add them to .gitignore.

For production deployments, store secrets using:

GitHub Actions Secrets

Docker Secrets

Environment variable configuration in your cloud provider.

💬 Real-time Chat & AI Chatbot (Overview)
Messaging System: Implemented using WebSocket-based real-time communication between renters and vehicle owners.

Chatbot: Uses a Retrieval-Augmented Generation (RAG) pipeline connected to a vector database and LLM model, integrated with the backend for intelligent chat responses.

🚀 Future Improvements
 Payment gateway integration

 Enhanced vehicle search with AI similarity detection

 Admin dashboard with analytics

 User review & rating system

 Cloud-native deployment (AWS / Azure)

 CI/CD pipeline setup

🤝 Contribution
Contributions are welcome!
Please fork the repository and create a pull request for new features or bug fixes.

Steps:

Fork this repo

Create a feature branch: git checkout -b feature/your-feature-name

Commit changes: git commit -m "Add your message"

Push branch: git push origin feature/your-feature-name

Create a Pull Request 🚀
```
