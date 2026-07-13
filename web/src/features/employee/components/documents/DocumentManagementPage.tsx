import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import { DocumentUpload, DocumentList, DocumentViewer, DocumentOrganizer } from './index';
import { EmployeeDocument } from '../../types/Employee';

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

const DocumentManagementPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId?: string }>();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<EmployeeDocument | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUploadComplete = (newDocuments: EmployeeDocument[]) => {
    setDocuments(prev => [...prev, ...newDocuments]);
  };

  const handleDocumentClick = (document: EmployeeDocument) => {
    setSelectedDocument(document);
    setViewerOpen(true);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Document Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {employeeId
            ? `Manage documents for Employee ID: ${employeeId}`
            : 'Manage company documents and templates'
          }
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ pb: 0 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Upload Documents" />
            <Tab label="Document List" />
            <Tab label="Organize Documents" />
          </Tabs>
        </CardContent>

        <TabPanel value={tabValue} index={0}>
          <DocumentUpload
            employeeId={employeeId}
            onUploadComplete={handleUploadComplete}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DocumentList
            documents={documents}
            onDocumentClick={handleDocumentClick}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <DocumentOrganizer
            employeeId={employeeId}
            documents={documents}
          />
        </TabPanel>
      </Card>

      <DocumentViewer
        document={selectedDocument}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </Box>
  );
};

export default DocumentManagementPage;