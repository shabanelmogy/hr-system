import { useState, useEffect, useCallback } from 'react';
import { useApiHandler } from '../../../shared/hooks';
import { communicationService } from '../services';

export const useCommunicationStats = (userId, options = {}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleApiCall } = useApiHandler(options);

  const fetchStats = useCallback(async (dateRange = {}) => {
    return handleApiCall(
      () => communicationService.getCommunicationStats(userId, dateRange),
      null,
      setError
    ).then(result => {
      if (result) {
        setStats(result.data);
      }
      return result;
    });
  }, [userId, handleApiCall]);

  useEffect(() => {
    if (userId) {
      fetchStats();
    }
  }, [userId, fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    setStats
  };
};

export const useMessageAnalytics = (options = {}) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleApiCall } = useApiHandler(options);

  const fetchAnalytics = useCallback(async (filters = {}) => {
    return handleApiCall(
      () => communicationService.getMessageAnalytics(filters),
      null,
      setError
    ).then(result => {
      if (result) {
        setAnalytics(result.data);
      }
      return result;
    });
  }, [handleApiCall]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    setAnalytics
  };
};

export const useAnnouncementAnalytics = (options = {}) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleApiCall } = useApiHandler(options);

  const fetchAnalytics = useCallback(async (filters = {}) => {
    return handleApiCall(
      () => communicationService.getAnnouncementAnalytics(filters),
      null,
      setError
    ).then(result => {
      if (result) {
        setAnalytics(result.data);
      }
      return result;
    });
  }, [handleApiCall]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    setAnalytics
  };
};

export const useFeedbackAnalytics = (options = {}) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleApiCall } = useApiHandler(options);

  const fetchAnalytics = useCallback(async (filters = {}) => {
    return handleApiCall(
      () => communicationService.getFeedbackAnalytics(filters),
      null,
      setError
    ).then(result => {
      if (result) {
        setAnalytics(result.data);
      }
      return result;
    });
  }, [handleApiCall]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    setAnalytics
  };
};