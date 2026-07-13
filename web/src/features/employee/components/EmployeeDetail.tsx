/* eslint-disable react/prop-types */
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Grid,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Business,
  CalendarToday,
  Edit,
  Delete,
  Close,
  CheckCircle,
  Cancel,
  Schedule,
  AccountBalance,
  Description,
  ContactEmergency,
  Assessment,
  Chat,
} from "@mui/icons-material";
import { Employee } from "../types/Employee";
import PerformanceTab from "./PerformanceTab";
import TimeTrackingTab from "./timeTracking/TimeTrackingTab";
import CommunicationTab from "./CommunicationTab";

interface EmployeeDetailProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onClose?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  employee,
  onEdit,
  onDelete,
  onClose,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "terminated":
        return "error";
      case "on-leave":
        return "info";
      default:
        return "primary";
    }
  };

  const getStatusIcon = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle />;
      case "inactive":
        return <Cancel />;
      case "terminated":
        return <Cancel />;
      case "on-leave":
        return <Schedule />;
      default:
        return <CheckCircle />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDeleteConfirm = () => {
    onDelete?.(employee);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      {/* Top Section with Photo and Basic Data */}
      <Card
        sx={{
          maxWidth: 1200,
          mx: "auto",
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 4,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: theme.palette.mode === 'dark'
              ? '0 12px 40px rgba(0, 0, 0, 0.4)'
              : '0 12px 40px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardContent sx={{ pb: 3, px: 4, pt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.palette[getStatusColor(employee.status)].main}, ${alpha(theme.palette[getStatusColor(employee.status)].main, 0.8)})`,
                      border: `3px solid ${theme.palette.background.paper}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 2px 8px ${alpha(theme.palette[getStatusColor(employee.status)].main, 0.3)}`,
                      animation: 'pulse 2s infinite'
                    }}
                  >
                    {getStatusIcon(employee.status)}
                  </Box>
                }
              >
                <Avatar
                  src={employee.photo}
                  sx={{
                    width: 140,
                    height: 140,
                    border: `4px solid ${alpha(theme.palette.primary.main, 0.3)}`,
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
              </Badge>

              <Box sx={{ ml: 5, flex: 1 }}>
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
                  {employee.firstName} {employee.lastName}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 1,
                    fontWeight: 500
                  }}
                >
                  {employee.position}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 3,
                    fontWeight: 400
                  }}
                >
                  {employee.department} • Employee ID: {employee.employeeId}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                  <Chip
                    icon={<LocationOn />}
                    label={`${employee.address.city}, ${employee.address.country}`}
                    variant="filled"
                    size="medium"
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.light, 0.2)})`,
                      color: theme.palette.info.main,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      '& .MuiChip-icon': {
                        color: theme.palette.info.main
                      }
                    }}
                  />
                  <Chip
                    icon={<CalendarToday />}
                    label={`Hired ${formatDate(employee.hireDate)}`}
                    variant="filled"
                    size="medium"
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.light, 0.2)})`,
                      color: theme.palette.success.main,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      '& .MuiChip-icon': {
                        color: theme.palette.success.main
                      }
                    }}
                  />
                  <Chip
                    icon={<Business />}
                    label={employee.employmentDetails.employmentType.replace('-', ' ')}
                    variant="filled"
                    size="medium"
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.light, 0.2)})`,
                      color: theme.palette.warning.main,
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                      '& .MuiChip-icon': {
                        color: theme.palette.warning.main
                      }
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={employee.status.charAt(0).toUpperCase() + employee.status.slice(1).replace('-', ' ')}
                    color={getStatusColor(employee.status)}
                    size="medium"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      px: 2,
                      py: 1,
                      boxShadow: `0 2px 8px ${alpha(theme.palette[getStatusColor(employee.status)].main, 0.2)}`
                    }}
                  />
                  <Chip
                    icon={<Email />}
                    label={employee.email}
                    variant="outlined"
                    size="medium"
                    sx={{
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      color: theme.palette.primary.main,
                      '& .MuiChip-icon': {
                        color: theme.palette.primary.main
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  />
                  <Chip
                    icon={<Phone />}
                    label={employee.phone}
                    variant="outlined"
                    size="medium"
                    sx={{
                      borderColor: alpha(theme.palette.secondary.main, 0.3),
                      color: theme.palette.secondary.main,
                      '& .MuiChip-icon': {
                        color: theme.palette.secondary.main
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.secondary.main, 0.05)
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'flex-end' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {onEdit && (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => onEdit(employee)}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '0.95rem',
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
                    Edit Profile
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      borderWidth: 2,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        borderWidth: 2,
                        backgroundColor: alpha(theme.palette.error.main, 0.05),
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`
                      }
                    }}
                  >
                    Delete Employee
                  </Button>
                )}
              </Box>

              {onClose && (
                <IconButton
                  onClick={onClose}
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: alpha(theme.palette.grey[500], 0.1),
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.grey[500], 0.2),
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <Close />
                </IconButton>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Card
        sx={{
          maxWidth: 1200,
          mx: "auto",
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 4,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}
      >

        {/* Tabs */}
        <Box sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          px: 2
        }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              "& .MuiTab-root": {
                minHeight: 56,
                textTransform: "none",
                fontWeight: 600,
                fontSize: '0.95rem',
                borderRadius: 2,
                mx: 0.5,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
                '&.Mui-selected': {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.1)})`,
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                }
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }
            }}
          >
            <Tab
              label="Overview"
              icon={<Person sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
            <Tab
              label="Personal Info"
              icon={<ContactEmergency sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
            <Tab
              label="Employment"
              icon={<Business sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
            <Tab
              label="Salary & Benefits"
              icon={<AccountBalance sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
            <Tab
              label="Documents"
              icon={<Description sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
            <Tab
              label="Performance"
              icon={<Assessment sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
            <Tab
              label="Time Tracking"
              icon={<Schedule sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
            <Tab
              label="Communication"
              icon={<Chat sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <TabPanel value={activeTab} index={0}>
          {/* Overview Tab */}
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 700,
                      color: theme.palette.primary.main
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.1)})`,
                        mr: 2
                      }}
                    >
                      <Email sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    Contact Information
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}
                    >
                      <Email
                        sx={{
                          mr: 3,
                          color: theme.palette.primary.main,
                          fontSize: 24,
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          Email Address
                        </Typography>
                        <Typography sx={{ fontWeight: 500 }}>{employee.email}</Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                      }}
                    >
                      <Phone
                        sx={{
                          mr: 3,
                          color: theme.palette.secondary.main,
                          fontSize: 24,
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.secondary.main, 0.1)
                        }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          Phone Number
                        </Typography>
                        <Typography sx={{ fontWeight: 500 }}>{employee.phone}</Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.info.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                      }}
                    >
                      <LocationOn
                        sx={{
                          mr: 3,
                          color: theme.palette.info.main,
                          fontSize: 24,
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.info.main, 0.1)
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          Address
                        </Typography>
                        <Typography sx={{ fontWeight: 500 }}>
                          {employee.address.street}, {employee.address.city}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {employee.address.state} {employee.address.postalCode}, {employee.address.country}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.15)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 700,
                      color: theme.palette.success.main
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.light, 0.1)})`,
                        mr: 2
                      }}
                    >
                      <Business sx={{ color: theme.palette.success.main }} />
                    </Box>
                    Employment Details
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.success.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Department
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>{employee.department}</Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.warning.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Position
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>{employee.position}</Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.info.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Employment Type
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {employee.employmentDetails.employmentType.replace("-", " ")}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Work Location
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {employee.employmentDetails.workLocation}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Personal Info Tab */}
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.15)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 700,
                      color: theme.palette.info.main
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.light, 0.1)})`,
                        mr: 2
                      }}
                    >
                      <Person sx={{ color: theme.palette.info.main }} />
                    </Box>
                    Basic Information
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.info.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Full Name
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {employee.firstName} {employee.lastName}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Employee ID
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', fontFamily: 'monospace' }}>{employee.employeeId}</Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.success.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Date of Birth
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {employee.birthDate
                          ? formatDate(employee.birthDate)
                          : "Not specified"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.warning.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Gender
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {employee.gender
                          ? employee.gender.charAt(0).toUpperCase() +
                            employee.gender.slice(1)
                          : "Not specified"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Marital Status
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {employee.maritalStatus
                          ? employee.maritalStatus.charAt(0).toUpperCase() +
                            employee.maritalStatus.slice(1)
                          : "Not specified"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.error.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Nationality
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>{employee.nationality}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.error.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.15)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 700,
                      color: theme.palette.error.main
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.error.light, 0.1)})`,
                        mr: 2
                      }}
                    >
                      <ContactEmergency sx={{ color: theme.palette.error.main }} />
                    </Box>
                    Emergency Contact
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.error.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Name
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>{employee.emergencyContact.name}</Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.warning.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Relationship
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {employee.emergencyContact.relationship}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.info.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Phone
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>{employee.emergencyContact.phone}</Typography>
                    </Box>
                    {employee.emergencyContact.email && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                          Email
                        </Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {employee.emergencyContact.email}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Employment Tab */}
          <Grid container spacing={4}>
             <Grid size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.15)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 700,
                      color: theme.palette.warning.main
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.light, 0.1)})`,
                        mr: 2
                      }}
                    >
                      <Business sx={{ color: theme.palette.warning.main }} />
                    </Box>
                    Employment Information
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.warning.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Employment Type
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {employee.employmentDetails.employmentType.replace("-", " ")}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.info.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Work Location
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {employee.employmentDetails.workLocation}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Work Schedule
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {employee.employmentDetails.workSchedule}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.success.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Hire Date
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>{formatDate(employee.hireDate)}</Typography>
                    </Box>
                    {employee.employmentDetails.probationEndDate && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.secondary.main, 0.02),
                          border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                          Probation End Date
                        </Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {formatDate(employee.employmentDetails.probationEndDate)}
                        </Typography>
                      </Box>
                    )}
                    {employee.employmentDetails.contractEndDate && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.error.main, 0.02),
                          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                          Contract End Date
                        </Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {formatDate(employee.employmentDetails.contractEndDate)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

             <Grid size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.15)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 700,
                      color: theme.palette.secondary.main
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
                        mr: 2
                      }}
                    >
                      <Person sx={{ color: theme.palette.secondary.main }} />
                    </Box>
                    Manager Information
                  </Typography>
                  {employee.managerId ? (
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                        textAlign: 'center'
                      }}
                    >
                      <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                        Manager information would be displayed here when available
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.grey[500], 0.02),
                        border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                        textAlign: 'center'
                      }}
                    >
                      <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                        No manager assigned
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* Salary & Benefits Tab */}
          <Grid container spacing={4}>
             <Grid size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.15)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 700,
                      color: theme.palette.success.main
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.light, 0.1)})`,
                        mr: 2
                      }}
                    >
                      <AccountBalance sx={{ color: theme.palette.success.main }} />
                    </Box>
                    Salary Information
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.success.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>
                        Base Salary
                      </Typography>
                      <Typography variant="h5" sx={{ color: theme.palette.success.main, fontWeight: 700, mb: 0.5 }}>
                        {formatCurrency(
                          employee.salaryInfo.baseSalary,
                          employee.salaryInfo.currency
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {employee.salaryInfo.payFrequency}
                      </Typography>
                    </Box>

                    {employee.salaryInfo.allowances.length > 0 && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.info.main, 0.02),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}
                        >
                          Allowances
                        </Typography>
                        {employee.salaryInfo.allowances.map(
                          (allowance, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                                p: 1,
                                borderRadius: 1,
                                backgroundColor: alpha(theme.palette.info.main, 0.05)
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {allowance.type}
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                                +{formatCurrency(
                                  allowance.amount,
                                  employee.salaryInfo.currency
                                )}
                              </Typography>
                            </Box>
                          )
                        )}
                      </Box>
                    )}

                    {employee.salaryInfo.deductions.length > 0 && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.error.main, 0.02),
                          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}
                        >
                          Deductions
                        </Typography>
                        {employee.salaryInfo.deductions.map(
                          (deduction, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                                p: 1,
                                borderRadius: 1,
                                backgroundColor: alpha(theme.palette.error.main, 0.05)
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {deduction.type}
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                                -{formatCurrency(
                                  deduction.amount,
                                  employee.salaryInfo.currency
                                )}
                              </Typography>
                            </Box>
                          )
                        )}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 700,
                      color: theme.palette.primary.main
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.1)})`,
                        mr: 2
                      }}
                    >
                      <AccountBalance sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    Banking Information
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Bank Name
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {employee.salaryInfo.bankDetails.bankName}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Account Number
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', fontFamily: 'monospace', letterSpacing: 1 }}>
                        ****{employee.salaryInfo.bankDetails.accountNumber.slice(-4)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.warning.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        Account Type
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {employee.salaryInfo.bankDetails.accountType}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          {/* Documents Tab */}
          <Card
            variant="outlined"
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.grey[100], 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.grey[400], 0.1)}`,
              borderRadius: 3,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: `0 8px 24px ${alpha(theme.palette.grey[400], 0.15)}`,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 700,
                  color: theme.palette.grey[700]
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.1)}, ${alpha(theme.palette.grey[400], 0.1)})`,
                    mr: 2
                  }}
                >
                  <Description sx={{ color: theme.palette.grey[700] }} />
                </Box>
                Employee Documents
              </Typography>

              {employee.documents.length > 0 ? (
                <Grid container spacing={3}>
                  {employee.documents.map((doc) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                          transition: 'all 0.3s ease-in-out',
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                            transform: 'translateY(-2px)',
                            borderColor: alpha(theme.palette.primary.main, 0.3)
                          }
                        }}
                        onClick={() => window.open(doc.fileUrl, "_blank")}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.1)})`,
                              mr: 2
                            }}
                          >
                            <Description sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                          </Box>
                          <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600, color: theme.palette.primary.main }}>
                            {doc.name}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              display: 'inline-block',
                              mb: 1
                            }}
                          >
                            {doc.type}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          📅 Uploaded: {formatDate(doc.uploadedAt)}
                        </Typography>
                        {doc.expiryDate && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.warning.main,
                              fontWeight: 500,
                              display: 'block',
                              mb: 1
                            }}
                          >
                            ⏰ Expires: {formatDate(doc.expiryDate)}
                          </Typography>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{
                            mt: 1,
                            borderRadius: 2,
                            fontWeight: 600,
                            textTransform: 'none',
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            color: theme.palette.primary.main,
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              backgroundColor: alpha(theme.palette.primary.main, 0.05)
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(doc.fileUrl, "_blank");
                          }}
                        >
                          View Document
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    px: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.5)} 0%, ${alpha(theme.palette.grey[100], 0.3)} 100%)`,
                    border: `2px dashed ${alpha(theme.palette.grey[400], 0.3)}`
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.grey[300], 0.2)}, ${alpha(theme.palette.grey[400], 0.1)})`,
                      display: 'inline-flex',
                      mb: 3
                    }}
                  >
                    <Description
                      sx={{
                        fontSize: 64,
                        color: theme.palette.grey[500],
                        opacity: 0.7
                      }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ color: theme.palette.grey[700], fontWeight: 600, mb: 1 }}>
                    No documents uploaded
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.grey[600], fontWeight: 400 }}>
                    Employee documents will appear here when uploaded
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          {/* Performance Tab */}
          <PerformanceTab employeeId={employee.id} />
        </TabPanel>

        <TabPanel value={activeTab} index={6}>
          {/* Time Tracking Tab */}
          <TimeTrackingTab employee={employee} />
        </TabPanel>

        <TabPanel value={activeTab} index={7}>
          {/* Communication Tab */}
          <CommunicationTab employee={employee} />
        </TabPanel>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {employee.firstName}{" "}
            {employee.lastName}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmployeeDetail;
