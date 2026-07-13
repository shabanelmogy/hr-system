/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  TextField,
  Chip,
  Button,
  Collapse,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Autocomplete,
  IconButton,
  Badge,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess,
  Sort,
  Refresh,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdvancedEmployeeFilters, FilterOption, SortConfig, FilterStats } from '../types/Employee';

interface EmployeeFiltersProps {
  filters: AdvancedEmployeeFilters;
  onFiltersChange: (filters: AdvancedEmployeeFilters) => void;
  sortConfig: SortConfig;
  onSortChange: (sort: SortConfig) => void;
  filterStats?: FilterStats;
  onReset: () => void;
}

const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  filters,
  onFiltersChange,
  sortConfig,
  onSortChange,
  filterStats,
  onReset,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters, onFiltersChange]);

  const handleFilterChange = (key: keyof AdvancedEmployeeFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleMultiSelectChange = (key: keyof AdvancedEmployeeFilters, values: string[]) => {
    onFiltersChange({ ...filters, [key]: values });
  };

  const handleDateRangeChange = (type: 'start' | 'end', date: Date | null) => {
    onFiltersChange({
      ...filters,
      hireDateRange: {
        ...filters.hireDateRange,
        [type]: date || undefined,
      },
    });
  };

  const handleSalaryRangeChange = (_: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    onFiltersChange({
      ...filters,
      salaryRange: { min, max },
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.department.length > 0) count++;
    if (filters.position.length > 0) count++;
    if (filters.employmentType.length > 0) count++;
    if (filters.country.length > 0) count++;
    if (filters.city.length > 0) count++;
    if (filters.hireDateRange.start || filters.hireDateRange.end) count++;
    if (filters.salaryRange.min !== undefined || filters.salaryRange.max !== undefined) count++;
    if (filters.gender.length > 0) count++;
    if (filters.maritalStatus.length > 0) count++;
    if (filters.workLocation.length > 0) count++;
    return count;
  };

  const sortOptions = [
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'email', label: 'Email' },
    { value: 'hireDate', label: 'Hire Date' },
    { value: 'department', label: 'Department' },
    { value: 'position', label: 'Position' },
    { value: 'status', label: 'Status' },
    { value: 'createdAt', label: 'Created Date' },
  ];

  return (
    <Card
      sx={{
        mb: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Search and Basic Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search employees by name, email, position, or department..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
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

          <Badge badgeContent={getActiveFiltersCount()} color="primary">
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setExpanded(!expanded)}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                borderWidth: 2,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                }
              }}
            >
              Filters
            </Button>
          </Badge>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={`${sortConfig.field}-${sortConfig.direction}`}
              label="Sort By"
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [typeof sortConfig.field, typeof sortConfig.direction];
                onSortChange({ field, direction });
              }}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: 2
                }
              }}
            >
              {sortOptions.map((option) => (
                <MenuItem key={`${option.value}-asc`} value={`${option.value}-asc`}>
                  {option.label} ↑
                </MenuItem>
              ))}
              {sortOptions.map((option) => (
                <MenuItem key={`${option.value}-desc`} value={`${option.value}-desc`}>
                  {option.label} ↓
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton
            onClick={onReset}
            sx={{
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: alpha(theme.palette.grey[500], 0.1),
                transform: 'scale(1.05)'
              }
            }}
          >
            <Refresh />
          </IconButton>
        </Box>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filters.search && (
              <Chip
                label={`Search: "${filters.search}"`}
                onDelete={() => handleFilterChange('search', '')}
                size="small"
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.1)})`,
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              />
            )}
            {filters.status.map((status) => (
              <Chip
                key={status}
                label={`Status: ${status}`}
                onDelete={() => handleMultiSelectChange('status', filters.status.filter(s => s !== status))}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
            {filters.department.map((dept) => (
              <Chip
                key={dept}
                label={`Dept: ${dept}`}
                onDelete={() => handleMultiSelectChange('department', filters.department.filter(d => d !== dept))}
                size="small"
                color="secondary"
                variant="outlined"
              />
            ))}
          </Box>
        )}

        {/* Advanced Filters */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
              Advanced Filters
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
              {/* Status Filter */}
              <Autocomplete
                multiple
                options={['active', 'inactive', 'terminated', 'on-leave']}
                value={filters.status}
                onChange={(_, newValue) => handleMultiSelectChange('status', newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Employment Status" size="small" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))
                }
              />

              {/* Department Filter */}
              <Autocomplete
                multiple
                options={filterStats?.departments.map(d => d.value) || []}
                value={filters.department}
                onChange={(_, newValue) => handleMultiSelectChange('department', newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Department" size="small" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  ))
                }
              />

              {/* Position Filter */}
              <Autocomplete
                multiple
                options={filterStats?.positions.map(p => p.value) || []}
                value={filters.position}
                onChange={(_, newValue) => handleMultiSelectChange('position', newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Position" size="small" />
                )}
              />

              {/* Employment Type Filter */}
              <Autocomplete
                multiple
                options={['full-time', 'part-time', 'contract', 'intern']}
                value={filters.employmentType}
                onChange={(_, newValue) => handleMultiSelectChange('employmentType', newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Employment Type" size="small" />
                )}
              />

              {/* Country Filter */}
              <Autocomplete
                multiple
                options={filterStats?.countries.map(c => c.value) || []}
                value={filters.country}
                onChange={(_, newValue) => handleMultiSelectChange('country', newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Country" size="small" />
                )}
              />

              {/* Gender Filter */}
              <Autocomplete
                multiple
                options={['male', 'female', 'other']}
                value={filters.gender.filter(g => g !== undefined) as string[]}
                onChange={(_, newValue) => handleMultiSelectChange('gender', newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Gender" size="small" />
                )}
              />

              {/* Hire Date Range */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Hire Date From"
                  value={filters.hireDateRange.start || null}
                  onChange={(date) => handleDateRangeChange('start', date)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true
                    }
                  }}
                />
                <DatePicker
                  label="Hire Date To"
                  value={filters.hireDateRange.end || null}
                  onChange={(date) => handleDateRangeChange('end', date)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true
                    }
                  }}
                />
              </Box>

              {/* Salary Range */}
              {filterStats?.salaryRange && (
                <Box sx={{ px: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Salary Range: ${filters.salaryRange.min || filterStats.salaryRange.min} - ${filters.salaryRange.max || filterStats.salaryRange.max}
                  </Typography>
                  <Slider
                    value={[
                      filters.salaryRange.min || filterStats.salaryRange.min,
                      filters.salaryRange.max || filterStats.salaryRange.max
                    ]}
                    onChange={handleSalaryRangeChange}
                    valueLabelDisplay="auto"
                    min={filterStats.salaryRange.min}
                    max={filterStats.salaryRange.max}
                    sx={{
                      color: theme.palette.primary.main,
                      '& .MuiSlider-thumb': {
                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                      }
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Filter Stats */}
            {filterStats && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.info.main }}>
                  📊 Showing {filterStats.filteredEmployees} of {filterStats.totalEmployees} employees
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>
    </Card>
  );
};

export default EmployeeFilters;