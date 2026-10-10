# Deploy: GitHub -> Render (app) + Aiven (MySQL)

1. Push this project to a GitHub repository (the folder that contains pom.xml must be the repo root).
2. Create a free MySQL service at https://console.aiven.io and wait until it is "Running".
   Build the JDBC URL from the *Host* and *MySQL port* shown (NOT the X-protocol port, NOT the "Service URI"):
   jdbc:mysql://HOST:PORT/defaultdb?sslMode=REQUIRED
3. Render dashboard -> New -> Web Service -> pick your repo. Runtime: Docker. Instance type: Free.
4. Add environment variables:
   DB_URL       = jdbc:mysql://HOST:PORT/defaultdb?sslMode=REQUIRED
   DB_USERNAME  = (Aiven user, usually avnadmin)
   DB_PASSWORD  = (Aiven password)
5. Create Web Service. First build takes several minutes. You get https://your-name.onrender.com
