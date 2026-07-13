import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  useTheme,
  alpha,
  Divider,
  Alert
} from '@mui/material';
import {
  Send,
  AttachFile,
  Close,
  Person,
  Group,
  Message as MessageIcon,
  PriorityHigh,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useMessages } from '../hooks';
import { Message } from '../types';

interface MessageComposeProps {
  userId: string;
  replyTo?: Message;
  onClose?: () => void;
  onSent?: () => void;
}

const MessageCompose: React.FC<MessageComposeProps> = ({
  userId,
  replyTo,
  onClose,
  onSent
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage } = useMessages(userId);

  const [formData, setFormData] = useState({
    subject: replyTo ? `Re: ${replyTo.subject}` : '',
    content: replyTo ? `\n\n--- Original Message ---\nFrom: ${replyTo.senderName}\nSubject: ${replyTo.subject}\n\n${replyTo.content}` : '',
    recipients: replyTo ? [replyTo.senderId] : [],
    type: 'direct' as Message['type'],
    priority: 'normal' as Message['priority']
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock employee data - in real app this would come from API
  const employees = [
    { id: '1', name: 'John Doe', email: 'john@example.com', department: 'Engineering' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', department: 'HR' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!formData.subject.trim() || !formData.content.trim() || formData.recipients.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const messageData = {
        senderId: userId,
        recipientIds: formData.recipients,
        subject: formData.subject,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
        attachments: attachments.map(file => file.name), // In real app, upload files first
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readBy: [],
        threadId: replyTo?.threadId
      };

      await sendMessage(messageData);
      onSent?.();
      onClose?.();
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: Message['priority']) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card sx={{
      maxWidth: 800,
      mx: 'auto',
      borderRadius: 3,
      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`
    }}>
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ p: 3, pb: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {replyTo ? 'Reply to Message' : 'Compose Message'}
            </Typography>
            {onClose && (
              <IconButton onClick={onClose} size="small">
                <Close />
              </IconButton>
            )}
          </Box>

          {/* Message Type and Priority */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                label="Type"
              >
                <MenuItem value="direct">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ fontSize: 18 }} />
                    Direct
                  </Box>
                </MenuItem>
                <MenuItem value="group">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Group sx={{ fontSize: 18 }} />
                    Group
                  </Box>
                </MenuItem>
                <MenuItem value="broadcast">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MessageIcon sx={{ fontSize: 18 }} />
                    Broadcast
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PriorityHigh sx={{ fontSize: 16, color: theme.palette.error.main }} />
                    Urgent
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Form */}
        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Recipients */}
          <Autocomplete
            multiple
            options={employees}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            value={employees.filter(emp => formData.recipients.includes(emp.id))}
            onChange={(_, newValue) => {
              handleInputChange('recipients', newValue.map(emp => emp.id));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Recipients *"
                placeholder="Select recipients..."
                required
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={option.name}
                  size="small"
                />
              ))
            }
            sx={{ mb: 3 }}
          />

          {/* Subject */}
          <TextField
            fullWidth
            label="Subject *"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          {/* Content */}
          <TextField
            fullWidth
            label="Message *"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            multiline
            rows={8}
            required
            placeholder="Type your message here..."
            sx={{ mb: 3 }}
          />

          {/* Attachments */}
          {attachments.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Attachments ({attachments.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {attachments.map((file, index) => (
                  <Chip
                    key={index}
                    label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                    onDelete={() => handleRemoveAttachment(index)}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <Button
                variant="outlined"
                startIcon={<AttachFile />}
                onClick={() => fileInputRef.current?.click()}
                size="small"
              >
                Attach Files
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {onClose && (
                <Button
                  variant="outlined"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={handleSend}
                disabled={loading || !formData.subject.trim() || !formData.content.trim() || formData.recipients.length === 0}
                sx={{
                  bgcolor: theme.palette.success.main,
                  '&:hover': {
                    bgcolor: theme.palette.success.dark,
                  }
                }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MessageCompose;