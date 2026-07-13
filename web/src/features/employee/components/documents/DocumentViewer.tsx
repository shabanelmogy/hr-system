import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Grid,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Description as DescriptionIcon,
  PictureAsPdf,
  Image,
  Article,
  History as HistoryIcon,
  Info as InfoIcon,
  Share as ShareIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { EmployeeDocument, DocumentVersion } from '../../types/Employee';
import { formatFileSize } from '../../../../shared/utils/formatFileSize';
import { getTimeAgo } from '../../../../shared/utils/dateUtils';

interface DocumentViewerProps {
  document: EmployeeDocument | null;
  open: boolean;
  onClose: () => void;
  onDownload?: (document: EmployeeDocument) => void;
  onEdit?: (document: EmployeeDocument) => void;
  onShare?: (document: EmployeeDocument) => void;
  onVersionRollback?: (document: EmployeeDocument, version: DocumentVersion) => void;
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

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  open,
  onClose,
  onDownload,
  onEdit,
  onShare,
  onVersionRollback,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerContent, setViewerContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (document) {
      renderDocumentContent();
    }
  }, [document]);

  const renderDocumentContent = () => {
    if (!document) return;

    const mimeType = document.mimeType;
    const fileUrl = document.fileUrl;

    if (mimeType.includes('pdf')) {
      // PDF Viewer
      setViewerContent(
        <Box sx={{ height: '100%', minHeight: 600 }}>
          <iframe
            src={fileUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={document.name}
          />
        </Box>
      );
    } else if (mimeType.includes('image')) {
      // Image Viewer
      setViewerContent(
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <img
            src={fileUrl}
            alt={document.name}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </Box>
      );
    } else if (mimeType.includes('text')) {
      // Text Viewer (would need to fetch content)
      setViewerContent(
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, minHeight: 400 }}>
          <Typography variant="body2" color="text.secondary">
            Text content would be displayed here. In a real implementation, you would fetch and display the text content.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {`This is a placeholder for the text content of "${document.name}".\n\nThe actual content would be loaded from the server and displayed here.`}
          </Typography>
        </Box>
      );
    } else {
      // Generic file viewer
      setViewerContent(
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, p: 4 }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <DescriptionIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          </Avatar>
          <Typography variant="h6" gutterBottom>
            {document.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {mimeType} • {formatFileSize(document.fileSize)}
          </Typography>
          <Alert severity="info" sx={{ maxWidth: 400 }}>
            This file type cannot be previewed directly. Please download the file to view its contents.
          </Alert>
        </Box>
      );
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <PictureAsPdf />;
    if (mimeType.includes('image')) return <Image />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <Article />;
    return <DescriptionIcon />;
  };

  if (!document) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isFullscreen}
      PaperProps={{
        sx: {
          height: isFullscreen ? '100vh' : '80vh',
          maxHeight: isFullscreen ? '100vh' : '80vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              {getDocumentIcon(document.mimeType)}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {document.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatFileSize(document.fileSize)} • Uploaded {getTimeAgo(document.uploadedAt)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {onDownload && (
              <IconButton onClick={() => onDownload(document)} size="small">
                <DownloadIcon />
              </IconButton>
            )}
            {onEdit && (
              <IconButton onClick={() => onEdit(document)} size="small">
                <EditIcon />
              </IconButton>
            )}
            {onShare && (
              <IconButton onClick={() => onShare(document)} size="small">
                <ShareIcon />
              </IconButton>
            )}
            <IconButton onClick={handleFullscreenToggle} size="small">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Preview" />
            <Tab label="Details" />
            <Tab label="Version History" />
          </Tabs>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <TabPanel value={tabValue} index={0}>
            {/* Document Preview */}
            <Box sx={{ height: '100%', minHeight: 500 }}>
              {viewerContent}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Document Details */}
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InfoIcon />
                      Document Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Name</Typography>
                        <Typography variant="body1">{document.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Category</Typography>
                        <Chip label={document.category} size="small" />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Type</Typography>
                        <Typography variant="body1">{document.type}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Size</Typography>
                        <Typography variant="body1">{formatFileSize(document.fileSize)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">MIME Type</Typography>
                        <Typography variant="body1">{document.mimeType}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Version</Typography>
                        <Typography variant="body1">{document.version}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip
                          label={document.status}
                          size="small"
                          color={document.status === 'active' ? 'success' : document.status === 'expired' ? 'error' : 'warning'}
                          variant="outlined"
                        />
                      </Box>
                      {document.expiryDate && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">Expiry Date</Typography>
                          <Typography variant="body1">{new Date(document.expiryDate).toLocaleDateString()}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Additional Details</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Uploaded By</Typography>
                        <Typography variant="body1">{document.uploadedBy}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Uploaded At</Typography>
                        <Typography variant="body1">{new Date(document.uploadedAt).toLocaleString()}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Last Accessed</Typography>
                        <Typography variant="body1">
                          {document.lastAccessed ? new Date(document.lastAccessed).toLocaleString() : 'Never'}
                        </Typography>
                      </Box>
                      {document.description && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">Description</Typography>
                          <Typography variant="body1">{document.description}</Typography>
                        </Box>
                      )}
                      {document.tags.length > 0 && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Tags</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {document.tags.map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Version History */}
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon />
                Version History
              </Typography>

              {document.versions && document.versions.length > 0 ? (
                <List>
                  {document.versions.map((version, index) => (
                    <React.Fragment key={version.id}>
                      <ListItem
                        sx={{
                          bgcolor: index === 0 ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: index === 0 ? theme.palette.primary.main : theme.palette.grey[500] }}>
                            {index === 0 ? 'C' : version.version}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                Version {version.version}
                                {index === 0 && (
                                  <Chip label="Current" size="small" color="primary" sx={{ ml: 1 }} />
                                )}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Uploaded by {version.uploadedBy} on {new Date(version.uploadedAt).toLocaleString()}
                              </Typography>
                              {version.changes && (
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {version.changes}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(version.size)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onDownload && onDownload({ ...document, fileUrl: version.fileUrl })}
                          >
                            Download
                          </Button>
                          {index !== 0 && onVersionRollback && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => onVersionRollback(document, version)}
                            >
                              Rollback
                            </Button>
                          )}
                        </Box>
                      </ListItem>
                      {index < document.versions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  No version history available for this document.
                </Alert>
              )}
            </Box>
          </TabPanel>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'space-between' }}>
          <Box>
            {onDownload && (
              <Button startIcon={<DownloadIcon />} onClick={() => onDownload(document)}>
                Download
              </Button>
            )}
            {onEdit && (
              <Button startIcon={<EditIcon />} onClick={() => onEdit(document)} sx={{ ml: 1 }}>
                Edit
              </Button>
            )}
          </Box>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentViewer;