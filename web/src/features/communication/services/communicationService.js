import apiService from '../../../shared/services/apiService';

class CommunicationService {
  // Messages
  async getMessages(userId, filters = {}) {
    const params = new URLSearchParams({
      userId,
      ...filters
    });
    return apiService.get(`/v1/api/communication/messages?${params}`);
  }

  async sendMessage(messageData) {
    return apiService.post('/v1/api/communication/messages', messageData);
  }

  async markMessageAsRead(messageId, userId) {
    return apiService.put(`/v1/api/communication/messages/${messageId}/read`, { userId });
  }

  async getMessageThreads(userId) {
    return apiService.get(`/v1/api/communication/threads?userId=${userId}`);
  }

  async createMessageThread(threadData) {
    return apiService.post('/v1/api/communication/threads', threadData);
  }

  // Group Chats
  async getGroupChats(userId) {
    return apiService.get(`/v1/api/communication/group-chats?userId=${userId}`);
  }

  async createGroupChat(chatData) {
    return apiService.post('/v1/api/communication/group-chats', chatData);
  }

  async addParticipantToGroup(chatId, userId) {
    return apiService.post(`/v1/api/communication/group-chats/${chatId}/participants`, { userId });
  }

  // Announcements
  async getAnnouncements(filters = {}) {
    const params = new URLSearchParams(filters);
    return apiService.get(`/v1/api/communication/announcements?${params}`);
  }

  async createAnnouncement(announcementData) {
    return apiService.post('/v1/api/communication/announcements', announcementData);
  }

  async updateAnnouncement(id, announcementData) {
    return apiService.put(`/v1/api/communication/announcements/${id}`, announcementData);
  }

  async deleteAnnouncement(id) {
    return apiService.delete(`/v1/api/communication/announcements/${id}`);
  }

  async acknowledgeAnnouncement(announcementId, userId) {
    return apiService.post(`/v1/api/communication/announcements/${announcementId}/acknowledge`, { userId });
  }

  async getAnnouncementCategories() {
    return apiService.get('/v1/api/communication/announcements/categories');
  }

  // Feedback
  async getFeedback(filters = {}) {
    const params = new URLSearchParams(filters);
    return apiService.get(`/v1/api/communication/feedback?${params}`);
  }

  async submitFeedback(feedbackData) {
    return apiService.post('/v1/api/communication/feedback', feedbackData);
  }

  async updateFeedbackStatus(id, status, resolution = null) {
    return apiService.put(`/v1/api/communication/feedback/${id}/status`, { status, resolution });
  }

  async assignFeedback(id, assignedTo) {
    return apiService.put(`/v1/api/communication/feedback/${id}/assign`, { assignedTo });
  }

  async getFeedbackCategories() {
    return apiService.get('/v1/api/communication/feedback/categories');
  }

  // Notifications
  async getNotifications(userId, filters = {}) {
    const params = new URLSearchParams({
      userId,
      ...filters
    });
    return apiService.get(`/v1/api/communication/notifications?${params}`);
  }

  async markNotificationAsRead(notificationId) {
    return apiService.put(`/v1/api/communication/notifications/${notificationId}/read`);
  }

  async updateNotificationSettings(userId, settings) {
    return apiService.put(`/v1/api/communication/notifications/settings/${userId}`, settings);
  }

  async getNotificationSettings(userId) {
    return apiService.get(`/v1/api/communication/notifications/settings/${userId}`);
  }

  // Communication Stats and Analytics
  async getCommunicationStats(userId, dateRange = {}) {
    const params = new URLSearchParams({
      userId,
      ...dateRange
    });
    return apiService.get(`/v1/api/communication/stats?${params}`);
  }

  async getMessageAnalytics(filters = {}) {
    const params = new URLSearchParams(filters);
    return apiService.get(`/v1/api/communication/analytics/messages?${params}`);
  }

  async getAnnouncementAnalytics(filters = {}) {
    const params = new URLSearchParams(filters);
    return apiService.get(`/v1/api/communication/analytics/announcements?${params}`);
  }

  async getFeedbackAnalytics(filters = {}) {
    const params = new URLSearchParams(filters);
    return apiService.get(`/v1/api/communication/analytics/feedback?${params}`);
  }

  // File Attachments
  async uploadAttachment(file, messageId = null) {
    const formData = new FormData();
    formData.append('file', file);
    if (messageId) {
      formData.append('messageId', messageId);
    }

    return apiService.post('/v1/api/communication/attachments', formData, {
      'Content-Type': 'multipart/form-data'
    });
  }

  async downloadAttachment(attachmentId) {
    return apiService.get(`/v1/api/communication/attachments/${attachmentId}`, {
      responseType: 'blob'
    });
  }

  // Real-time connection (WebSocket ready)
  async connectToRealTime(userId) {
    // This would integrate with SignalR service
    return apiService.get(`/v1/api/communication/realtime/connect?userId=${userId}`);
  }

  async disconnectFromRealTime(userId) {
    return apiService.post('/v1/api/communication/realtime/disconnect', { userId });
  }
}

const communicationService = new CommunicationService();
export default communicationService;