import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Typography,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Note as NoteIcon
} from '@mui/icons-material';

interface TimeMark {
  id: string;
  time: number;
  label: string;
  note?: string;
}

interface TimeMarksProps {
  currentTime: number;
  onSeek: (time: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const TimeMarks: React.FC<TimeMarksProps> = ({ currentTime, onSeek, isOpen, onClose }) => {
  const [marks, setMarks] = useState<TimeMark[]>([]);
  const [newMarkLabel, setNewMarkLabel] = useState('');
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; markId: string; note: string }>({ open: false, markId: '', note: '' });

  const addMark = () => {
    const newMark: TimeMark = {
      id: Date.now().toString(),
      time: currentTime,
      label: newMarkLabel || `Mark at ${formatTime(currentTime)}`,
      note: '',
    };
    setMarks([...marks, newMark].sort((a, b) => a.time - b.time));
    setNewMarkLabel('');
  };

  const deleteMark = (id: string) => {
    setMarks(marks.filter(mark => mark.id !== id));
  };

  const openNoteDialog = (markId: string, currentNote: string = '') => {
    setNoteDialog({ open: true, markId, note: currentNote });
  };

  const saveNote = () => {
    setMarks(marks.map(mark => 
      mark.id === noteDialog.markId 
        ? { ...mark, note: noteDialog.note }
        : mark
    ));
    setNoteDialog({ open: false, markId: '', note: '' });
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box sx={{ width: 300, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Time Marks</Typography>
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Mark label"
            value={newMarkLabel}
            onChange={(e) => setNewMarkLabel(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button
            fullWidth
            variant="contained"
            startIcon={<BookmarkIcon />}
            onClick={addMark}
          >
            Add Mark at {formatTime(currentTime)}
          </Button>
        </Box>

        <List>
          {marks.map((mark) => (
            <ListItem key={mark.id} sx={{ flexDirection: 'column', alignItems: 'stretch', py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <IconButton onClick={() => onSeek(mark.time)} sx={{ mr: 1 }}>
                  <PlayIcon />
                </IconButton>
                <ListItemText
                  primary={mark.label}
                  secondary={formatTime(mark.time)}
                  sx={{ flex: 1 }}
                />
                <IconButton 
                  onClick={() => openNoteDialog(mark.id, mark.note)}
                  color={mark.note ? 'primary' : 'default'}
                  size="small"
                >
                  <NoteIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => deleteMark(mark.id)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              {mark.note && (
                <Box sx={{ mt: 1, pl: 5 }}>
                  <Chip 
                    label={mark.note.length > 30 ? `${mark.note.substring(0, 30)}...` : mark.note}
                    size="small"
                    variant="outlined"
                    icon={<NoteIcon />}
                    onClick={() => openNoteDialog(mark.id, mark.note)}
                    sx={{ cursor: 'pointer' }}
                  />
                </Box>
              )}
            </ListItem>
          ))}
        </List>

        <Dialog open={noteDialog.open} onClose={() => setNoteDialog({ open: false, markId: '', note: '' })} maxWidth="sm" fullWidth>
          <DialogTitle>Add Note to Bookmark</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Add your note here..."
              value={noteDialog.note}
              onChange={(e) => setNoteDialog({ ...noteDialog, note: e.target.value })}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteDialog({ open: false, markId: '', note: '' })}>Cancel</Button>
            <Button onClick={saveNote} variant="contained">Save Note</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Drawer>
  );
};

export default TimeMarks;