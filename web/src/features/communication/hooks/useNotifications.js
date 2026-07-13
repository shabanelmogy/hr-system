import { useState, useEffect, useCallback } from 'react';
import { useApiHandler } from '../../../shared/hooks';
import { communicationService } from '../services';

export const useNotifications = (userId, options = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleApiCall } = useApiHandler(options);

  const fetchNotifications = useCallback(async (filters = {}) => {
    return handleApiCall(
      () => communicationService.getNotifications(userId, filters),
      null,
      setError
    ).then(result => {
      if (result) {
        const notifs = result.data || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.isRead).length);
      }
      return result;
    });
  }, [userId, handleApiCall]);

  const markAsRead = useCallback(async (notificationId) => {
    return handleApiCall(
      () => communicationService.markNotificationAsRead(notificationId)
    ).then(result => {
      if (result) {
        setNotifications(prev => prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return result;
    });
  }, [handleApiCall]);

  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) return;

    // Mark all unread notifications as read
    const promises = unreadNotifications.map(notif =>
      communicationService.markNotificationAsRead(notif.id)
    );

    return handleApiCall(
      () => Promise.all(promises)
    ).then(() => {
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    });
  }, [notifications, handleApiCall]);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    setNotifications
  };
};

export const useNotificationSettings = (userId, options = {}) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleApiCall } = useApiHandler(options);

  const fetchSettings = useCallback(async () => {
    return handleApiCall(
      () => communicationService.getNotificationSettings(userId),
      null,
      setError
    ).then(result => {
      if (result) {
        setSettings(result.data);
      }
      return result;
    });
  }, [userId, handleApiCall]);

  const updateSettings = useCallback(async (newSettings) => {
    return handleApiCall(
      () => communicationService.updateNotificationSettings(userId, newSettings),
      'Notification settings updated successfully'
    ).then(result => {
      if (result) {
        setSettings(result.data);
      }
      return result;
    });
  }, [userId, handleApiCall]);

  useEffect(() => {
    if (userId) {
      fetchSettings();
    }
  }, [userId, fetchSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    setSettings
  };
};