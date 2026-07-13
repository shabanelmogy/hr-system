import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  FormHelperText,
  Grid
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { EmployeeDocument, DocumentCategory } from '../../types/Employee';
import { formatFileSize } from '../../../../shared/utils/formatFileSize';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const StyledDropZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: theme.transitions.create(['border-color', 'background-color'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
  '&.dragover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.selected,
  },
}));

interface FileWithMetadata extends File {
  id: string;
  preview?: string;
  progress: number;
  error?: string;
  metadata: {
    category: string;
    description?: string;
    tags: string[];
    expiryDate?: string;
    permissions: string[];
  };
}

interface DocumentUploadProps {
  employeeId?: string;
  onUploadComplete?: (documents: EmployeeDocument[]) => void;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  categories?: DocumentCategory[];
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  employeeId,
  onUploadComplete,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
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
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [metadataDialog, setMetadataDialog] = useState<{ open: boolean; fileIndex?: number }>({ open: false });
  const [currentMetadata, setCurrentMetadata] = useState<{
    category: string;
    description: string;
    tags: string[];
    expiryDate: string;
    permissions: string[];
  }>({
    category: '',
    description: '',
    tags: [],
    expiryDate: '',
    permissions: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)}`;
    }
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }
    return null;
  }, [maxFileSize, allowedTypes]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFiles(droppedFiles);
    }
  }, []);

  const handleFiles = useCallback((selectedFiles: File[]) => {
    const newFiles: FileWithMetadata[] = selectedFiles.map(file => ({
      ...file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      metadata: {
        category: '',
        description: '',
        tags: [],
        expiryDate: '',
        permissions: ['read'], // default permission
      },
    }));

    // Validate files
    const validatedFiles = newFiles.map(file => ({
      ...file,
      error: validateFile(file),
    }));

    setFiles(prev => [...prev, ...validatedFiles]);
  }, [validateFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const openMetadataDialog = useCallback((fileIndex: number) => {
    const file = files[fileIndex];
    setCurrentMetadata(file.metadata);
    setMetadataDialog({ open: true, fileIndex });
  }, [files]);

  const saveMetadata = useCallback(() => {
    if (metadataDialog.fileIndex !== undefined) {
      setFiles(prev => prev.map((file, index) =>
        index === metadataDialog.fileIndex
          ? { ...file, metadata: currentMetadata }
          : file
      ));
    }
    setMetadataDialog({ open: false });
  }, [metadataDialog.fileIndex, currentMetadata]);

  const handleUpload = useCallback(async () => {
    const validFiles = files.filter(file => !file.error && file.metadata.category);
    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Simulate upload process
      for (let i = 0; i < validFiles.length; i++) {
        const fileIndex = files.findIndex(f => f.id === validFiles[i].id);

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFiles(prev => prev.map((file, index) =>
            index === fileIndex ? { ...file, progress } : file
          ));
        }

        // Create document object
        const document: EmployeeDocument = {
          id: validFiles[i].id,
          employeeId: employeeId || 'company', // Use 'company' for general documents
          type: validFiles[i].metadata.category as any,
          category: validFiles[i].metadata.category,
          name: validFiles[i].name,
          description: validFiles[i].metadata.description,
          fileUrl: `https://example.com/files/${validFiles[i].id}`, // Placeholder
          fileSize: validFiles[i].size,
          mimeType: validFiles[i].type,
          version: 1,
          versions: [{
            id: `${validFiles[i].id}-v1`,
            documentId: validFiles[i].id,
            version: 1,
            fileUrl: `https://example.com/files/${validFiles[i].id}`,
            uploadedBy: 'current-user', // Should come from auth context
            uploadedAt: new Date().toISOString(),
            changes: 'Initial upload',
            size: validFiles[i].size,
          }],
          uploadedBy: 'current-user',
          uploadedAt: new Date().toISOString(),
          expiryDate: validFiles[i].metadata.expiryDate || undefined,
          tags: validFiles[i].metadata.tags,
          permissions: validFiles[i].metadata.permissions.map(perm => ({
            id: `${validFiles[i].id}-${perm}`,
            documentId: validFiles[i].id,
            userId: 'current-user',
            permission: perm as any,
            grantedBy: 'current-user',
            grantedAt: new Date().toISOString(),
          })),
          status: 'active',
        };

        // Here you would make API call to upload file and save document
        console.log('Uploading document:', document);
      }

      // Clear files after successful upload
      setFiles([]);
      onUploadComplete?.(validFiles.map(file => ({
        id: file.id,
        employeeId: employeeId || 'company',
        type: file.metadata.category as any,
        category: file.metadata.category,
        name: file.name,
        description: file.metadata.description || undefined,
        fileUrl: `https://example.com/files/${file.id}`,
        fileSize: file.size,
        mimeType: file.type,
        version: 1,
        versions: [{
          id: `${file.id}-v1`,
          documentId: file.id,
          version: 1,
          fileUrl: `https://example.com/files/${file.id}`,
          uploadedBy: 'current-user',
          uploadedAt: new Date().toISOString(),
          changes: 'Initial upload',
          size: file.size,
        }],
        uploadedBy: 'current-user',
        uploadedAt: new Date().toISOString(),
        expiryDate: file.metadata.expiryDate || undefined,
        tags: file.metadata.tags,
        permissions: file.metadata.permissions.map(perm => ({
          id: `${file.id}-${perm}`,
          documentId: file.id,
          userId: 'current-user',
          permission: perm as any,
          grantedBy: 'current-user',
          grantedAt: new Date().toISOString(),
        })),
        status: 'active' as const,
      })));

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [files, employeeId, onUploadComplete]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upload Documents
        </Typography>

        <StyledDropZone
          className={dragActive ? 'dragover' : ''}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Drag and Drop Files Here
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            or click to select files
          </Typography>
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            disabled={isUploading}
          >
            Select Files
            <VisuallyHiddenInput
              ref={fileInputRef}
              type="file"
              onChange={handleFileInput}
              multiple
              disabled={isUploading}
              accept={allowedTypes.join(',')}
            />
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Max file size: {formatFileSize(maxFileSize)} | Allowed types: {allowedTypes.join(', ')}
          </Typography>
        </StyledDropZone>

        {files.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Files ({files.length})
            </Typography>
            {files.map((file, index) => (
              <Box key={file.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DescriptionIcon sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    {file.error ? (
                      <Alert severity="error" variant="outlined" sx={{ py: 0 }}>
                        {file.error}
                      </Alert>
                    ) : (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Category: {file.metadata.category || 'Not set'}
                        </Typography>
                        {file.progress > 0 && (
                          <LinearProgress variant="determinate" value={file.progress} sx={{ mt: 1 }} />
                        )}
                      </Box>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openMetadataDialog(index)}
                        disabled={isUploading}
                      >
                        Metadata
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                        color="error"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading || files.some(f => f.error || !f.metadata.category)}
              >
                {isUploading ? 'Uploading...' : `Upload ${files.filter(f => !f.error).length} Files`}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setFiles([])}
                disabled={isUploading}
              >
                Clear All
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>

      {/* Metadata Dialog */}
      <Dialog open={metadataDialog.open} onClose={() => setMetadataDialog({ open: false })} maxWidth="md" fullWidth>
        <DialogTitle>Document Metadata</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={currentMetadata.category}
                  onChange={(e) => setCurrentMetadata(prev => ({ ...prev, category: e.target.value }))}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {categories.find(c => c.id === currentMetadata.category)?.description}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={currentMetadata.expiryDate}
                onChange={(e) => setCurrentMetadata(prev => ({ ...prev, expiryDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={currentMetadata.description}
                onChange={(e) => setCurrentMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description of the document"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                options={[]} // You can provide predefined tags
                value={currentMetadata.tags}
                onChange={(_, newValue) => setCurrentMetadata(prev => ({ ...prev, tags: newValue }))}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags (press Enter)"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Permissions</InputLabel>
                <Select
                  multiple
                  value={currentMetadata.permissions}
                  onChange={(e) => setCurrentMetadata(prev => ({ ...prev, permissions: e.target.value as string[] }))}
                  label="Permissions"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="read">Read</MenuItem>
                  <MenuItem value="write">Write</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                  <MenuItem value="share">Share</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMetadataDialog({ open: false })}>Cancel</Button>
          <Button onClick={saveMetadata} variant="contained">
            Save Metadata
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default DocumentUpload;