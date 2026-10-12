# Employee Management System ("People Desk")

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18 (Vite), JavaScript, Bootstrap 5 |
| Backend   | Java 17, Spring Boot 3.2 (REST API)     |
| Database  | MySQL 8                                 |
| Build     | Maven                                   |

## Features
1. Add employee
2. View all employees
3. Search employee (name, email, job title, department)
4. Update employee
5. Delete employee (with confirmation)
6. Employee details dialog
7. Department management (add, edit, delete, headcount)
8. Responsive dashboard that refreshes itself every 10 seconds

## Prerequisites
- JDK 17+  (`java -version`)
- Maven 3.8+  (`mvn -version`)
- Node.js 18+ and npm  (`node -v`) for the React frontend
- MySQL 8 running on port 3306
- VS Code with **Extension Pack for Java** and **Spring Boot Extension Pack**

## Run it

**Backend** (Spring Boot + MySQL)
1. Open the project folder in VS Code.
2. Check the MySQL username/password in `src/main/resources/application.properties`.
3. In a terminal: `mvn spring-boot:run`  (API on http://localhost:8080)

**Frontend - development mode** (hot reload)
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 . API calls are forwarded to the backend on port 8080.

**Frontend - single app on port 8080**
```
cd frontend
npm install
npm run build
```
This compiles React into `src/main/resources/static`. Restart the backend and open http://localhost:8080 .

On the first start, 5 departments and 10 sample employees are added so you can try everything immediately.

## REST API

| Method | URL                                 | Purpose                  |
|--------|-------------------------------------|--------------------------|
| GET    | `/api/employees`                    | List all employees       |
| GET    | `/api/employees/{id}`               | Employee details         |
| GET    | `/api/employees/search?keyword=ana` | Search                   |
| POST   | `/api/employees`                    | Add employee             |
| PUT    | `/api/employees/{id}`               | Update employee          |
| DELETE | `/api/employees/{id}`               | Delete employee          |
| GET    | `/api/departments`                  | List departments         |
| GET    | `/api/departments/{id}`             | Department details       |
| POST   | `/api/departments`                  | Add department           |
| PUT    | `/api/departments/{id}`             | Update department        |
| DELETE | `/api/departments/{id}`             | Delete (blocked if it still has employees) |
| GET    | `/api/dashboard/stats`              | Dashboard numbers        |

Example body for `POST /api/employees`:
```json
{
  "firstName": "Asha", "lastName": "Rao", "email": "asha.rao@example.com",
  "phone": "9000000000", "jobTitle": "Designer", "salary": 900000,
  "hireDate": "2026-10-01", "status": "ACTIVE",
  "address": "Hyderabad", "department": { "id": 1 }
}
```

## Project structure
```
src/main/java/com/company/ems
  model/        Employee, Department, EmployeeStatus   (JPA entities + validation)
  repository/   Spring Data JPA repositories
  service/      Business rules (unique email, safe department delete, dashboard stats)
  controller/   REST controllers
  exception/    Clean JSON error responses
  config/       DataSeeder (sample data)
src/main/resources
  application.properties
  static/       React build output (created by `npm run build`, served by Spring Boot)
frontend/
  src/pages/        Dashboard, Employees, Departments
  src/components/   Modals, Avatar, StatusBadge, LivePill, Toasts
  src/api.js        REST client
  vite.config.js    Build + dev proxy settings
database/schema.sql   Reference schema
```

## Troubleshooting
- **Access denied for user 'root'** – fix the username/password in `application.properties`.
- **Port 8080 already in use** – change `server.port` in `application.properties`.
- **Currency** – shown in INR; change `money()` at the top of `static/js/app.js` to use another currency.

## Deploying (public link)
See DEPLOY.md.
