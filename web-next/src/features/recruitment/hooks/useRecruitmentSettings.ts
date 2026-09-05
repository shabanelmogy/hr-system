"use client";

import { useState, useEffect, useCallback } from "react";
import { useRecruitmentSettingsQuery, useUpdateRecruitmentSettingsMutation } from "./useRecruitment";
import {
  recruitmentSettingsService,
  DEFAULT_STAGES,
  DEFAULT_REASONS,
  DEFAULT_SOURCES,
  DEFAULT_CRITERIA,
  DEFAULT_GENERAL_SETTINGS,
} from "../services/recruitmentSettingsService";
import type {
  RecruitmentStageConfig,
  RejectionReasonConfig,
  RecruitmentSourceConfig,
  EvaluationCriterionConfig,
  RecruitmentGeneralSettings,
  RecruitmentSettingsDto,
} from "../types/recruitmentSettingsTypes";

export function useRecruitmentSettings() {
  const [stages, setStages] = useState<RecruitmentStageConfig[]>(DEFAULT_STAGES);
  const [reasons, setReasons] = useState<RejectionReasonConfig[]>(DEFAULT_REASONS);
  const [sources, setSources] = useState<RecruitmentSourceConfig[]>(DEFAULT_SOURCES);
  const [criteria, setCriteria] = useState<EvaluationCriterionConfig[]>(DEFAULT_CRITERIA);
  const [generalSettings, setGeneralSettings] = useState<RecruitmentGeneralSettings>(DEFAULT_GENERAL_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  const settingsQuery = useRecruitmentSettingsQuery();
  const updateSettingsMutation = useUpdateRecruitmentSettingsMutation();

  // Load from API on mount, with fallback to local storage
  useEffect(() => {
    if (settingsQuery.data) {
      if (settingsQuery.data.stages?.length) setStages(settingsQuery.data.stages as RecruitmentStageConfig[]);
      if (settingsQuery.data.rejectionReasons?.length) setReasons(settingsQuery.data.rejectionReasons as RejectionReasonConfig[]);
      if (settingsQuery.data.sources?.length) setSources(settingsQuery.data.sources as RecruitmentSourceConfig[]);
      if (settingsQuery.data.evaluationCriteria?.length) setCriteria(settingsQuery.data.evaluationCriteria as EvaluationCriterionConfig[]);
      if (settingsQuery.data.general) setGeneralSettings(settingsQuery.data.general as RecruitmentGeneralSettings);
      setIsLoaded(true);
    } else if (!settingsQuery.isLoading) {
      setStages(recruitmentSettingsService.getStages());
      setReasons(recruitmentSettingsService.getRejectionReasons());
      setSources(recruitmentSettingsService.getSources());
      setCriteria(recruitmentSettingsService.getCriteria());
      setGeneralSettings(recruitmentSettingsService.getGeneralSettings());
      setIsLoaded(true);
    }
  }, [settingsQuery.data, settingsQuery.isLoading]);

  // Helper to persist to API and local cache
  const persistChanges = useCallback(
    (overrides?: Partial<RecruitmentSettingsDto>) => {
      const payload: RecruitmentSettingsDto = {
        stages: overrides?.stages ?? stages,
        rejectionReasons: overrides?.rejectionReasons ?? reasons,
        sources: overrides?.sources ?? sources,
        evaluationCriteria: overrides?.evaluationCriteria ?? criteria,
        general: overrides?.general ?? generalSettings,
      };
      updateSettingsMutation.mutate(payload);
      recruitmentSettingsService.saveStages(payload.stages);
      recruitmentSettingsService.saveRejectionReasons(payload.rejectionReasons);
      recruitmentSettingsService.saveSources(payload.sources);
      recruitmentSettingsService.saveCriteria(payload.evaluationCriteria);
      recruitmentSettingsService.saveGeneralSettings(payload.general);
    },
    [stages, reasons, sources, criteria, generalSettings, updateSettingsMutation]
  );

  // --- Stage Handlers ---
  const saveStages = useCallback((newStages: RecruitmentStageConfig[]) => {
    setStages(newStages);
    persistChanges({ stages: newStages });
  }, [persistChanges]);

  const addStage = useCallback((stage: Omit<RecruitmentStageConfig, "id">) => {
    const newStage: RecruitmentStageConfig = {
      ...stage,
      id: `stage_${Date.now()}`,
    };
    setStages((prev) => {
      const updated = [...prev, newStage].sort((a, b) => a.sequence - b.sequence);
      persistChanges({ stages: updated });
      return updated;
    });
  }, [persistChanges]);

  const updateStage = useCallback((id: string, updates: Partial<RecruitmentStageConfig>) => {
    setStages((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s)).sort((a, b) => a.sequence - b.sequence);
      persistChanges({ stages: updated });
      return updated;
    });
  }, [persistChanges]);

  const deleteStage = useCallback((id: string) => {
    setStages((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      persistChanges({ stages: updated });
      return updated;
    });
  }, [persistChanges]);

  // --- Rejection Reasons Handlers ---
  const addReason = useCallback((reason: Omit<RejectionReasonConfig, "id">) => {
    const newReason: RejectionReasonConfig = {
      ...reason,
      id: `rr_${Date.now()}`,
    };
    setReasons((prev) => {
      const updated = [...prev, newReason];
      persistChanges({ rejectionReasons: updated });
      return updated;
    });
  }, [persistChanges]);

  const updateReason = useCallback((id: string, updates: Partial<RejectionReasonConfig>) => {
    setReasons((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
      persistChanges({ rejectionReasons: updated });
      return updated;
    });
  }, [persistChanges]);

  const deleteReason = useCallback((id: string) => {
    setReasons((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      persistChanges({ rejectionReasons: updated });
      return updated;
    });
  }, [persistChanges]);

  // --- Sources Handlers ---
  const addSource = useCallback((source: Omit<RecruitmentSourceConfig, "id">) => {
    const newSource: RecruitmentSourceConfig = {
      ...source,
      id: `src_${Date.now()}`,
    };
    setSources((prev) => {
      const updated = [...prev, newSource];
      persistChanges({ sources: updated });
      return updated;
    });
  }, [persistChanges]);

  const updateSource = useCallback((id: string, updates: Partial<RecruitmentSourceConfig>) => {
    setSources((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      persistChanges({ sources: updated });
      return updated;
    });
  }, [persistChanges]);

  const deleteSource = useCallback((id: string) => {
    setSources((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      persistChanges({ sources: updated });
      return updated;
    });
  }, [persistChanges]);

  // --- Criteria Handlers ---
  const addCriterion = useCallback((criterion: Omit<EvaluationCriterionConfig, "id">) => {
    const newCrit: EvaluationCriterionConfig = {
      ...criterion,
      id: `crit_${Date.now()}`,
    };
    setCriteria((prev) => {
      const updated = [...prev, newCrit];
      persistChanges({ evaluationCriteria: updated });
      return updated;
    });
  }, [persistChanges]);

  const updateCriterion = useCallback((id: string, updates: Partial<EvaluationCriterionConfig>) => {
    setCriteria((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      persistChanges({ evaluationCriteria: updated });
      return updated;
    });
  }, [persistChanges]);

  const deleteCriterion = useCallback((id: string) => {
    setCriteria((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      persistChanges({ evaluationCriteria: updated });
      return updated;
    });
  }, [persistChanges]);

  // --- General Settings Handler ---
  const updateGeneralSettings = useCallback((updates: Partial<RecruitmentGeneralSettings>) => {
    setGeneralSettings((prev) => {
      const updated = { ...prev, ...updates };
      persistChanges({ general: updated });
      return updated;
    });
  }, [persistChanges]);

  // --- Reset All ---
  const resetAll = useCallback(() => {
    setStages(DEFAULT_STAGES);
    setReasons(DEFAULT_REASONS);
    setSources(DEFAULT_SOURCES);
    setCriteria(DEFAULT_CRITERIA);
    setGeneralSettings(DEFAULT_GENERAL_SETTINGS);
    persistChanges({
      stages: DEFAULT_STAGES,
      rejectionReasons: DEFAULT_REASONS,
      sources: DEFAULT_SOURCES,
      evaluationCriteria: DEFAULT_CRITERIA,
      general: DEFAULT_GENERAL_SETTINGS,
    });
  }, [persistChanges]);

  return {
    isLoaded,
    stages,
    saveStages,
    addStage,
    updateStage,
    deleteStage,
    reasons,
    addReason,
    updateReason,
    deleteReason,
    sources,
    addSource,
    updateSource,
    deleteSource,
    criteria,
    addCriterion,
    updateCriterion,
    deleteCriterion,
    generalSettings,
    updateGeneralSettings,
    resetAll,
  };
}
