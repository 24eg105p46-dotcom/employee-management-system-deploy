package com.company.ems.service;

import com.company.ems.exception.ConflictException;
import com.company.ems.exception.ResourceNotFoundException;
import com.company.ems.model.Department;
import com.company.ems.repository.DepartmentRepository;
import com.company.ems.repository.EmployeeRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public DepartmentService(DepartmentRepository departmentRepository, EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional(readOnly = true)
    public List<Department> findAll() {
        List<Department> list = departmentRepository.findAll(Sort.by("name"));
        list.forEach(this::attachCount);
        return list;
    }

    @Transactional(readOnly = true)
    public Department findById(Long id) {
        Department d = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department " + id + " was not found."));
        return attachCount(d);
    }

    public Department create(Department in) {
        in.setId(null);
        in.setName(in.getName().trim());
        if (departmentRepository.existsByNameIgnoreCase(in.getName())) {
            throw new ConflictException("A department named \"" + in.getName() + "\" already exists.");
        }
        return attachCount(departmentRepository.save(in));
    }

    public Department update(Long id, Department in) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department " + id + " was not found."));
        String name = in.getName().trim();
        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException("A department named \"" + name + "\" already exists.");
        }
        existing.setName(name);
        existing.setDescription(in.getDescription());
        existing.setLocation(in.getLocation());
        return attachCount(departmentRepository.save(existing));
    }

    public void delete(Long id) {
        Department d = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department " + id + " was not found."));
        long count = employeeRepository.countByDepartmentId(id);
        if (count > 0) {
            throw new ConflictException("\"" + d.getName() + "\" still has " + count
                    + (count == 1 ? " employee" : " employees") + ". Move them to another department first.");
        }
        departmentRepository.delete(d);
    }

    private Department attachCount(Department d) {
        d.setEmployeeCount(employeeRepository.countByDepartmentId(d.getId()));
        return d;
    }
}
