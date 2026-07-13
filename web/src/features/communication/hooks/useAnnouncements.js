import { useState, useEffect, useCallback } from 'react';
import { useApiHandler } from '../../../shared/hooks';
import { communicationService } from '../services';

export const useAnnouncements = (options = {}) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleApiCall } = useApiHandler(options);

  const fetchAnnouncements = useCallback(async (filters = {}) => {
    return handleApiCall(
      () => communicationService.getAnnouncements(filters),
      null,
      setError
    ).then(result => {
      if (result) {
        setAnnouncements(result.data || []);
      }
      return result;
    });
  }, [handleApiCall]);

  const createAnnouncement = useCallback(async (announcementData) => {
    return handleApiCall(
      () => communicationService.createAnnouncement(announcementData),
      'Announcement created successfully'
    ).then(result => {
      if (result) {
        setAnnouncements(prev => [result.data, ...prev]);
      }
      return result;
    });
  }, [handleApiCall]);

  const updateAnnouncement = useCallback(async (id, announcementData) => {
    return handleApiCall(
      () => communicationService.updateAnnouncement(id, announcementData),
      'Announcement updated successfully'
    ).then(result => {
      if (result) {
        setAnnouncements(prev => prev.map(ann =>
          ann.id === id ? result.data : ann
        ));
      }
      return result;
    });
  }, [handleApiCall]);

  const deleteAnnouncement = useCallback(async (id) => {
    return handleApiCall(
      () => communicationService.deleteAnnouncement(id),
      'Announcement deleted successfully'
    ).then(result => {
      if (result) {
        setAnnouncements(prev => prev.filter(ann => ann.id !== id));
      }
      return result;
    });
  }, [handleApiCall]);

  const acknowledgeAnnouncement = useCallback(async (announcementId, userId) => {
    return handleApiCall(
      () => communicationService.acknowledgeAnnouncement(announcementId, userId)
    ).then(result => {
      if (result) {
        setAnnouncements(prev => prev.map(ann =>
          ann.id === announcementId
            ? { ...ann, acknowledgedBy: [...(ann.acknowledgedBy || []), userId] }
            : ann
        ));
      }
      return result;
    });
  }, [handleApiCall]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return {
    announcements,
    loading,
    error,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    acknowledgeAnnouncement,
    setAnnouncements
  };
};

export const useAnnouncementCategories = (options = {}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleApiCall } = useApiHandler(options);

  const fetchCategories = useCallback(async () => {
    return handleApiCall(
      () => communicationService.getAnnouncementCategories(),
      null,
      setError
    ).then(result => {
      if (result) {
        setCategories(result.data || []);
      }
      return result;
    });
  }, [handleApiCall]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    setCategories
  };
};