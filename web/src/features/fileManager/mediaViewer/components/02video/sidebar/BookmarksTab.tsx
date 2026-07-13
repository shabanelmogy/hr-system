import React from 'react';
import { Box, TextField, Button, Chip, List, Accordion, AccordionSummary, AccordionDetails, Typography, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, PlayArrow as PlayIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { formatTime } from '../utils';
import { Bookmark, BookmarkNote } from './useVideoSidebar';

interface BookmarksTabProps {
  bookmarks: Bookmark[];
  newBookmarkTitle: string;
  setNewBookmarkTitle: (value: string) => void;
  newBookmarkNote: string;
  setNewBookmarkNote: (value: string) => void;
  currentTime: number;
  onAddBookmark: () => void;
  onAddBookmarkNote: (bookmarkId: string) => void;
  onDeleteBookmark: (id: string) => void;
  onDeleteBookmarkNote: (bookmarkId: string, noteId: string) => void;
  onSeek: (time: number) => void;
  editingNote: { bookmarkId: string; noteId: string } | null;
  editNoteContent: string;
  setEditNoteContent: (value: string) => void;
  onStartEditingNote: (bookmarkId: string, noteId: string, currentContent: string) => void;
  onEditBookmarkNote: (bookmarkId: string, noteId: string, content: string) => void;
  onCancelEditingNote: () => void;
}

export const BookmarksTab: React.FC<BookmarksTabProps> = ({
  bookmarks,
  newBookmarkTitle,
  setNewBookmarkTitle,
  newBookmarkNote,
  setNewBookmarkNote,
  currentTime,
  onAddBookmark,
  onAddBookmarkNote,
  onDeleteBookmark,
  onDeleteBookmarkNote,
  onSeek,
  editingNote,
  editNoteContent,
  setEditNoteContent,
  onStartEditingNote,
  onEditBookmarkNote,
  onCancelEditingNote,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ 
        p: 1.5, 
        mb: 1, 
        backgroundColor: '#fff3cd', 
        borderRadius: 1, 
        border: 2, 
        borderColor: '#ffc107',
        boxShadow: '0 2px 4px rgba(255, 193, 7, 0.2)'
      }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#856404' }}>
          ⚠️ Under Construction: Bookmarks are not saved to database yet
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          placeholder="Enter bookmark title..."
          value={newBookmarkTitle}
          onChange={(e) => setNewBookmarkTitle(e.target.value)}
          variant="outlined"
          size="small"
          label="Title"
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Chip label={`${formatTime(currentTime)}`} size="small" color="secondary" variant="outlined" />
          <Button
            onClick={onAddBookmark}
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            disabled={!newBookmarkTitle.trim()}
          >
            Add
          </Button>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ p: 0 }}>
          {bookmarks.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No bookmarks yet. Add your first bookmark!
            </Typography>
          ) : (
            bookmarks.map((bookmark) => (
              <Accordion key={bookmark.id} sx={{ mb: 1, '&:first-of-type': { mt: 0 } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Chip
                      label={formatTime(bookmark.time)}
                      size="small"
                      clickable
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek(bookmark.time);
                      }}
                      icon={<PlayIcon />}
                      color="secondary"
                    />
                    <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                      {bookmark.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBookmark(bookmark.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 2 }}>
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
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Add note to bookmark..."
                      value={newBookmarkNote}
                      onChange={(e) => setNewBookmarkNote(e.target.value)}
                      size="small"
                    />
                    <Button
                      onClick={() => onAddBookmarkNote(bookmark.id)}
                      startIcon={<AddIcon />}
                      size="small"
                      sx={{ mt: 1 }}
                      disabled={!newBookmarkNote.trim()}
                    >
                      Add Note
                    </Button>
                  </Box>
                  {bookmark.notes.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                      No notes added to this bookmark yet.
                    </Typography>
                  ) : (
                    bookmark.notes.map((note) => <BookmarkNoteItem key={note.id} note={note} bookmark={bookmark} editingNote={editingNote} editNoteContent={editNoteContent} setEditNoteContent={setEditNoteContent} onStartEditingNote={onStartEditingNote} onEditBookmarkNote={onEditBookmarkNote} onCancelEditingNote={onCancelEditingNote} onDeleteBookmarkNote={onDeleteBookmarkNote} />)
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </List>
      </Box>
    </Box>
  );
};

interface BookmarkNoteItemProps {
  note: BookmarkNote;
  bookmark: Bookmark;
  editingNote: { bookmarkId: string; noteId: string } | null;
  editNoteContent: string;
  setEditNoteContent: (value: string) => void;
  onStartEditingNote: (bookmarkId: string, noteId: string, currentContent: string) => void;
  onEditBookmarkNote: (bookmarkId: string, noteId: string, content: string) => void;
  onCancelEditingNote: () => void;
  onDeleteBookmarkNote: (bookmarkId: string, noteId: string) => void;
}

const BookmarkNoteItem: React.FC<BookmarkNoteItemProps> = ({
  note,
  bookmark,
  editingNote,
  editNoteContent,
  setEditNoteContent,
  onStartEditingNote,
  onEditBookmarkNote,
  onCancelEditingNote,
  onDeleteBookmarkNote,
}) => {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, mb: 1, backgroundColor: 'background.default' }}>
      {editingNote?.bookmarkId === bookmark.id && editingNote?.noteId === note.id ? (
        <Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={editNoteContent}
            onChange={(e) => setEditNoteContent(e.target.value)}
            size="small"
            placeholder="Edit note content..."
            autoFocus
          />
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={() => onEditBookmarkNote(bookmark.id, note.id, editNoteContent)}
              disabled={!editNoteContent.trim()}
            >
              Save
            </Button>
            <Button size="small" variant="outlined" onClick={onCancelEditingNote}>
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {note.timestamp.toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => onStartEditingNote(bookmark.id, note.id, note.content)}
                sx={{ color: 'primary.main' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDeleteBookmarkNote(bookmark.id, note.id)} sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
            {note.content}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
