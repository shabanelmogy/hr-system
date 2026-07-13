import { useState, useEffect, useCallback } from 'react';
import { useApiHandler } from '../../../shared/hooks';
import { communicationService } from '../services';

export const useFeedback = (options = {}) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleApiCall } = useApiHandler(options);

  const fetchFeedback = useCallback(async (filters = {}) => {
    return handleApiCall(
      () => communicationService.getFeedback(filters),
      null,
      setError
    ).then(result => {
      if (result) {
        setFeedback(result.data || []);
      }
      return result;
    });
  }, [handleApiCall]);

  const submitFeedback = useCallback(async (feedbackData) => {
    return handleApiCall(
      () => communicationService.submitFeedback(feedbackData),
      'Feedback submitted successfully'
    ).then(result => {
      if (result) {
        setFeedback(prev => [result.data, ...prev]);
      }
      return result;
    });
  }, [handleApiCall]);

  const updateFeedbackStatus = useCallback(async (id, status, resolution = null) => {
    return handleApiCall(
      () => communicationService.updateFeedbackStatus(id, status, resolution),
      'Feedback status updated successfully'
    ).then(result => {
      if (result) {
        setFeedback(prev => prev.map(fb =>
          fb.id === id ? { ...fb, status, resolution, updatedAt: new Date().toISOString() } : fb
        ));
      }
      return result;
    });
  }, [handleApiCall]);

  const assignFeedback = useCallback(async (id, assignedTo) => {
    return handleApiCall(
      () => communicationService.assignFeedback(id, assignedTo),
      'Feedback assigned successfully'
    ).then(result => {
      if (result) {
        setFeedback(prev => prev.map(fb =>
          fb.id === id ? { ...fb, assignedTo } : fb
        ));
      }
      return result;
    });
  }, [handleApiCall]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  return {
    feedback,
    loading,
    error,
    fetchFeedback,
    submitFeedback,
    updateFeedbackStatus,
    assignFeedback,
    setFeedback
  };
};

export const useFeedbackCategories = (options = {}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleApiCall } = useApiHandler(options);

  const fetchCategories = useCallback(async () => {
    return handleApiCall(
      () => communicationService.getFeedbackCategories(),
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