import signalRService from "../signalRService";
import countryHandler from "../../../features/basicData/countries/utils/countryHandler";

class SimpleNotificationSystem {
  constructor() {
    this.notifications = [];
    this.listeners = new Set();
    this.handlers = new Map();
    this.isInitialized = false;
    this.config = {
      storageKey: "app_notifications",
      maxNotifications: 100,
    };
  }

  /**
   * Initialize the system
   */
  initialize() {
    if (this.isInitialized) {
      return this;
    }

    this.loadFromStorage();
    this.setupStorageListener();
    this.registerDefaultHandlers();
    this.startSignalR();
    this.isInitialized = true;

    return this;
  }

  /**
   * Register default handlers
   */
  registerDefaultHandlers() {
    this.registerHandler("country", countryHandler);
  }

  /**
   * Register an entity handler
   */
  registerHandler(entityType, handler) {
    this.handlers.set(entityType, handler);
    handler.initialize(this);
    return this;
  }

  /**
   * Start SignalR connection
   */
  startSignalR() {
    signalRService.start().catch((err) => {
      console.error("Failed to start SignalR:", err);
    });
  }

  /**
   * Add notification (called by handlers)
   */
  addNotification(message, type = "info", options = {}) {
    const notification = {
      id: this.generateId(),
      message,
      type,
      timestamp: new Date(),
      isRead: false,
      category: options.category || "general",
      entityType: options.entityType || "general",
      ...options,
      data: options.data || {},
    };

    this.notifications.unshift(notification);

    if (this.notifications.length > this.config.maxNotifications) {
      this.notifications = this.notifications.slice(
        0,
        this.config.maxNotifications
      );
    }

    this.saveToStorage();
    this.notifyListeners();

    console.log(`📢 [${notification.entityType}] ${message}`);
    return notification;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all notifications
   */
  getAll() {
    return [...this.notifications];
  }

  /**
   * Get notifications by entity type
   */
  getByEntityType(entityType) {
    return this.notifications.filter((n) => n.entityType === entityType);
  }

  /**
   * Get notifications by category
   */
  getByCategory(category) {
    return this.notifications.filter((n) => n.category === category);
  }

  /**
   * Get unread notifications
   */
  getUnread() {
    return this.notifications.filter((n) => !n.isRead);
  }

  /**
   * Get unread count
   */
  getUnreadCount() {
    return this.getUnread().length;
  }

  /**
   * Mark as read
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );

    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.saveToStorage();
      this.notifyListeners();
    }

    return notification;
  }

  /**
   * Mark all as read
   */
  markAllAsRead(entityType = null) {
    let hasChanges = false;

    this.notifications.forEach((n) => {
      if (!n.isRead && (!entityType || n.entityType === entityType)) {
        n.isRead = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Remove notification
   */
  removeNotification(notificationId) {
    const index = this.notifications.findIndex((n) => n.id === notificationId);

    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.saveToStorage();
      this.notifyListeners();
      return true;
    }

    return false;
  }

  /**
   * Clear all notifications
   */
  clearAll(entityType = null) {
    if (entityType) {
      const originalLength = this.notifications.length;
      this.notifications = this.notifications.filter(
        (n) => n.entityType !== entityType
      );

      if (this.notifications.length !== originalLength) {
        this.saveToStorage();
        this.notifyListeners();
      }
    } else if (this.notifications.length > 0) {
      this.notifications = [];
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Toggle read status
   */
  toggleReadStatus(notificationId) {
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );

    if (notification) {
      notification.isRead = !notification.isRead;
      this.saveToStorage();
      this.notifyListeners();
      return notification;
    }

    return null;
  }

  /**
   * Subscribe to changes
   */
  subscribe(callback, entityType = null) {
    const wrappedCallback = entityType
      ? (notifications, unreadCount) => {
          const filtered = notifications.filter(
            (n) => n.entityType === entityType
          );
          const filteredUnread = filtered.filter((n) => !n.isRead).length;
          callback(filtered, filteredUnread);
        }
      : callback;

    this.listeners.add(wrappedCallback);

    return () => {
      this.listeners.delete(wrappedCallback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    const notifications = this.getAll();
    const unreadCount = this.getUnreadCount();

    this.listeners.forEach((callback) => {
      try {
        callback(notifications, unreadCount);
      } catch (error) {
        console.error("Error in notification listener:", error);
      }
    });
  }

  /**
   * Save to localStorage
   */
  saveToStorage() {
    try {
      const data = JSON.stringify(this.notifications);
      localStorage.setItem(this.config.storageKey, data);
    } catch (error) {
      console.error("Failed to save notifications:", error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        this.notifications = JSON.parse(stored).map((n) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      this.notifications = [];
    }
  }

  /**
   * Setup storage listener for cross-tab sync
   */
  setupStorageListener() {
    this.handleStorageChange = (event) => {
      if (event.key === this.config.storageKey) {
        this.loadFromStorage();
        this.notifyListeners();
      }
    };

    window.addEventListener("storage", this.handleStorageChange);
  }

  /**
   * Filter notifications
   */
  filter(predicate) {
    return this.notifications.filter(predicate);
  }

  /**
   * Get statistics
   */
  getStats(entityType = null) {
    const filtered = entityType
      ? this.notifications.filter((n) => n.entityType === entityType)
      : this.notifications;

    const categories = new Set();
    const types = new Set();
    const entities = new Set();

    filtered.forEach((n) => {
      categories.add(n.category);
      types.add(n.type);
      entities.add(n.entityType);
    });

    return {
      total: filtered.length,
      unread: filtered.filter((n) => !n.isRead).length,
      read: filtered.filter((n) => n.isRead).length,
      categories: Array.from(categories),
      types: Array.from(types),
      entities: Array.from(entities),
      oldest: filtered[filtered.length - 1]?.timestamp,
      newest: filtered[0]?.timestamp,
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    // Destroy all handlers
    this.handlers.forEach((handler) => {
      if (handler.destroy) {
        handler.destroy();
      }
    });

    this.handlers.clear();

    if (this.handleStorageChange) {
      window.removeEventListener("storage", this.handleStorageChange);
    }

    this.listeners.clear();
    this.notifications = [];
    this.isInitialized = false;

    console.log("🧹 Simple Notification System destroyed");
  }
}

// Create singleton instance
const simpleNotificationSystem = new SimpleNotificationSystem();

export default simpleNotificationSystem;
