/* eslint-disable react/prop-types */
import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Pagination,
  Skeleton,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Checkbox,
  Button,
} from "@mui/material";
import {
  Search,
  FilterList,
  Person,
  Email,
  Phone,
  LocationOn,
  Business,
  Edit,
  Delete,
  Visibility,
  Add,
  CheckBox,
  CheckBoxOutlineBlank,
  MoreVert,
  FileDownload,
  Clear,
  ViewList,
  ViewModule,
} from "@mui/icons-material";
import { Employee, AdvancedEmployeeFilters, SortConfig } from "../types/Employee";
import { filterEmployees, generateFilterStats, createDefaultFilters, createDefaultSort, exportFilteredEmployees } from "../utils/employeeFilters";
import EmployeeFilters from "./EmployeeFilters";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

interface EmployeeListProps {
  employees: Employee[];
  loading?: boolean;
  onEmployeeClick?: (employee: Employee) => void;
  onEditEmployee?: (employee: Employee) => void;
  onDeleteEmployee?: (employee: Employee) => void;
  onAddEmployee?: () => void;
  onBulkEdit?: (employees: Employee[]) => void;
  onBulkDelete?: (employees: Employee[]) => void;
  onBulkExport?: (employees: Employee[]) => void;
  filters?: AdvancedEmployeeFilters;
  onFiltersChange?: (filters: AdvancedEmployeeFilters) => void;
  sortConfig?: SortConfig;
  onSortChange?: (sort: SortConfig) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  loading = false,
  onEmployeeClick,
  onEditEmployee,
  onDeleteEmployee,
  onAddEmployee,
  onBulkEdit,
  onBulkDelete,
  onBulkExport,
  filters = createDefaultFilters(),
  onFiltersChange,
  sortConfig = createDefaultSort(),
  onSortChange,
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const itemsPerPage = 12;

  // Generate filter stats for the advanced filters component
  const filterStats = useMemo(() => generateFilterStats(employees), [employees]);

  // Apply advanced filtering and sorting
  const searchResult = useMemo(() => {
    return filterEmployees(employees, filters, sortConfig);
  }, [employees, filters, sortConfig]);

  const filteredEmployees = searchResult.employees;

