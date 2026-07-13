import React from 'react';
import { Box, TextField, Button, Chip, Divider, List, ListItem, Typography, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
import { formatTime } from '../utils';
import { Note } from './useVideoSidebar';

interface NotesTabProps {
  notes: Note[];
  newNote: string;
  setNewNote: (value: string) => void;
  currentTime: number;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
  onSeek: (time: number) => void;
  editingGlobalNote: string | null;
  editGlobalNoteContent: string;
  setEditGlobalNoteContent: (value: string) => void;
  onStartEditingGlobalNote: (noteId: string, currentContent: string) => void;
  onEditGlobalNote: (noteId: string, content: string) => void;
  onCancelEditingGlobalNote: () => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  newNote,
  setNewNote,
  currentTime,
  onAddNote,
  onDeleteNote,
  onSeek,
  editingGlobalNote,
  editGlobalNoteContent,
  setEditGlobalNoteContent,
  onStartEditingGlobalNote,
  onEditGlobalNote,
  onCancelEditingGlobalNote,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ 
        p: 1.5, 
        mb: 2, 
        backgroundColor: '#fff3cd', 
        borderRadius: 1, 
        border: 2, 
        borderColor: '#ffc107',
        boxShadow: '0 2px 4px rgba(255, 193, 7, 0.2)'
      }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#856404' }}>
          ⚠️ Under Construction: Notes are not saved to database yet
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Add a note at current time..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Chip label={`Time: ${formatTime(currentTime)}`} size="small" color="primary" variant="outlined" />
          <Button onClick={onAddNote} startIcon={<AddIcon />} variant="contained" size="small" disabled={!newNote.trim()}>
            Add Note
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ maxHeight: '100%' }}>
          {notes.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No notes yet. Add your first note!
            </Typography>
          ) : (
            notes.map((note) => (
              <ListItem
                key={note.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  p: 1.5,
                  backgroundColor: 'background.default',
                }}
              >
                {editingGlobalNote === note.id ? (
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={editGlobalNoteContent}
                      onChange={(e) => setEditGlobalNoteContent(e.target.value)}
                      size="small"
                      placeholder="Edit note content..."
                      autoFocus
                    />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onEditGlobalNote(note.id, editGlobalNoteContent)}
                        disabled={!editGlobalNoteContent.trim()}
                      >
                        Save
                      </Button>
                      <Button size="small" variant="outlined" onClick={onCancelEditingGlobalNote}>
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                      <Chip
                        label={formatTime(note.time)}
                        size="small"
                        clickable
                        onClick={() => onSeek(note.time)}
                        icon={<PlayIcon />}
                        color="primary"
                      />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => onStartEditingGlobalNote(note.id, note.content)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => onDeleteNote(note.id)} sx={{ color: 'error.main' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                      {note.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {note.timestamp.toLocaleString()}
                    </Typography>
                  </>
                )}
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Box>
  );
};
