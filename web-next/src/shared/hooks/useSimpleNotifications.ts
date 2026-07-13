/**
 * 🪝 Simple Notifications Hook
 * Single hook to prevent duplicate notifications
 */

import { useState, useEffect, useCallback } from 'react';
import simpleNotificationSystem from '../services/notifications/SimpleNotificationSystem';

export const useSimpleNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Update state when notifications change
  const updateState = useCallback((newNotifications: any[], newUnreadCount: number) => {
    setNotifications(newNotifications);
    setUnreadCount(newUnreadCount);
  }, []);

  // Initialize system and subscribe to changes
  useEffect(() => {
    // Initialize the system (only once due to singleton)
    simpleNotificationSystem.initialize();
    
    // Get initial state
    const initialNotifications = simpleNotificationSystem.getAll();
    const initialUnreadCount = simpleNotificationSystem.getUnreadCount();
    setNotifications(initialNotifications);
    setUnreadCount(initialUnreadCount);

    // Subscribe to changes
    const unsubscribe = simpleNotificationSystem.subscribe(updateState);

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [updateState]);

  // Actions
  const addNotification = useCallback((message: string, type = 'info', options: any = {}) => {
    return simpleNotificationSystem.addNotification(message, type, options);
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    return simpleNotificationSystem.markAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(() => {
    return simpleNotificationSystem.markAllAsRead();
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    return simpleNotificationSystem.removeNotification(notificationId);
  }, []);

  const clearAll = useCallback(() => {
    return simpleNotificationSystem.clearAll();
  }, []);

  const toggleReadStatus = useCallback((notificationId: string) => {
    return simpleNotificationSystem.toggleReadStatus(notificationId);
  }, []);

  const test = useCallback((action: string, name: string) => {
    return simpleNotificationSystem.test(action, name);
  }, []);

  const getStats = useCallback(() => {
    return simpleNotificationSystem.getStats();
  }, []);

  return {
    // State
    notifications,
    unreadCount,
    
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    toggleReadStatus,
    test,
    getStats,
    
    // System reference
    system: simpleNotificationSystem
  };
};

export default useSimpleNotifications;