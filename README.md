# InternX

A platform where companies post real tasks and students solve them to gain verified experience and build a portfolio.

## Tech Stack

- Java 17
- Spring Boot 4.x
- Spring Security + JWT
- Spring Data JPA
- MySQL
- Swagger / OpenAPI

## Features

- JWT-based authentication with role-based access (STUDENT, COMPANY, ADMIN)
- Task management — companies post tasks, students browse and apply
- Application system — apply, accept, reject with business rule validation
- Submission system — accepted students submit their work
- Rating system — companies rate students after submission
- Skills management — students build their skill profile
- Input validation on all endpoints
- Global exception handling with clean error responses
- API documentation via Swagger UI

## Getting Started

1. Clone the repo
2. Create a MySQL database named `internx`
3. Copy `application.properties.example` to `application.properties` and fill in your values
4. Run `mvn spring-boot:run`

## API Documentation

Once running, visit: `http://localhost:8080/swagger-ui/index.html`

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register a user |
| POST | /api/auth/login | Public | Login and get JWT token |
| GET | /api/tasks | Authenticated | Get all tasks (paginated) |
| POST | /api/tasks | COMPANY | Create a task |
| POST | /api/applications/{taskId} | STUDENT | Apply for a task |
| GET | /api/applications/my | STUDENT | View my applications |
| GET | /api/applications/task/{taskId} | COMPANY | View applicants for a task |
| PUT | /api/applications/{id}/accept | COMPANY | Accept an application |
| PUT | /api/applications/{id}/reject | COMPANY | Reject an application |
| POST | /api/submissions/submit | STUDENT | Submit work for a task |
| GET | /api/submissions/my | STUDENT | View my submissions |
| POST | /api/ratings | COMPANY | Rate a student |
| GET | /api/ratings/student/{userId} | Authenticated | View student ratings |
| POST | /api/skills | STUDENT | Add a skill |
| GET | /api/skills/my | STUDENT | View my skills |
| GET | /api/skills/user/{userId} | Authenticated | View any user's skills |
