import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Skeleton,
  useTheme,
  alpha,
  Tooltip,
  Checkbox,
  Button,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Search,
  FilterList,
  Description,
  PictureAsPdf,
  Image,
  Article,
  Edit,
  Delete,
  Visibility,
  Download,
  MoreVert,
  FileDownload,
  Clear,
  ViewList,
  ViewModule,
  Folder,
  Archive,
  Warning,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { EmployeeDocument, DocumentCategory } from '../../types/Employee';
import { formatFileSize } from '../../../../shared/utils/formatFileSize';
import { getTimeAgo } from '../../../../shared/utils/dateUtils';

interface DocumentFilters {
  search: string;
  category: string[];
  type: string[];
  status: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  tags: string[];
}

interface SortConfig {
  field: 'name' | 'uploadedAt' | 'fileSize' | 'category' | 'status';
  direction: 'asc' | 'desc';
}

interface DocumentListProps {
  documents: EmployeeDocument[];
  loading?: boolean;
  onDocumentClick?: (document: EmployeeDocument) => void;
  onEditDocument?: (document: EmployeeDocument) => void;
  onDeleteDocument?: (document: EmployeeDocument) => void;
  onDownloadDocument?: (document: EmployeeDocument) => void;
  onBulkDelete?: (documents: EmployeeDocument[]) => void;
  onBulkDownload?: (documents: EmployeeDocument[]) => void;
  onBulkArchive?: (documents: EmployeeDocument[]) => void;
  filters?: DocumentFilters;
  onFiltersChange?: (filters: DocumentFilters) => void;
  sortConfig?: SortConfig;
  onSortChange?: (sort: SortConfig) => void;
  categories?: DocumentCategory[];
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading = false,
  onDocumentClick,
  onEditDocument,
  onDeleteDocument,
  onDownloadDocument,
  onBulkDelete,
  onBulkDownload,
  onBulkArchive,
  filters = {
    search: '',
    category: [],
    type: [],
    status: [],
    dateRange: {},
    tags: [],
  },
  onFiltersChange,
  sortConfig = { field: 'uploadedAt', direction: 'desc' },
  onSortChange,
  categories = [
    { id: 'contract', name: 'Contract', description: 'Employment contracts and agreements' },
    { id: 'id', name: 'ID Document', description: 'Identification documents' },
    { id: 'certificate', name: 'Certificate', description: 'Certificates and qualifications' },
    { id: 'resume', name: 'Resume', description: 'CV and resume documents' },
    { id: 'policy', name: 'Policy', description: 'Company policies and procedures' },
    { id: 'training', name: 'Training', description: 'Training materials and records' },
    { id: 'performance', name: 'Performance', description: 'Performance reviews and evaluations' },
    { id: 'other', name: 'Other', description: 'Miscellaneous documents' },
  ],
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [selectedDocuments, setSelectedDocuments] = useState<EmployeeDocument[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const itemsPerPage = 12;

  // Apply filtering and sorting
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!doc.name.toLowerCase().includes(searchLower) &&
            !doc.description?.toLowerCase().includes(searchLower) &&
            !doc.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(doc.category)) {
        return false;
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(doc.type)) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(doc.status)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const docDate = new Date(doc.uploadedAt);
        if (filters.dateRange.start && docDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && docDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => doc.tags.includes(tag))) {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortConfig.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'uploadedAt':
          aValue = new Date(a.uploadedAt);
          bValue = new Date(b.uploadedAt);
          break;
        case 'fileSize':
          aValue = a.fileSize;
          bValue = b.fileSize;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [documents, filters, sortConfig]);

  // Paginate documents
  const paginatedDocuments = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDocuments, page]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

  const handleFiltersChange = (newFilters: DocumentFilters) => {
    onFiltersChange?.(newFilters);
    setPage(1);
  };

  const handleSortChange = (newSort: SortConfig) => {
    onSortChange?.(newSort);
  };

  const handleSelectDocument = (document: EmployeeDocument, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, document]);
    } else {
      setSelectedDocuments(prev => prev.filter(doc => doc.id !== document.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(paginatedDocuments);
      setSelectAll(true);
    } else {
      setSelectedDocuments([]);
      setSelectAll(false);
    }
  };

  const handleBulkDelete = () => {
    onBulkDelete?.(selectedDocuments);
  };

  const handleBulkDownload = () => {
    onBulkDownload?.(selectedDocuments);
  };

  const handleBulkArchive = () => {
    onBulkArchive?.(selectedDocuments);
  };

  const clearSelection = () => {
    setSelectedDocuments([]);
    setSelectAll(false);
  };

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <PictureAsPdf />;
    if (mimeType.includes('image')) return <Image />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <Article />;
    return <Description />;
  };

  const getStatusColor = (status: EmployeeDocument['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'archived': return 'warning';
      case 'expired': return 'error';
      default: return 'primary';
    }
  };

  const getStatusLabel = (status: EmployeeDocument['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'archived': return 'Archived';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  // Table columns definition
  const tableColumns: GridColDef<EmployeeDocument>[] = [
    {
      field: 'select',
      headerName: '',
      width: 50,
      renderHeader: () => (
        <Checkbox
          checked={selectAll}
          indeterminate={selectedDocuments.length > 0 && selectedDocuments.length < paginatedDocuments.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
          size="small"
        />
      ),
      renderCell: (params) => (
        <Checkbox
          checked={selectedDocuments.some(doc => doc.id === params.row.id)}
          onChange={(e) => handleSelectDocument(params.row, e.target.checked)}
          size="small"
        />
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getDocumentIcon(params.row.mimeType)}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(params.row.fileSize)}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.category}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={getStatusLabel(params.row.status)}
            size="small"
            color={getStatusColor(params.row.status)}
            variant="outlined"
          />
          {isExpiringSoon(params.row.expiryDate) && (
            <Warning sx={{ color: 'warning.main', fontSize: 16 }} />
          )}
        </Box>
      ),
    },
    {
      field: 'uploadedAt',
      headerName: 'Uploaded',
      width: 120,
      valueGetter: (params) => getTimeAgo(params),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {onDocumentClick && (
            <Tooltip title="View Document">
              <IconButton
                size="small"
                onClick={() => onDocumentClick(params.row)}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDownloadDocument && (
            <Tooltip title="Download">
              <IconButton
                size="small"
                onClick={() => onDownloadDocument(params.row)}
              >
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onEditDocument && (
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => onEditDocument(params.row)}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDeleteDocument && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDeleteDocument(params.row)}
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Box key={index} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)', lg: 'calc(25% - 18px)' } }}>
            <Card sx={{ height: 200 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Box>
                </Box>
                <Skeleton variant="text" width="100%" height={16} />
                <Skeleton variant="text" width="100%" height={16} />
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search documents..."
          value={filters.search}
          onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            multiple
            value={filters.category}
            onChange={(e) => handleFiltersChange({ ...filters, category: e.target.value as string[] })}
            label="Category"
            renderValue={(selected) => `${selected.length} selected`}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            multiple
            value={filters.status}
            onChange={(e) => handleFiltersChange({ ...filters, status: e.target.value as string[] })}
            label="Status"
            renderValue={(selected) => `${selected.length} selected`}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={`${sortConfig.field}-${sortConfig.direction}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-') as [SortConfig['field'], SortConfig['direction']];
              handleSortChange({ field, direction });
            }}
            label="Sort By"
          >
            <MenuItem value="name-asc">Name (A-Z)</MenuItem>
            <MenuItem value="name-desc">Name (Z-A)</MenuItem>
            <MenuItem value="uploadedAt-desc">Newest First</MenuItem>
            <MenuItem value="uploadedAt-asc">Oldest First</MenuItem>
            <MenuItem value="fileSize-desc">Largest First</MenuItem>
            <MenuItem value="fileSize-asc">Smallest First</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* View Toggle */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', borderRadius: 1, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
          <IconButton
            onClick={() => setViewMode('cards')}
            size="small"
            sx={{
              borderRadius: 0,
              backgroundColor: viewMode === 'cards' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              color: viewMode === 'cards' ? theme.palette.primary.main : 'inherit',
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
            }}
          >
            <ViewList fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Bulk Actions Toolbar */}
      {selectedDocuments.length > 0 && (
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
              {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected
            </Typography>
            <Button size="small" onClick={clearSelection} startIcon={<Clear />}>
              Clear Selection
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {onBulkDownload && (
              <Button size="small" variant="outlined" onClick={handleBulkDownload} startIcon={<FileDownload />}>
                Download
              </Button>
            )}
            {onBulkArchive && (
              <Button size="small" variant="outlined" onClick={handleBulkArchive} startIcon={<Archive />}>
                Archive
              </Button>
            )}
            {onBulkDelete && (
              <Button size="small" variant="outlined" color="error" onClick={handleBulkDelete} startIcon={<Delete />}>
                Delete
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* Results count and Select All */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedDocuments.length} of {filteredDocuments.length} documents
          </Typography>
          {paginatedDocuments.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                checked={selectAll}
                indeterminate={selectedDocuments.length > 0 && selectedDocuments.length < paginatedDocuments.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                size="small"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Select All ({paginatedDocuments.length})
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Document View - Cards or Table */}
      {viewMode === 'cards' ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {paginatedDocuments.map((document) => (
            <Box key={document.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)', lg: 'calc(25% - 18px)' }, minWidth: 280 }}>
              <Card
                sx={{
                  height: '100%',
                  cursor: onDocumentClick ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: onDocumentClick ? 'translateY(-4px)' : 'none',
                    boxShadow: theme.shadows[8],
                  },
                }}
                onClick={() => onDocumentClick?.(document)}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Selection Checkbox */}
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Checkbox
                      checked={selectedDocuments.some(doc => doc.id === document.id)}
                      onChange={(e) => handleSelectDocument(document, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      size="small"
                    />
                  </Box>

                  {/* Document header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        isExpiringSoon(document.expiryDate) ? (
                          <Warning sx={{ fontSize: 14, color: 'warning.main' }} />
                        ) : null
                      }
                    >
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), mr: 2 }}>
                        {getDocumentIcon(document.mimeType)}
                      </Avatar>
                    </Badge>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" noWrap sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {document.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {formatFileSize(document.fileSize)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Document details */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Folder sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" noWrap>
                        {document.category}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Uploaded {getTimeAgo(document.uploadedAt)}
                    </Typography>

                    {document.description && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {document.description.length > 100
                          ? `${document.description.substring(0, 100)}...`
                          : document.description}
                      </Typography>
                    )}

                    {document.tags.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        {document.tags.slice(0, 3).map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                        {document.tags.length > 3 && (
                          <Chip label={`+${document.tags.length - 3}`} size="small" variant="outlined" />
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* Status and actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={getStatusLabel(document.status)}
                      size="small"
                      color={getStatusColor(document.status)}
                      variant="outlined"
                    />

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {onDownloadDocument && (
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownloadDocument(document);
                            }}
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {onEditDocument && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditDocument(document);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {onDeleteDocument && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDocument(document);
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
            </Box>
          ))}
        </Box>
      ) : (
        /* Table View */
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={paginatedDocuments}
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
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
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
      {filteredDocuments.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No documents found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Object.values(filters).some(value => {
              if (Array.isArray(value)) return value.length > 0;
              if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v => v !== undefined && v !== null && v !== '');
              }
              return value !== undefined && value !== null && value !== '';
            })
              ? 'Try adjusting your search or filters'
              : 'No documents have been uploaded yet'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DocumentList;