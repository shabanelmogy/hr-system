import React from 'react';
import { Box, IconButton, Tab, Tabs, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useVideoSidebar } from '../02video/sidebar/useVideoSidebar';
import { SidebarDrawer } from '../02video/sidebar/styles';
import { NotesTab } from '../02video/sidebar/NotesTab';
import { BookmarksTab } from '../02video/sidebar/BookmarksTab';

interface VideoSidebarProps {
  open: boolean;
  onClose: () => void;
  currentTime: number;
  onSeek: (time: number) => void;
}

const TabPanel = ({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) => (
  <Box sx={{ flex: 1, overflow: 'hidden', display: value === index ? 'flex' : 'none', flexDirection: 'column' }}>
    {value === index && <Box sx={{ p: 2, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{children}</Box>}
  </Box>
);

const VideoSidebar: React.FC<VideoSidebarProps> = ({ open, onClose, currentTime, onSeek }) => {
  const {
    tabValue,
    setTabValue,
    notes,
    bookmarks,
    newNote,
    setNewNote,
    newBookmarkTitle,
    setNewBookmarkTitle,
    newBookmarkNote,
    setNewBookmarkNote,
    editingNote,
    editNoteContent,
    setEditNoteContent,
    editingGlobalNote,
    editGlobalNoteContent,
    setEditGlobalNoteContent,
    addNote,
    addBookmark,
    addBookmarkNote,
    deleteBookmarkNote,
    editBookmarkNote,
    startEditingNote,
    cancelEditingNote,
    deleteNote,
    startEditingGlobalNote,
    editGlobalNote,
    cancelEditingGlobalNote,
    deleteBookmark,
  } = useVideoSidebar();

  return (
    <SidebarDrawer anchor="right" open={open} onClose={onClose} variant="persistent">
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Video Tools
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Notes" />
        <Tab label="Bookmarks" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <NotesTab
          notes={notes}
          newNote={newNote}
          setNewNote={setNewNote}
          currentTime={currentTime}
          onAddNote={() => addNote(currentTime)}
          onDeleteNote={deleteNote}
          onSeek={onSeek}
          editingGlobalNote={editingGlobalNote}
          editGlobalNoteContent={editGlobalNoteContent}
          setEditGlobalNoteContent={setEditGlobalNoteContent}
          onStartEditingGlobalNote={startEditingGlobalNote}
          onEditGlobalNote={editGlobalNote}
          onCancelEditingGlobalNote={cancelEditingGlobalNote}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <BookmarksTab
          bookmarks={bookmarks}
          newBookmarkTitle={newBookmarkTitle}
          setNewBookmarkTitle={setNewBookmarkTitle}
          newBookmarkNote={newBookmarkNote}
          setNewBookmarkNote={setNewBookmarkNote}
          currentTime={currentTime}
          onAddBookmark={() => addBookmark(currentTime)}
          onAddBookmarkNote={addBookmarkNote}
          onDeleteBookmark={deleteBookmark}
          onDeleteBookmarkNote={deleteBookmarkNote}
          onSeek={onSeek}
          editingNote={editingNote}
          editNoteContent={editNoteContent}
          setEditNoteContent={setEditNoteContent}
          onStartEditingNote={startEditingNote}
          onEditBookmarkNote={editBookmarkNote}
          onCancelEditingNote={cancelEditingNote}
        />
      </TabPanel>
    </SidebarDrawer>
  );
};

export default VideoSidebar;
