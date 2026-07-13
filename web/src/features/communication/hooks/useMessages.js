import { useState, useEffect, useCallback } from 'react';
import { useApiHandler } from '../../../shared/hooks';
import { communicationService } from '../services';

export const useMessages = (userId, options = {}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleApiCall } = useApiHandler(options);

  const fetchMessages = useCallback(async (filters = {}) => {
    return handleApiCall(
      () => communicationService.getMessages(userId, filters),
      null,
      setError
    ).then(result => {
      if (result) {
        setMessages(result.data || []);
      }
      return result;
    });
  }, [userId, handleApiCall]);

  const sendMessage = useCallback(async (messageData) => {
    return handleApiCall(
      () => communicationService.sendMessage(messageData),
      'Message sent successfully'
    ).then(result => {
      if (result) {
        // Add the new message to the list
        setMessages(prev => [result.data, ...prev]);
      }
      return result;
    });
  }, [handleApiCall]);

  const markAsRead = useCallback(async (messageId) => {
    return handleApiCall(
      () => communicationService.markMessageAsRead(messageId, userId)
    ).then(result => {
      if (result) {
        // Update the message status in the list
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, status: 'read' } : msg
        ));
      }
      return result;
    });
  }, [userId, handleApiCall]);

  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    markAsRead,
    setMessages
  };
};

export const useMessageThreads = (userId, options = {}) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleApiCall } = useApiHandler(options);

  const fetchThreads = useCallback(async () => {
    return handleApiCall(
      () => communicationService.getMessageThreads(userId),
      null,
      setError
    ).then(result => {
      if (result) {
        setThreads(result.data || []);
      }
      return result;
    });
  }, [userId, handleApiCall]);

  const createThread = useCallback(async (threadData) => {
    return handleApiCall(
      () => communicationService.createMessageThread(threadData),
      'Thread created successfully'
    ).then(result => {
      if (result) {
        setThreads(prev => [result.data, ...prev]);
      }
      return result;
    });
  }, [handleApiCall]);

  useEffect(() => {
    if (userId) {
      fetchThreads();
    }
  }, [userId, fetchThreads]);

  return {
    threads,
    loading,
    error,
    fetchThreads,
    createThread,
    setThreads
  };
};

export const useGroupChats = (userId, options = {}) => {
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleApiCall } = useApiHandler(options);

  const fetchGroupChats = useCallback(async () => {
    return handleApiCall(
      () => communicationService.getGroupChats(userId),
      null,
      setError
    ).then(result => {
      if (result) {
        setGroupChats(result.data || []);
      }
      return result;
    });
  }, [userId, handleApiCall]);

  const createGroupChat = useCallback(async (chatData) => {
    return handleApiCall(
      () => communicationService.createGroupChat(chatData),
      'Group chat created successfully'
    ).then(result => {
      if (result) {
        setGroupChats(prev => [result.data, ...prev]);
      }
      return result;
    });
  }, [handleApiCall]);

  const addParticipant = useCallback(async (chatId, participantId) => {
    return handleApiCall(
      () => communicationService.addParticipantToGroup(chatId, participantId),
      'Participant added successfully'
    );
  }, [handleApiCall]);

  useEffect(() => {
    if (userId) {
      fetchGroupChats();
    }
  }, [userId, fetchGroupChats]);

  return {
    groupChats,
    loading,
    error,
    fetchGroupChats,
    createGroupChat,
    addParticipant,
    setGroupChats
  };
};