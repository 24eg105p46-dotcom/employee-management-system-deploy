package com.company.ems.service;

import com.company.ems.model.Department;
import com.company.ems.model.Employee;
import com.company.ems.model.EmployeeStatus;
import com.company.ems.repository.DepartmentRepository;
import com.company.ems.repository.EmployeeRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public DashboardService(EmployeeRepository employeeRepository, DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    public Map<String, Object> stats() {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalEmployees", employeeRepository.count());
        out.put("totalDepartments", departmentRepository.count());
        out.put("activeEmployees", employeeRepository.countByStatus(EmployeeStatus.ACTIVE));
        out.put("onLeaveEmployees", employeeRepository.countByStatus(EmployeeStatus.ON_LEAVE));
        out.put("inactiveEmployees", employeeRepository.countByStatus(EmployeeStatus.INACTIVE));
        Double avg = employeeRepository.averageSalary();
        out.put("averageSalary", avg == null ? 0 : Math.round(avg));

        List<Map<String, Object>> byDept = new ArrayList<>();
        for (Department d : departmentRepository.findAll(Sort.by("name"))) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("department", d.getName());
            row.put("count", employeeRepository.countByDepartmentId(d.getId()));
            byDept.add(row);
        }
        byDept.sort((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")));
        out.put("employeesByDepartment", byDept);

        List<Employee> recent = employeeRepository.findTop5ByOrderByHireDateDescIdDesc();
        out.put("recentHires", recent);
        out.put("serverTime", Instant.now().toString());
        return out;
    }
}
