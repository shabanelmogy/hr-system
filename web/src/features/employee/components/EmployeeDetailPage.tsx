/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  useTheme,
  alpha,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  ArrowBack,
  Edit,
  Delete
} from '@mui/icons-material';
import EmployeeDetail from './EmployeeDetail';
import { Employee } from '../types/Employee';

// Mock data - replace with actual API call
const mockEmployee: Employee = {
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
};

const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchEmployee = async () => {
      setLoading(true);
      // In real app, fetch from API using id
      await new Promise(resolve => setTimeout(resolve, 500));
      setEmployee(mockEmployee);
      setLoading(false);
    };

    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const handleEdit = (employee: Employee) => {
    // Navigate to edit page
    navigate(`/basic-data/employees/${employee.id}/edit`);
  };

  const handleDelete = (employee: Employee) => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    // Handle delete logic
    console.log('Delete employee:', employee);
    setDeleteDialogOpen(false);
    navigate('/basic-data/employees');
  };

  const handleClose = () => {
    navigate('/basic-data/employees');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading employee details...</Typography>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Employee not found</Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/basic-data/employees')}
          sx={{ mt: 2 }}
        >
          Back to Employees
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Box sx={{ p: 3, pb: 0 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/" color="inherit">
            Home
          </MuiLink>
          <MuiLink component={Link} to="/basic-data/employees" color="inherit">
            Employees
          </MuiLink>
          <Typography color="text.primary">
            {employee.firstName} {employee.lastName}
          </Typography>
        </Breadcrumbs>

        {/* Header Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/basic-data/employees')}
            variant="outlined"
          >
            Back to Employees
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<Edit />}
              variant="contained"
              onClick={() => handleEdit(employee)}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.8)})`
                }
              }}
            >
              Edit Employee
            </Button>

            <Button
              startIcon={<Delete />}
              variant="outlined"
              color="error"
              onClick={() => handleDelete(employee)}
            >
              Delete Employee
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Employee Detail Component */}
      <EmployeeDetail
        employee={employee}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClose={handleClose}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {employee.firstName} {employee.lastName}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDetailPage;