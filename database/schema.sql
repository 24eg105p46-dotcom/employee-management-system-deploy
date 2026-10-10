-- Reference only: Hibernate creates these tables automatically (ddl-auto=update).
CREATE DATABASE IF NOT EXISTS employee_db;
USE employee_db;

CREATE TABLE IF NOT EXISTS departments (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  location    VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS employees (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(60)  NOT NULL,
  last_name     VARCHAR(60)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  job_title     VARCHAR(100) NOT NULL,
  salary        DECIMAL(12,2) NOT NULL,
  hire_date     DATE NOT NULL,
  status        VARCHAR(20) NOT NULL,
  address       VARCHAR(255),
  department_id BIGINT,
  CONSTRAINT fk_emp_dept FOREIGN KEY (department_id) REFERENCES departments(id)
);
