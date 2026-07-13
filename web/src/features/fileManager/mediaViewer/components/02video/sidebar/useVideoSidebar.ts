import { useState } from 'react';

export interface Note {
  id: string;
  time: number;
  content: string;
  timestamp: Date;
}

export interface BookmarkNote {
  id: string;
  content: string;
  timestamp: Date;
}

export interface Bookmark {
  id: string;
  time: number;
  title: string;
  timestamp: Date;
  notes: BookmarkNote[];
}

export const useVideoSidebar = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [newBookmarkNote, setNewBookmarkNote] = useState('');
  const [editingNote, setEditingNote] = useState<{ bookmarkId: string; noteId: string } | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const [editingGlobalNote, setEditingGlobalNote] = useState<string | null>(null);
  const [editGlobalNoteContent, setEditGlobalNoteContent] = useState('');

  const addNote = (currentTime: number) => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        time: currentTime,
        content: newNote.trim(),
        timestamp: new Date(),
      };
      setNotes([...notes, note]);
      setNewNote('');
    }
  };

  const addBookmark = (currentTime: number) => {
    if (newBookmarkTitle.trim()) {
      const bookmark: Bookmark = {
        id: Date.now().toString(),
        time: currentTime,
        title: newBookmarkTitle.trim(),
        timestamp: new Date(),
        notes: [],
      };
      setBookmarks([...bookmarks, bookmark]);
      setNewBookmarkTitle('');
    }
  };

  const addBookmarkNote = (bookmarkId: string) => {
    if (newBookmarkNote.trim()) {
      const note: BookmarkNote = {
        id: Date.now().toString(),
        content: newBookmarkNote.trim(),
        timestamp: new Date(),
      };
      setBookmarks(bookmarks.map((b) => (b.id === bookmarkId ? { ...b, notes: [...b.notes, note] } : b)));
      setNewBookmarkNote('');
    }
  };

  const deleteBookmarkNote = (bookmarkId: string, noteId: string) => {
    setBookmarks(bookmarks.map((b) => (b.id === bookmarkId ? { ...b, notes: b.notes.filter((n) => n.id !== noteId) } : b)));
  };

  const editBookmarkNote = (bookmarkId: string, noteId: string, content: string) => {
    if (content.trim()) {
      setBookmarks(
        bookmarks.map((b) =>
          b.id === bookmarkId
            ? {
                ...b,
                notes: b.notes.map((n) => (n.id === noteId ? { ...n, content: content.trim() } : n)),
              }
            : b
        )
      );
    }
    setEditingNote(null);
    setEditNoteContent('');
  };

  const startEditingNote = (bookmarkId: string, noteId: string, currentContent: string) => {
    setEditingNote({ bookmarkId, noteId });
    setEditNoteContent(currentContent);
  };

  const cancelEditingNote = () => {
    setEditingNote(null);
    setEditNoteContent('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const startEditingGlobalNote = (noteId: string, currentContent: string) => {
    setEditingGlobalNote(noteId);
    setEditGlobalNoteContent(currentContent);
  };

  const editGlobalNote = (noteId: string, content: string) => {
    if (content.trim()) {
      setNotes(notes.map((n) => (n.id === noteId ? { ...n, content: content.trim() } : n)));
    }
    setEditingGlobalNote(null);
    setEditGlobalNoteContent('');
  };

  const cancelEditingGlobalNote = () => {
    setEditingGlobalNote(null);
    setEditGlobalNoteContent('');
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
  };

  return {
    // state
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
    // handlers
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
  } as const;
};
