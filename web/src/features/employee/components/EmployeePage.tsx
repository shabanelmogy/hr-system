/* eslint-disable react/prop-types */
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  alpha,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {
  Add,
  People,
  Business,
  Public
} from '@mui/icons-material';
import EmployeeList from './EmployeeList';
import { Employee, AdvancedEmployeeFilters, SortConfig } from '../types/Employee';
import { createDefaultFilters, createDefaultSort } from '../utils/employeeFilters';

// Mock data for demonstration
const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1-555-0123',
    photo: 'https://via.placeholder.com/150',
    position: 'Software Engineer',
    department: 'Engineering',
    hireDate: '2023-01-15',
    birthDate: '1990-05-20',
    gender: 'male',
    nationality: 'American',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001'
    },
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1-555-0124',
      email: 'jane.doe@email.com'
    },
    employmentDetails: {
      employmentType: 'full-time',
      workLocation: 'New York Office',
      workSchedule: 'Monday-Friday, 9AM-5PM',
      probationEndDate: '2023-04-15'
    },
    salaryInfo: {
      baseSalary: 85000,
      currency: 'USD',
      payFrequency: 'monthly',
      allowances: [
        { type: 'Housing', amount: 500, description: 'Monthly housing allowance' },
        { type: 'Transportation', amount: 200, description: 'Monthly transport allowance' }
      ],
      deductions: [
        { type: 'Health Insurance', amount: 150, description: 'Monthly premium' },
        { type: 'Tax', amount: 200, description: 'Income tax deduction' }
      ],
      bankDetails: {
        bankName: 'Chase Bank',
        accountNumber: '****1234',
        accountType: 'checking'
      }
    },
    documents: [
      {
        id: 'doc1',
        employeeId: '1',
        type: 'contract',
        category: 'employment',
        name: 'Employment Contract',
        description: 'Employee contract document',
        fileUrl: '#',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        version: 1,
        versions: [],
        uploadedBy: 'admin',
        uploadedAt: '2023-01-10',
        expiryDate: '2024-01-10',
        tags: ['contract', 'employment'],
        permissions: [],
        status: 'active',
        lastAccessed: '2023-01-15'
      },
      {
        id: 'doc2',
        employeeId: '1',
        type: 'id',
        category: 'identification',
        name: 'ID Card',
        description: 'Employee identification document',
        fileUrl: '#',
        fileSize: 512000,
        mimeType: 'image/jpeg',
        version: 1,
        versions: [],
        uploadedBy: 'admin',
        uploadedAt: '2023-01-10',
        tags: ['id', 'identification'],
        permissions: [],
        status: 'active',
        lastAccessed: '2023-01-12'
      }
    ],
    status: 'active',
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: '2023-01-10T00:00:00Z'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+44-20-7946-0123',
    photo: 'https://via.placeholder.com/150',
    position: 'Product Manager',
    department: 'Product',
    hireDate: '2022-08-01',
    birthDate: '1988-03-15',
    gender: 'female',
    nationality: 'British',
    address: {
      street: '456 Oxford Street',
      city: 'London',
      state: 'England',
      country: 'UK',
      postalCode: 'W1D 1BS'
    },
    emergencyContact: {
      name: 'Michael Johnson',
      relationship: 'Brother',
      phone: '+44-20-7946-0124'
    },
    employmentDetails: {
      employmentType: 'full-time',
      workLocation: 'London Office',
      workSchedule: 'Monday-Friday, 9AM-5PM'
    },
    salaryInfo: {
      baseSalary: 95000,
      currency: 'GBP',
      payFrequency: 'monthly',
      allowances: [],
      deductions: [],
      bankDetails: {
        bankName: 'Barclays',
        accountNumber: '****5678',
        accountType: 'checking'
      }
    },
    documents: [],
    status: 'active',
    createdAt: '2022-08-01T00:00:00Z',
    updatedAt: '2022-08-01T00:00:00Z'
  }
];

const EmployeePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [employees] = useState<Employee[]>(mockEmployees);
  const [filters, setFilters] = useState<AdvancedEmployeeFilters>(createDefaultFilters());
  const [sortConfig, setSortConfig] = useState<SortConfig>(createDefaultSort());
  const [loading, setLoading] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(emp => emp.status === 'active').length;
    const departments = [...new Set(employees.map(emp => emp.department))].length;
    const countries = [...new Set(employees.map(emp => emp.address.country))].length;

    return { total, active, departments, countries };
  }, [employees]);

  const handleEmployeeClick = (employee: Employee) => {
    navigate(`/basic-data/employees/${employee.id}`);
  };

  const handleEditEmployee = (employee: Employee) => {
    // Navigate to edit page or open edit dialog
    console.log('Edit employee:', employee);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    // Handle delete logic
    console.log('Delete employee:', employee);
  };

  const handleAddEmployee = () => {
    // Navigate to add employee page
    navigate('/basic-data/employees/create');
  };

  const handleBulkEdit = (selectedEmployees: Employee[]) => {
    // Handle bulk edit - could open a bulk edit dialog or navigate to bulk edit page
    console.log('Bulk edit employees:', selectedEmployees);
    // For now, just show an alert
    alert(`Bulk edit ${selectedEmployees.length} employees - Feature coming soon!`);
  };

  const handleBulkDelete = (selectedEmployees: Employee[]) => {
    // Handle bulk delete - could open a confirmation dialog
    console.log('Bulk delete employees:', selectedEmployees);
    if (window.confirm(`Are you sure you want to delete ${selectedEmployees.length} employees?`)) {
      // Implement bulk delete logic
      alert(`Bulk delete ${selectedEmployees.length} employees - Feature coming soon!`);
    }
  };

  const handleBulkExport = (selectedEmployees: Employee[]) => {
    // Handle bulk export - could export to CSV, Excel, etc.
    console.log('Bulk export employees:', selectedEmployees);
    // For now, just show an alert
    alert(`Bulk export ${selectedEmployees.length} employees - Feature coming soon!`);
  };


  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" color="inherit">
          Home
        </MuiLink>
        <Typography color="text.primary">Employees</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Employee Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your worldwide workforce with comprehensive employee profiles
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddEmployee}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.8)})`
            }
          }}
        >
          Add Employee
        </Button>
      </Box>

      {/* Stats Overview */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            minWidth: 200
          }}
        >
          <People sx={{ mr: 2, color: theme.palette.primary.main, fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Employees
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            minWidth: 200
          }}
        >
          <People sx={{ mr: 2, color: theme.palette.success.main, fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {stats.active}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Employees
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.info.main, 0.1),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            minWidth: 200
          }}
        >
          <Business sx={{ mr: 2, color: theme.palette.info.main, fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {stats.departments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Departments
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            minWidth: 200
          }}
        >
          <Public sx={{ mr: 2, color: theme.palette.warning.main, fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {stats.countries}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Countries
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Employee List */}
      <EmployeeList
        employees={employees}
        loading={loading}
        onEmployeeClick={handleEmployeeClick}
        onEditEmployee={handleEditEmployee}
        onDeleteEmployee={handleDeleteEmployee}
        onAddEmployee={handleAddEmployee}
        onBulkEdit={handleBulkEdit}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        filters={filters}
        onFiltersChange={setFilters}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
      />

    </Box>
  );
};

export default EmployeePage;