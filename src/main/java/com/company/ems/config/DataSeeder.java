package com.company.ems.config;

import com.company.ems.model.Department;
import com.company.ems.model.Employee;
import com.company.ems.model.EmployeeStatus;
import com.company.ems.repository.DepartmentRepository;
import com.company.ems.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Adds sample data on the very first run so the dashboard isn't empty. */
@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(DepartmentRepository departments, EmployeeRepository employees) {
        return args -> {
            if (departments.count() > 0 || employees.count() > 0) return;

            Department eng = departments.save(new Department("Engineering", "Builds and maintains our products", "Hyderabad"));
            Department hr = departments.save(new Department("Human Resources", "Hiring, onboarding and people operations", "Hyderabad"));
            Department fin = departments.save(new Department("Finance", "Payroll, budgeting and accounts", "Mumbai"));
            Department mkt = departments.save(new Department("Marketing", "Brand, campaigns and communications", "Bengaluru"));
            Department ops = departments.save(new Department("Operations", "Day-to-day business operations", "Chennai"));

            employees.save(emp("Ananya", "Reddy", "ananya.reddy@example.com", "9876543210", "Senior Software Engineer", 1800000, LocalDate.now().minusMonths(30), EmployeeStatus.ACTIVE, "Banjara Hills, Hyderabad", eng));
            employees.save(emp("Rahul", "Verma", "rahul.verma@example.com", "9876543211", "Backend Developer", 1200000, LocalDate.now().minusMonths(14), EmployeeStatus.ACTIVE, "Gachibowli, Hyderabad", eng));
            employees.save(emp("Sneha", "Iyer", "sneha.iyer@example.com", "9876543212", "QA Engineer", 900000, LocalDate.now().minusMonths(8), EmployeeStatus.ON_LEAVE, "Madhapur, Hyderabad", eng));
            employees.save(emp("Karthik", "Naidu", "karthik.naidu@example.com", "9876543213", "HR Manager", 1500000, LocalDate.now().minusYears(4), EmployeeStatus.ACTIVE, "Kondapur, Hyderabad", hr));
            employees.save(emp("Priya", "Sharma", "priya.sharma@example.com", "9876543214", "Talent Acquisition Specialist", 780000, LocalDate.now().minusMonths(5), EmployeeStatus.ACTIVE, "Jubilee Hills, Hyderabad", hr));
            employees.save(emp("Vikram", "Singh", "vikram.singh@example.com", "9876543215", "Finance Controller", 2200000, LocalDate.now().minusYears(6), EmployeeStatus.ACTIVE, "Andheri, Mumbai", fin));
            employees.save(emp("Meera", "Nair", "meera.nair@example.com", "9876543216", "Accountant", 650000, LocalDate.now().minusMonths(20), EmployeeStatus.ACTIVE, "Powai, Mumbai", fin));
            employees.save(emp("Arjun", "Patel", "arjun.patel@example.com", "9876543217", "Marketing Lead", 1400000, LocalDate.now().minusMonths(26), EmployeeStatus.ACTIVE, "Indiranagar, Bengaluru", mkt));
            employees.save(emp("Divya", "Menon", "divya.menon@example.com", "9876543218", "Content Strategist", 720000, LocalDate.now().minusWeeks(6), EmployeeStatus.ACTIVE, "Koramangala, Bengaluru", mkt));
            employees.save(emp("Suresh", "Kumar", "suresh.kumar@example.com", "9876543219", "Operations Manager", 1600000, LocalDate.now().minusYears(3), EmployeeStatus.INACTIVE, "T. Nagar, Chennai", ops));
        };
    }

    private Employee emp(String first, String last, String email, String phone, String title,
                         long salary, LocalDate hired, EmployeeStatus status, String address, Department dept) {
        Employee e = new Employee();
        e.setFirstName(first);
        e.setLastName(last);
        e.setEmail(email);
        e.setPhone(phone);
        e.setJobTitle(title);
        e.setSalary(BigDecimal.valueOf(salary));
        e.setHireDate(hired);
        e.setStatus(status);
        e.setAddress(address);
        e.setDepartment(dept);
        return e;
    }
}
