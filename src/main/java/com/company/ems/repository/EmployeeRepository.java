package com.company.ems.repository;

import com.company.ems.model.Employee;
import com.company.ems.model.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    long countByDepartmentId(Long departmentId);

    long countByStatus(EmployeeStatus status);

    List<Employee> findTop5ByOrderByHireDateDescIdDesc();

    @Query("""
           SELECT e FROM Employee e LEFT JOIN e.department d
           WHERE LOWER(e.firstName) LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(e.lastName)  LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(CONCAT(e.firstName, ' ', e.lastName)) LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(e.email)     LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(e.jobTitle)  LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(d.name)      LIKE LOWER(CONCAT('%', :kw, '%'))
           ORDER BY e.firstName, e.lastName
           """)
    List<Employee> search(@Param("kw") String keyword);

    @Query("SELECT AVG(e.salary) FROM Employee e")
    Double averageSalary();
}
