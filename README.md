# 🚗 RentME - Vehicle Rental Platform

> A full-stack **Vehicle Rental Platform** that enables users to rent vehicles, manage bookings, and communicate with vehicle owners in real time.  
> Powered by **Spring Boot**, **Next.js**, **Docker**, and **PostgreSQL**.

---

## 🧠 Key Features

- 🚘 **Vehicle Rentals** – Browse, book, and manage vehicle rentals easily
- 📅 **Booking Management** – Real-time booking system with availability checks
- 💭 **Real-time Messaging** – Secure communication between renters and owners
- 🧑‍💼 **Role-based Access** – Owner and renter roles with distinct dashboards
- 🔒 **Spring Security** – Authentication and authorization built-in
- 🐳 **Fully Containerized** – Backend, frontend, and database run in isolated Docker containers

---

## 🧩 Tech Stack

| Layer                     | Technology                                                                                          |
| :------------------------ | :-------------------------------------------------------------------------------------------------- |
| **Frontend**              | [Next.js 15.5.3](https://nextjs.org/) with Turbopack                                                |
| **Backend**               | [Spring Boot 3.5.6](https://spring.io/projects/spring-boot) with [Maven](https://maven.apache.org/) |
| **Database**              | [PostgreSQL 18](https://www.postgresql.org/) (Alpine)                                               |
| **Containerization**      | [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)              |
| **Language (Backend)**    | Java 21 (OpenJDK)                                                                                   |
| **Language (Frontend)**   | TypeScript 5                                                                                        |
| **Styling**               | [Tailwind CSS 4](https://tailwindcss.com/)                                                          |
| **Web Server (Frontend)** | Nginx                                                                                               |

---

## 🗂️ Project Structure

```
rentMe/
├── rentMe_backend/              # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/springrentMe/
│   │   │   │   ├── SpringrentMeApplication.java
│   │   │   │   ├── controllers/      # REST endpoints
│   │   │   │   ├── models/          # JPA entities
│   │   │   │   ├── repositories/    # Data access layer
│   │   │   │   ├── services/        # Business logic
│   │   │   │   ├── DTOs/            # Data transfer objects
│   │   │   │   └── utils/           # Utility classes
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── Dockerfile
│   ├── pom.xml
│   └── .env                         # Local env (do NOT commit)
│
├── rentMe_frontend/                 # Next.js application
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml               # Multi-container orchestration
└── README.md                        # This file
```

**Notes:**

- Keep secrets out of the repo: add `.env` to `.gitignore`
- Build artifacts (`target/` folder) should not be committed

---

## ⚙️ Prerequisites

- **Java 21** or higher (OpenJDK)
- **Node.js 20+**
- **Maven 3.6+** (or use included wrapper `mvnw`)
- **Docker** & **Docker Compose**

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rentMe
```

### 2. Environment Configuration

Create a `.env` file in the repository root:

```env
# Database Configuration
DATABASE_URL=jdbc:postgresql://postgres:5432/rentme
DATABASE_NAME=rentme
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
```

Create `rentMe_backend/.env`:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/rentme
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
```

Create `rentMe_frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Run with Docker Compose (Recommended)

```bash
docker-compose up -d --build
```

This will start:

- **PostgreSQL** on `localhost:5432`
- **Backend API** on `localhost:8080`
- **Frontend** on `localhost:3000`

### 4. Run Locally (Development)

#### Database

Start PostgreSQL using Docker:

```bash
docker run --name rentme-postgres \
  -e POSTGRES_DB=rentme \
  -e POSTGRES_USER=your_username \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:18-alpine
```

#### Backend

```bash
cd rentMe_backend
./mvnw spring-boot:run
```

Or on Windows:

```powershell
cd rentMe_backend
.\mvnw.cmd spring-boot:run
```

#### Frontend

```bash
cd rentMe_frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

The backend API is available at `http://localhost:8080`

- **Spring Actuator**: `http://localhost:8080/actuator`
- **Health Check**: `http://localhost:8080/actuator/health`

---

## 🏗️ Building for Production

### Backend

```bash
cd rentMe_backend
./mvnw clean package -DskipTests
```

The JAR file will be generated at: `target/springrentMe-0.0.1-SNAPSHOT.jar`

### Frontend

```bash
cd rentMe_frontend
npm run build
npm run start
```

### Docker Images

Build individual images:

```bash
# Backend
docker build -t rentme-backend ./rentMe_backend

# Frontend
docker build -t rentme-frontend ./rentMe_frontend
```

---

## 🧪 Testing

### Backend Tests

```bash
cd rentMe_backend
./mvnw test
```

---

## 🔒 Security

The application uses **Spring Security** for authentication and authorization. Security configuration can be customized in the backend codebase.

---

## 📦 Database Management

- Uses **Hibernate** with `ddl-auto=update` for automatic schema management
- SQL queries are logged in development mode (`spring.jpa.show-sql=true`)

---

## 🐛 Debugging & Troubleshooting

- **Backend logs**: Check console output or Docker logs

  ```bash
  docker logs rentme-backend
  ```

- **Frontend logs**: Check browser console and terminal output

- **Database**: Connect to PostgreSQL at `localhost:5432`
  ```bash
  psql -h localhost -p 5432 -U your_username -d rentme
  ```

---

## ✅ Quick Commands Summary

```bash
# Build backend JAR
cd rentMe_backend && ./mvnw clean package -DskipTests

# Build backend Docker image
docker build -t rentme-backend ./rentMe_backend

# Run backend container
docker run --rm -p 8080:8080 --env-file .env rentme-backend

# Full stack with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 📝 Useful .dockerignore

Add to `rentMe_backend/.dockerignore`:

```
target/
.git/
.mvn/
.idea/
*.iml
*.log
.env
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add some feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📚 Future Improvements

- [ ] Payment gateway integration
- [ ] Enhanced vehicle search with filters
- [ ] Admin dashboard with analytics
- [ ] User review & rating system
- [ ] CI/CD pipeline setup (GitHub Actions)
- [ ] Cloud deployment (AWS/Azure)
- [ ] Docker image security scanning
- [ ] API documentation with Swagger/OpenAPI

---

## 📄 License

This project is licensed under the terms specified in the project configuration.

---

**Made with ❤️ for efficient vehicle rental management**
