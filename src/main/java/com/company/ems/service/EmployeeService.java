package com.company.ems.service;

import com.company.ems.exception.ConflictException;
import com.company.ems.exception.ResourceNotFoundException;
import com.company.ems.model.Department;
import com.company.ems.model.Employee;
import com.company.ems.repository.DepartmentRepository;
import com.company.ems.repository.EmployeeRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public EmployeeService(EmployeeRepository employeeRepository, DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<Employee> findAll() {
        return employeeRepository.findAll(Sort.by("firstName", "lastName"));
    }

    @Transactional(readOnly = true)
    public Employee findById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee " + id + " was not found."));
    }

    @Transactional(readOnly = true)
    public List<Employee> search(String keyword) {
        if (keyword == null || keyword.isBlank()) return findAll();
        return employeeRepository.search(keyword.trim());
    }

    public Employee create(Employee in) {
        in.setId(null);
        in.setEmail(in.getEmail().trim().toLowerCase());
        if (employeeRepository.existsByEmailIgnoreCase(in.getEmail())) {
            throw new ConflictException("An employee with the email " + in.getEmail() + " already exists.");
        }
        in.setDepartment(resolveDepartment(in.getDepartment()));
        return employeeRepository.save(in);
    }

    public Employee update(Long id, Employee in) {
        Employee e = findById(id);
        String email = in.getEmail().trim().toLowerCase();
        if (employeeRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new ConflictException("An employee with the email " + email + " already exists.");
        }
        e.setFirstName(in.getFirstName().trim());
        e.setLastName(in.getLastName().trim());
        e.setEmail(email);
        e.setPhone(in.getPhone());
        e.setJobTitle(in.getJobTitle().trim());
        e.setSalary(in.getSalary());
        e.setHireDate(in.getHireDate());
        e.setStatus(in.getStatus() == null ? e.getStatus() : in.getStatus());
        e.setAddress(in.getAddress());
        e.setDepartment(resolveDepartment(in.getDepartment()));
        return employeeRepository.save(e);
    }

    public void delete(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee " + id + " was not found.");
        }
        employeeRepository.deleteById(id);
    }

    private Department resolveDepartment(Department ref) {
        if (ref == null || ref.getId() == null) return null;
        return departmentRepository.findById(ref.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Department " + ref.getId() + " was not found."));
    }
}
