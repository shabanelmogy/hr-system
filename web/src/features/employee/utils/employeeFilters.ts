import { Employee, AdvancedEmployeeFilters, SearchResult, SortConfig, FilterStats } from '../types/Employee';

export const filterEmployees = (
  employees: Employee[],
  filters: AdvancedEmployeeFilters,
  sortConfig: SortConfig
): SearchResult => {
  const startTime = Date.now();

  let filteredEmployees = [...employees];

  // Text search
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase().trim();
    filteredEmployees = filteredEmployees.filter(employee =>
      employee.firstName.toLowerCase().includes(searchTerm) ||
      employee.lastName.toLowerCase().includes(searchTerm) ||
      employee.email.toLowerCase().includes(searchTerm) ||
      employee.position.toLowerCase().includes(searchTerm) ||
      employee.department.toLowerCase().includes(searchTerm) ||
      employee.employeeId.toLowerCase().includes(searchTerm) ||
      employee.phone.includes(searchTerm) ||
      employee.address.city.toLowerCase().includes(searchTerm) ||
      employee.address.country.toLowerCase().includes(searchTerm)
    );
  }

  // Status filter
  if (filters.status.length > 0) {
    filteredEmployees = filteredEmployees.filter(employee =>
      filters.status.includes(employee.status)
    );
  }

  // Department filter
  if (filters.department.length > 0) {
    filteredEmployees = filteredEmployees.filter(employee =>
      filters.department.includes(employee.department)
    );
  }

  // Position filter
  if (filters.position.length > 0) {
    filteredEmployees = filteredEmployees.filter(employee =>
      filters.position.includes(employee.position)
    );
  }

  // Employment type filter
  if (filters.employmentType.length > 0) {
    filteredEmployees = filteredEmployees.filter(employee =>
      filters.employmentType.includes(employee.employmentDetails.employmentType)
    );
  }

  // Country filter
  if (filters.country.length > 0) {
    filteredEmployees = filteredEmployees.filter(employee =>
      filters.country.includes(employee.address.country)
    );
  }

  // City filter
  if (filters.city.length > 0) {
    filteredEmployees = filteredEmployees.filter(employee =>
      filters.city.includes(employee.address.city)
    );
  }

  // Work location filter
  if (filters.workLocation.length > 0) {
    filteredEmployees = filteredEmployees.filter(employee =>
      filters.workLocation.includes(employee.employmentDetails.workLocation)
    );
  }

  // Gender filter
  if (filters.gender.length > 0) {
    filteredEmployees = filteredEmployees.filter(employee =>
      employee.gender && filters.gender.includes(employee.gender)
    );
  }

  // Marital status filter
  if (filters.maritalStatus.length > 0) {
    filteredEmployees = filteredEmployees.filter(employee =>
      employee.maritalStatus && filters.maritalStatus.includes(employee.maritalStatus)
    );
  }

  // Hire date range filter
  if (filters.hireDateRange.start || filters.hireDateRange.end) {
    filteredEmployees = filteredEmployees.filter(employee => {
      const hireDate = new Date(employee.hireDate);
      const startDate = filters.hireDateRange.start;
      const endDate = filters.hireDateRange.end;

      if (startDate && hireDate < startDate) return false;
      if (endDate && hireDate > endDate) return false;
      return true;
    });
  }

  // Salary range filter
  if (filters.salaryRange.min !== undefined || filters.salaryRange.max !== undefined) {
    filteredEmployees = filteredEmployees.filter(employee => {
      const salary = employee.salaryInfo.baseSalary;
      const minSalary = filters.salaryRange.min;
      const maxSalary = filters.salaryRange.max;

      if (minSalary !== undefined && salary < minSalary) return false;
      if (maxSalary !== undefined && salary > maxSalary) return false;
      return true;
    });
  }

  // Manager filter
  if (filters.managerId) {
    filteredEmployees = filteredEmployees.filter(employee =>
      employee.managerId === filters.managerId
    );
  }

  // Sorting
  filteredEmployees.sort((a, b) => {
    let aValue: any = a[sortConfig.field as keyof Employee];
    let bValue: any = b[sortConfig.field as keyof Employee];

    // Handle nested properties
    if (sortConfig.field === 'hireDate' || sortConfig.field === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const searchTime = Date.now() - startTime;

  return {
    employees: filteredEmployees,
    totalCount: employees.length,
    filteredCount: filteredEmployees.length,
    searchTime
  };
};

export const generateFilterStats = (employees: Employee[]): FilterStats => {
  const departments = new Map<string, number>();
  const positions = new Map<string, number>();
  const countries = new Map<string, number>();
  const statuses = new Map<Employee['status'], number>();
  const employmentTypes = new Map<Employee['employmentDetails']['employmentType'], number>();

  let minSalary = Infinity;
  let maxSalary = -Infinity;
  let totalSalary = 0;

  employees.forEach(employee => {
    // Departments
    departments.set(employee.department, (departments.get(employee.department) || 0) + 1);

    // Positions
    positions.set(employee.position, (positions.get(employee.position) || 0) + 1);

    // Countries
    countries.set(employee.address.country, (countries.get(employee.address.country) || 0) + 1);

    // Statuses
    statuses.set(employee.status, (statuses.get(employee.status) || 0) + 1);

    // Employment Types
    employmentTypes.set(employee.employmentDetails.employmentType, (employmentTypes.get(employee.employmentDetails.employmentType) || 0) + 1);

    // Salary stats
    const salary = employee.salaryInfo.baseSalary;
    minSalary = Math.min(minSalary, salary);
    maxSalary = Math.max(maxSalary, salary);
    totalSalary += salary;
  });

  const avgSalary = totalSalary / employees.length;

  return {
    totalEmployees: employees.length,
    filteredEmployees: employees.length,
    departments: Array.from(departments.entries()).map(([value, count]) => ({ value, label: value, count })),
    positions: Array.from(positions.entries()).map(([value, count]) => ({ value, label: value, count })),
    countries: Array.from(countries.entries()).map(([value, count]) => ({ value, label: value, count })),
    statuses: Array.from(statuses.entries()).map(([value, count]) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' '), count })),
    employmentTypes: Array.from(employmentTypes.entries()).map(([value, count]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' '),
      count
    })),
    salaryRange: {
      min: minSalary === Infinity ? 0 : minSalary,
      max: maxSalary === -Infinity ? 100000 : maxSalary,
      avg: avgSalary || 0
    }
  };
};

export const createDefaultFilters = (): AdvancedEmployeeFilters => ({
  search: '',
  status: [],
  department: [],
  position: [],
  employmentType: [],
  country: [],
  city: [],
  hireDateRange: {},
  salaryRange: {},
  gender: [],
  maritalStatus: [],
  workLocation: []
});

export const createDefaultSort = (): SortConfig => ({
  field: 'firstName',
  direction: 'asc'
});

export const exportFilteredEmployees = (employees: Employee[], filename: string = 'employees') => {
  const csvContent = [
    // Header
    [
      'Employee ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Department',
      'Position',
      'Status',
      'Hire Date',
      'Country',
      'City',
      'Employment Type',
      'Base Salary',
      'Currency'
    ].join(','),

    // Data rows
    ...employees.map(employee => [
      employee.employeeId,
      `"${employee.firstName}"`,
      `"${employee.lastName}"`,
      employee.email,
      employee.phone,
      `"${employee.department}"`,
      `"${employee.position}"`,
      employee.status,
      employee.hireDate,
      `"${employee.address.country}"`,
      `"${employee.address.city}"`,
      employee.employmentDetails.employmentType,
      employee.salaryInfo.baseSalary,
      employee.salaryInfo.currency
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};