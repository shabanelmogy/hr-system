/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  useTheme,
  alpha,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Business,
  ArrowBack,
  ArrowForward,
  Save,
  PhotoCamera,
  CalendarToday,
  AccountBalance,
  ContactEmergency
} from '@mui/icons-material';
import { Employee } from '../types/Employee';
import FormCard from './FormCard';

// Mock data for dropdowns
const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const POSITIONS = ['Software Engineer', 'Senior Engineer', 'Manager', 'Director', 'VP', 'CEO'];
const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'intern'];
const COUNTRIES = ['USA', 'UK', 'Canada', 'Germany', 'France', 'Australia'];

const steps = ['Basic Information', 'Employment Details'];

interface EmployeeFormProps {
  mode: 'create' | 'edit';
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Partial<Employee>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    employmentDetails: {
      employmentType: 'full-time',
      workLocation: '',
      workSchedule: 'Monday-Friday, 9AM-5PM'
    },
    address: {
      street: '',
      city: '',
      state: '',
      country: 'USA',
      postalCode: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    salaryInfo: {
      baseSalary: 0,
      currency: 'USD',
      payFrequency: 'monthly',
      allowances: [],
      deductions: [],
      bankDetails: {
        bankName: '',
        accountNumber: '',
        accountType: 'checking'
      }
    }
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      // Load employee data for editing
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setEmployee({
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
            allowances: [],
            deductions: [],
            bankDetails: {
              bankName: 'Chase Bank',
              accountNumber: '****1234',
              accountType: 'checking'
            }
          },
          status: 'active',
          createdAt: '2023-01-10T00:00:00Z',
          updatedAt: '2023-01-10T00:00:00Z'
        });
        setLoading(false);
      }, 500);
    }
  }, [mode, id]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (mode === 'create') {
      navigate('/basic-data/employees');
    } else {
      navigate(`/basic-data/employees/${id}`);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEmployee(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField: keyof Employee, field: string, value: any) => {
    setEmployee(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [field]: value
      }
    }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {/* Photo Upload */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormCard
                title="Profile Photo"
                icon={<PhotoCamera />}
                color="primary"
                sx={{
                  textAlign: 'center',
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)} !important`,
                  '&:hover': {
                    borderColor: `${theme.palette.primary.main} !important`,
                  }
                }}
              >
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <Avatar
                    src={employee.photo}
                    sx={{
                      width: 140,
                      height: 140,
                      mx: 'auto',
                      border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.2)})`,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                      }
                    }}
                  >
                    <Person sx={{ fontSize: 70, color: theme.palette.primary.main }} />
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      right: -10,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                      color: 'white',
                      width: 48,
                      height: 48,
                      boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.8)})`,
                        transform: 'scale(1.1)',
                        boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                      }
                    }}
                    size="large"
                  >
                    <PhotoCamera sx={{ fontSize: 24 }} />
                  </IconButton>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    mb: 1
                  }}
                >
                  Upload Profile Picture
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: 'block',
                    opacity: 0.7
                  }}
                >
                  JPG, PNG or GIF (max. 5MB)
                </Typography>
              </FormCard>
            </Grid>

            {/* Basic Information */}
            <Grid size={{ xs: 12, md: 8 }}>
              <FormCard
                title="Basic Information"
                icon={<Person />}
                color="success"
              >
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={employee.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={employee.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={employee.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={employee.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    >
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={employee.department || ''}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        label="Department"
                      >
                        {DEPARTMENTS.map(dept => (
                          <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    >
                      <InputLabel>Position</InputLabel>
                      <Select
                        value={employee.position || ''}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        label="Position"
                      >
                        {POSITIONS.map(pos => (
                          <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </FormCard>
            </Grid>

            {/* Address Information */}
            <Grid size={{ xs: 12 }}>
              <FormCard
                title="Address Information"
                icon={<LocationOn />}
                color="info"
              >
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={employee.address?.street || ''}
                      onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      label="City"
                      value={employee.address?.city || ''}
                      onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      label="State/Province"
                      value={employee.address?.state || ''}
                      onChange={(e) => handleNestedInputChange('address', 'state', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    >
                      <InputLabel>Country</InputLabel>
                      <Select
                        value={employee.address?.country || 'USA'}
                        onChange={(e) => handleNestedInputChange('address', 'country', e.target.value)}
                        label="Country"
                      >
                        {COUNTRIES.map(country => (
                          <MenuItem key={country} value={country}>{country}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Postal Code"
                      value={employee.address?.postalCode || ''}
                      onChange={(e) => handleNestedInputChange('address', 'postalCode', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </FormCard>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            {/* Employment Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormCard
                title="Employment Details"
                icon={<Business />}
                color="warning"
              >
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <FormControl
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    >
                      <InputLabel>Employment Type</InputLabel>
                      <Select
                        value={employee.employmentDetails?.employmentType || 'full-time'}
                        onChange={(e) => handleNestedInputChange('employmentDetails', 'employmentType', e.target.value)}
                        label="Employment Type"
                      >
                        {EMPLOYMENT_TYPES.map(type => (
                          <MenuItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Work Location"
                      value={employee.employmentDetails?.workLocation || ''}
                      onChange={(e) => handleNestedInputChange('employmentDetails', 'workLocation', e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Work Schedule"
                      value={employee.employmentDetails?.workSchedule || ''}
                      onChange={(e) => handleNestedInputChange('employmentDetails', 'workSchedule', e.target.value)}
                      placeholder="e.g., Monday-Friday, 9AM-5PM"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Hire Date"
                      type="date"
                      value={employee.hireDate || ''}
                      onChange={(e) => handleInputChange('hireDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </FormCard>
            </Grid>

            {/* Salary Information */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormCard
                title="Salary Information"
                icon={<AccountBalance />}
                color="secondary"
              >
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField
                      fullWidth
                      label="Base Salary"
                      type="number"
                      value={employee.salaryInfo?.baseSalary || ''}
                      onChange={(e) => handleNestedInputChange('salaryInfo', 'baseSalary', parseFloat(e.target.value) || 0)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    >
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={employee.salaryInfo?.currency || 'USD'}
                        onChange={(e) => handleNestedInputChange('salaryInfo', 'currency', e.target.value)}
                        label="Currency"
                      >
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                        <MenuItem value="GBP">GBP</MenuItem>
                        <MenuItem value="CAD">CAD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControl
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    >
                      <InputLabel>Pay Frequency</InputLabel>
                      <Select
                        value={employee.salaryInfo?.payFrequency || 'monthly'}
                        onChange={(e) => handleNestedInputChange('salaryInfo', 'payFrequency', e.target.value)}
                        label="Pay Frequency"
                      >
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="annually">Annually</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </FormCard>
            </Grid>

            {/* Emergency Contact */}
            <Grid size={{ xs: 12 }}>
              <FormCard
                title="Emergency Contact"
                icon={<ContactEmergency />}
                color="error"
              >
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Contact Name"
                      value={employee.emergencyContact?.name || ''}
                      onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Relationship"
                      value={employee.emergencyContact?.relationship || ''}
                      onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Contact Phone"
                      value={employee.emergencyContact?.phone || ''}
                      onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Contact Email"
                      type="email"
                      value={employee.emergencyContact?.email || ''}
                      onChange={(e) => handleNestedInputChange('emergencyContact', 'email', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </FormCard>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.5)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
      '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' }
      }
    }}>
      {/* Breadcrumbs */}
      <Box sx={{
        p: 4,
        pb: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Breadcrumbs
          sx={{
            mb: 3,
            '& .MuiBreadcrumbs-separator': {
              color: theme.palette.primary.main
            }
          }}
        >
          <MuiLink
            component={Link}
            to="/"
            sx={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Home
          </MuiLink>
          <MuiLink
            component={Link}
            to="/basic-data/employees"
            sx={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Employees
          </MuiLink>
          <Typography
            color="text.primary"
            sx={{
              fontWeight: 600,
              color: theme.palette.secondary.main
            }}
          >
            {mode === 'create' ? 'Create Employee' : 'Edit Employee'}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {mode === 'create' ? 'Create New Employee' : 'Edit Employee'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {mode === 'create'
                ? 'Fill in the details below to add a new employee to your organization'
                : 'Update employee information and settings'
              }
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/basic-data/employees')}
            variant="outlined"
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            Back to Employees
          </Button>
        </Box>
      </Box>

      {/* Stepper */}
      <Box sx={{ px: 4, pb: 3 }}>
        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 5,
            '& .MuiStepConnector-line': {
              borderColor: alpha(theme.palette.primary.main, 0.3),
              borderWidth: 2
            },
            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
              borderColor: theme.palette.primary.main,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            },
            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
              borderColor: theme.palette.success.main,
              background: theme.palette.success.main
            }
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontWeight: activeStep === index ? 700 : 500,
                    fontSize: '1rem',
                    color: activeStep === index ? theme.palette.primary.main : 'text.secondary'
                  },
                  '& .MuiStepIcon-root': {
                    width: 50,
                    height: 50,
                    color: activeStep === index
                      ? theme.palette.primary.main
                      : alpha(theme.palette.text.secondary, 0.3),
                    '&.Mui-active': {
                      color: theme.palette.primary.main,
                      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}`
                    },
                    '&.Mui-completed': {
                      color: theme.palette.success.main,
                      boxShadow: `0 0 0 4px ${alpha(theme.palette.success.main, 0.2)}`
                    }
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Form Content */}
      <Box sx={{ px: 3 }}>
        {renderStepContent(activeStep)}

        {/* Navigation Buttons */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 6,
          mb: 6,
          p: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backdropFilter: 'blur(10px)'
        }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            variant="outlined"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              borderWidth: 2,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`
              },
              '&:disabled': {
                opacity: 0.5,
                transform: 'none'
              }
            }}
          >
            Back
          </Button>

          <Box sx={{ display: 'flex', gap: 3 }}>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
                startIcon={loading ? undefined : <Save />}
                sx={{
                  px: 6,
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: '1rem',
                  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.8)})`,
                  boxShadow: `0 4px 16px ${alpha(theme.palette.success.main, 0.3)}`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${alpha(theme.palette.success.dark, 0.8)})`,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.4)}`,
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    opacity: 0.7,
                    transform: 'none',
                    background: theme.palette.grey[400]
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        border: `2px solid ${theme.palette.common.white}`,
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}
                    />
                    Saving...
                  </Box>
                ) : (
                  mode === 'create' ? 'Create Employee' : 'Save Changes'
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                sx={{
                  px: 6,
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: '1rem',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.8)})`,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Next Step
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeForm;