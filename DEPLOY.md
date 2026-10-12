# Deploy: GitHub -> Render (app) + Aiven (MySQL)

The Dockerfile builds the React frontend, then the Spring Boot jar, and serves both from one link.

1. Push this project to GitHub (pom.xml, Dockerfile, src/ and frontend/ at the repo root).
2. Aiven MySQL -> JDBC URL: jdbc:mysql://HOST:PORT/defaultdb?sslMode=REQUIRED
3. Render -> New -> Web Service -> pick the repo. Runtime: Docker. Instance type: Free.
4. Environment variables:
   DB_URL, DB_USERNAME, DB_PASSWORD
5. Deploy. First build takes longer than before (it also runs npm install + vite build).
