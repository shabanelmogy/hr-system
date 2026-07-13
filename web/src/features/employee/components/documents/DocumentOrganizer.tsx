import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import {
  Folder as FolderIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Share as ShareIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FolderShared as FolderSharedIcon,
} from '@mui/icons-material';
import { EmployeeDocument, DocumentPermission } from '../../types/Employee';

interface Folder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  permissions: DocumentPermission[];
  createdAt: string;
  createdBy: string;
}

interface DocumentOrganizerProps {
  employeeId: string;
  documents: EmployeeDocument[];
  onDocumentMove?: (documentId: string, folderId: string) => void;
  onFolderCreate?: (folder: Omit<Folder, 'id' | 'createdAt' | 'createdBy'>) => void;
  onFolderDelete?: (folderId: string) => void;
  onPermissionUpdate?: (folderId: string, permissions: DocumentPermission[]) => void;
}

const DocumentOrganizer: React.FC<DocumentOrganizerProps> = ({
  employeeId,
  documents,
  onDocumentMove,
  onFolderCreate,
  onFolderDelete,
  onPermissionUpdate,
}) => {
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: 'root',
      name: 'Root',
      description: 'Main document folder',
      permissions: [],
      createdAt: new Date().toISOString(),
      createdBy: 'system',
    },
  ]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [createFolderDialog, setCreateFolderDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    parentId: 'root',
  });
  const [shareSettings, setShareSettings] = useState({
    folderId: '',
    userId: '',
    permission: 'read' as const,
  });

  const handleCreateFolder = () => {
    const folder: Omit<Folder, 'id' | 'createdAt' | 'createdBy'> = {
      name: newFolder.name,
      description: newFolder.description,
      parentId: newFolder.parentId,
      permissions: [],
    };

    onFolderCreate?.(folder);

    // Add to local state for demo
    const newFolderObj: Folder = {
      ...folder,
      id: `folder-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user',
    };

    setFolders(prev => [...prev, newFolderObj]);
    setNewFolder({ name: '', description: '', parentId: 'root' });
    setCreateFolderDialog(false);
  };

  const handleShareFolder = () => {
    const permission: DocumentPermission = {
      id: `perm-${Date.now()}`,
      documentId: shareSettings.folderId,
      userId: shareSettings.userId,
      permission: shareSettings.permission,
      grantedBy: 'current-user',
      grantedAt: new Date().toISOString(),
    };

    onPermissionUpdate?.(shareSettings.folderId, [permission]);

    // Update local folder permissions
    setFolders(prev => prev.map(folder =>
      folder.id === shareSettings.folderId
        ? { ...folder, permissions: [...folder.permissions, permission] }
        : folder
    ));

    setShareSettings({ folderId: '', userId: '', permission: 'read' });
    setShareDialog(false);
  };

  const getFolderDocuments = (folderId: string) => {
    // In a real implementation, documents would have a folderId field
    return documents.filter(doc => doc.category === folderId || folderId === 'root');
  };

  const getChildFolders = (parentId: string) => {
    return folders.filter(folder => folder.parentId === parentId);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Document Organizer</Typography>
        <Button
          variant="contained"
          startIcon={<CreateNewFolderIcon />}
          onClick={() => setCreateFolderDialog(true)}
        >
          Create Folder
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Folder Tree */}
        <Card sx={{ flex: 1, maxWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Folders</Typography>
            <List>
              {folders.map((folder) => (
                <ListItem
                  key={folder.id}
                  button
                  selected={selectedFolder?.id === folder.id}
                  onClick={() => setSelectedFolder(folder)}
                >
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <ListItemText primary={folder.name} />
                  {folder.permissions.length > 0 && (
                    <FolderSharedIcon sx={{ ml: 1, color: 'primary.main' }} />
                  )}
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Folder Contents */}
        <Card sx={{ flex: 2 }}>
          <CardContent>
            {selectedFolder ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FolderIcon />
                    <Typography variant="h6">{selectedFolder.name}</Typography>
                    {selectedFolder.permissions.length > 0 && (
                      <Chip label={`${selectedFolder.permissions.length} shared`} size="small" />
                    )}
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => setShareDialog(true)}
                      title="Share Folder"
                    >
                      <ShareIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onFolderDelete?.(selectedFolder.id)}
                      title="Delete Folder"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {selectedFolder.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedFolder.description}
                  </Typography>
                )}

                <Divider sx={{ mb: 2 }} />

                {/* Subfolders */}
                {getChildFolders(selectedFolder.id).length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Subfolders</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {getChildFolders(selectedFolder.id).map((subfolder) => (
                        <Chip
                          key={subfolder.id}
                          icon={<FolderIcon />}
                          label={subfolder.name}
                          onClick={() => setSelectedFolder(subfolder)}
                          clickable
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Documents in folder */}
                <Typography variant="subtitle1" gutterBottom>
                  Documents ({getFolderDocuments(selectedFolder.id).length})
                </Typography>

                {getFolderDocuments(selectedFolder.id).length > 0 ? (
                  <List>
                    {getFolderDocuments(selectedFolder.id).map((doc) => (
                      <ListItem key={doc.id}>
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {doc.mimeType.includes('pdf') ? 'PDF' :
                             doc.mimeType.includes('image') ? 'IMG' : 'DOC'}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.name}
                          secondary={`${doc.type} • ${doc.fileSize} bytes`}
                        />
                        <Chip
                          label={doc.status}
                          size="small"
                          color={doc.status === 'active' ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No documents in this folder. Drag documents here or create subfolders.
                  </Alert>
                )}

                {/* Permissions */}
                {selectedFolder.permissions.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Shared With</Typography>
                    <List dense>
                      {selectedFolder.permissions.map((perm) => (
                        <ListItem key={perm.id}>
                          <ListItemIcon>
                            <PersonIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={perm.userId}
                            secondary={`Permission: ${perm.permission}`}
                          />
                          <Chip label={perm.permission} size="small" />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Select a folder to view contents
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderDialog} onClose={() => setCreateFolderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolder.name}
            onChange={(e) => setNewFolder(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            value={newFolder.description}
            onChange={(e) => setNewFolder(prev => ({ ...prev, description: e.target.value }))}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Parent Folder</InputLabel>
            <Select
              value={newFolder.parentId}
              onChange={(e) => setNewFolder(prev => ({ ...prev, parentId: e.target.value }))}
              label="Parent Folder"
            >
              {folders.map((folder) => (
                <MenuItem key={folder.id} value={folder.id}>
                  {folder.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFolderDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained" disabled={!newFolder.name.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Folder Dialog */}
      <Dialog open={shareDialog} onClose={() => setShareDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Folder</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Permission Level</InputLabel>
            <Select
              value={shareSettings.permission}
              onChange={(e) => setShareSettings(prev => ({ ...prev, permission: e.target.value as any }))}
              label="Permission Level"
            >
              <MenuItem value="read">Read Only</MenuItem>
              <MenuItem value="write">Read & Write</MenuItem>
              <MenuItem value="delete">Full Access</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="User ID or Email"
            fullWidth
            value={shareSettings.userId}
            onChange={(e) => setShareSettings(prev => ({ ...prev, userId: e.target.value }))}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog(false)}>Cancel</Button>
          <Button onClick={handleShareFolder} variant="contained" disabled={!shareSettings.userId.trim()}>
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentOrganizer;