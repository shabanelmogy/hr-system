// Re-export communication types from Employee types
import type { Message, Announcement, Feedback } from '../../employee/types/Employee';

export type { Message, Announcement, Feedback };

// Additional communication types
export interface MessageThread {
  id: string;
  subject: string;
  participants: string[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
}

export interface GroupChat {
  id: string;
  name: string;
  description?: string;
  participants: string[];
  admins: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  messageNotifications: boolean;
  announcementNotifications: boolean;
  feedbackNotifications: boolean;
  urgentOnly: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
  };
}

export interface CommunicationStats {
  totalMessages: number;
  unreadMessages: number;
  totalAnnouncements: number;
  unreadAnnouncements: number;
  totalFeedback: number;
  pendingFeedback: number;
  activeThreads: number;
  groupChats: number;
}

export interface CommunicationActivity {
  id: string;
  type: 'message' | 'announcement' | 'feedback' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  isRead: boolean;
}