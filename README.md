# Employee Management System ("People Desk")

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | HTML, CSS, JavaScript, Bootstrap 5      |
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
- MySQL 8 running on port 3306
- VS Code with **Extension Pack for Java** and **Spring Boot Extension Pack**

## Run it
1. Open the `employee-management-system` folder in VS Code.
2. Edit `src/main/resources/application.properties` and set your MySQL
   `spring.datasource.username` and `spring.datasource.password`.
   The database `employee_db` is created automatically.
3. In the VS Code terminal:
   ```
   mvn spring-boot:run
   ```
   (or open `EmployeeManagementApplication.java` and click **Run**)
4. Open http://localhost:8080

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
  static/       index.html, css/style.css, js/app.js   (served by Spring Boot)
database/schema.sql   Reference schema
```

## Troubleshooting
- **Access denied for user 'root'** – fix the username/password in `application.properties`.
- **Port 8080 already in use** – change `server.port` in `application.properties`.
- **Currency** – shown in INR; change `money()` at the top of `static/js/app.js` to use another currency.

## Deploying (public link)
See DEPLOY.md.
