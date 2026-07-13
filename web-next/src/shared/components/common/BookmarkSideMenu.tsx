import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Drawer,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  BookmarkBorder,
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
} from '@mui/icons-material';

interface Note {
  id: string;
  text: string;
  timestamp: string;
}

const BookmarkSideMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const toggleMenu = () => setOpen(!open);

  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        text: newNote.trim(),
        timestamp: new Date().toLocaleString(),
      };
      setNotes([...notes, note]);
      setNewNote('');
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const saveEdit = () => {
    setNotes(notes.map(note => 
      note.id === editingId ? { ...note, text: editText } : note
    ));
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <>
      <IconButton
        onClick={toggleMenu}
        sx={{
          position: 'fixed',
          top: 80,
          right: 16,
          zIndex: 1300,
          bgcolor: 'background.paper',
          boxShadow: 2,
        }}
      >
        <BookmarkBorder />
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={toggleMenu}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            p: 2,
            mt: 8,
          },
        }}
      >
        <Typography variant="h6" gutterBottom>
          Bookmarks
        </Typography>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Add new note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addNote()}
          />
          <Button
            fullWidth
            startIcon={<Add />}
            onClick={addNote}
            sx={{ mt: 1 }}
          >
            Add Note
          </Button>
        </Box>

        <List>
          {notes.map((note) => (
            <ListItem key={note.id} sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
              {editingId === note.id ? (
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    multiline
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    size="small"
                  />
                  <Box sx={{ mt: 1 }}>
                    <IconButton size="small" onClick={saveEdit}>
                      <Save />
                    </IconButton>
                    <IconButton size="small" onClick={cancelEdit}>
                      <Cancel />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <>
                  <ListItemText
                    primary={note.text}
                    secondary={note.timestamp}
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small" onClick={() => startEdit(note)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => deleteNote(note.id)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </>
              )}
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default BookmarkSideMenu;