  // Paginate employees
  const paginatedEmployees = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmployees, page]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleFiltersChange = (newFilters: AdvancedEmployeeFilters) => {
    onFiltersChange?.(newFilters);
    setPage(1); // Reset to first page
  };

  const handleSortChange = (newSort: SortConfig) => {
    onSortChange?.(newSort);
  };

  const handleResetFilters = () => {
    const defaultFilters = createDefaultFilters();
    const defaultSort = createDefaultSort();
    onFiltersChange?.(defaultFilters);
    onSortChange?.(defaultSort);
    setPage(1);
  };

  const handleSelectEmployee = (employee: Employee, checked: boolean) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, employee]);
    } else {
      setSelectedEmployees(prev => prev.filter(emp => emp.id !== employee.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(paginatedEmployees);
      setSelectAll(true);
    } else {
      setSelectedEmployees([]);
      setSelectAll(false);
    }
  };

  const handleBulkEdit = () => {
    onBulkEdit?.(selectedEmployees);
  };

  const handleBulkDelete = () => {
    onBulkDelete?.(selectedEmployees);
  };

  const handleBulkExport = () => {
    if (selectedEmployees.length > 0) {
      exportFilteredEmployees(selectedEmployees, 'selected_employees');
    } else {
      exportFilteredEmployees(filteredEmployees, 'filtered_employees');
    }
  };

  const clearSelection = () => {
    setSelectedEmployees([]);
    setSelectAll(false);
  };

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

  const getStatusLabel = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "terminated":
        return "Terminated";
      case "on-leave":
        return "On Leave";
      default:
        return status;
    }
  };

  // Table columns definition
  const tableColumns: GridColDef<Employee>[] = [
    {
      field: 'select',
      headerName: '',
      width: 50,
      renderHeader: () => (
        <Checkbox
          checked={selectAll}
          indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < paginatedEmployees.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
          size="small"
        />
      ),
      renderCell: (params) => (
        <Checkbox
          checked={selectedEmployees.some(emp => emp.id === params.row.id)}
          onChange={(e) => handleSelectEmployee(params.row, e.target.checked)}
          size="small"
        />
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'photo',
      headerName: 'Photo',
      width: 80,
      renderCell: (params) => (
        <Avatar
          src={params.row.photo}
          sx={{ width: 40, height: 40 }}
        >
          <Person />
        </Avatar>
      ),
      sortable: false,
      filterable: false,
    },
    // {
    //   field: 'firstName',
    //   headerName: 'Name',
    //   width: 200,
    //   valueGetter: (params) =>
    //     `${params} ${params}`,
    //   renderCell: (params) => (
    //     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    //       <Typography variant="body2" sx={{ fontWeight: 600 }}>
    //         {params.row.firstName} {params.row.lastName}
    //       </Typography>
    //     </Box>
    //   ),
    // },
    {
      field: 'position',
      headerName: 'Position',
      width: 150,
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 120,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 150,
      valueGetter: (params) =>
      {
        console.log("params : ",params);
        // `${params.address}, ${params.address}`;

      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.row.status)}
          size="small"
          color={getStatusColor(params.row.status)}
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {onEmployeeClick && (
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => onEmployeeClick?.(params.row)}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onEditEmployee && (
            <Tooltip title="Edit Employee">
              <IconButton
                size="small"
                onClick={() => onEditEmployee?.(params.row)}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDeleteEmployee && (
            <Tooltip title="Delete Employee">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDeleteEmployee?.(params.row)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  if (loading) {
    return (
      <Box>
        {/* Search and filters skeleton */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <Skeleton variant="rectangular" width={300} height={40} />
          <Skeleton variant="rectangular" width={100} height={40} />
        </Box>

        {/* Employee cards skeleton */}
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
              <Card sx={{ height: 200 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Skeleton
                      variant="circular"
                      width={50}
                      height={50}
                      sx={{ mr: 2 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="80%" height={24} />
                      <Skeleton variant="text" width="60%" height={20} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" width="100%" height={16} />
                  <Skeleton variant="text" width="100%" height={16} />
                  <Skeleton variant="text" width="100%" height={16} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Advanced Filters Component */}
      <EmployeeFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        filterStats={filterStats}
        onReset={handleResetFilters}
      />

      {/* View Toggle and Add Button */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* View Toggle */}
        <Box sx={{ display: 'flex', borderRadius: 1, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
          <IconButton
            onClick={() => setViewMode('cards')}
            size="small"
            sx={{
              borderRadius: 0,
              backgroundColor: viewMode === 'cards' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              color: viewMode === 'cards' ? theme.palette.primary.main : 'inherit',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            <ViewModule fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => setViewMode('table')}
            size="small"
            sx={{
              borderRadius: 0,
              backgroundColor: viewMode === 'table' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              color: viewMode === 'table' ? theme.palette.primary.main : 'inherit',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            <ViewList fontSize="small" />
          </IconButton>
        </Box>

        {onAddEmployee && (
          <Tooltip title="Add Employee">
            <IconButton
              onClick={onAddEmployee}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "white",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Bulk Actions Toolbar */}
      {selectedEmployees.length > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedEmployees.length} employee{selectedEmployees.length > 1 ? 's' : ''} selected
            </Typography>
            <Button
              size="small"
              onClick={clearSelection}
              startIcon={<Clear />}
            >
              Clear Selection
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {onBulkExport && (
              <Button
                size="small"
                variant="outlined"
                onClick={handleBulkExport}
                startIcon={<FileDownload />}
              >
                Export
              </Button>
            )}
            {onBulkEdit && (
              <Button
                size="small"
                variant="outlined"
                onClick={handleBulkEdit}
                startIcon={<Edit />}
              >
                Bulk Edit
              </Button>
            )}
            {onBulkDelete && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleBulkDelete}
                startIcon={<Delete />}
              >
                Bulk Delete
              </Button>
            )}
          </Box>
        </Box>
      )}


      {/* Results count and Select All */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedEmployees.length} of {filteredEmployees.length}{" "}
            employees
          </Typography>
          {paginatedEmployees.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                checked={selectAll}
                indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < paginatedEmployees.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                size="small"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Select All ({paginatedEmployees.length})
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Employee View - Cards or Table */}
      {viewMode === 'cards' ? (
        <Grid container spacing={3}>
          {paginatedEmployees.map((employee) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={employee.id}>
              <Card
                sx={{
                  height: "100%",
                  cursor: onEmployeeClick ? "pointer" : "default",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: onEmployeeClick ? "translateY(-4px)" : "none",
                    boxShadow: theme.shadows[8],
                  },
                }}
                onClick={() => onEmployeeClick?.(employee)}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Selection Checkbox */}
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Checkbox
                      checked={selectedEmployees.some(emp => emp.id === employee.id)}
                      onChange={(e) => handleSelectEmployee(employee, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      size="small"
                    />
                  </Box>

                  {/* Employee header */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor:
                              theme.palette[getStatusColor(employee.status)].main,
                          }}
                        />
                      }
                    >
                      <Avatar
                        src={employee.photo}
                        sx={{
                          width: 60,
                          height: 60,
                          mr: 2,
                          border: `2px solid ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                        }}
                      >
                        <Person />
                      </Avatar>
                    </Badge>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                        {employee.firstName} {employee.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {employee.position}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Employee details */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Email
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                        {employee.email}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Phone
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" noWrap>
                        {employee.phone}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Business
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" noWrap>
                        {employee.department}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LocationOn
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" noWrap>
                        {employee.address.city}, {employee.address.country}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status and actions */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      label={getStatusLabel(employee.status)}
                      size="small"
                      color={getStatusColor(employee.status)}
                      variant="outlined"
                    />

                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {onEmployeeClick && (
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEmployeeClick(employee);
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {onEditEmployee && (
                        <Tooltip title="Edit Employee">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEmployee(employee);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {onDeleteEmployee && (
                        <Tooltip title="Delete Employee">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEmployee(employee);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* Table View */
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={paginatedEmployees}
            columns={tableColumns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: itemsPerPage },
              },
            }}
            pageSizeOptions={[12, 25, 50]}
            checkboxSelection={false}
            disableRowSelectionOnClick
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            hideFooterPagination
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderBottom: `2px solid ${theme.palette.primary.main}`,
              },
            }}
          />
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Empty state */}
      {filteredEmployees.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Person sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No employees found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filters.search || Object.keys(filters).some(key => {
              const value = filters[key as keyof AdvancedEmployeeFilters];
              if (Array.isArray(value)) return value.length > 0;
              if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v => v !== undefined && v !== null && v !== '');
              }
              return value !== undefined && value !== null && value !== '';
            })
              ? "Try adjusting your search or filters"
              : "Start by adding your first employee"}
          </Typography>
          {onAddEmployee && (
            <Box sx={{ mt: 2 }}>
              <IconButton
                onClick={onAddEmployee}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                <Add />
              </IconButton>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EmployeeList;
