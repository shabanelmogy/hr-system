"use client";

import { useCallback, useState } from "react";
import { useRecruitmentSettingsQuery, useUpdateRecruitmentSettingsMutation } from "./useRecruitment";
import {
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
  const settingsQuery = useRecruitmentSettingsQuery();
  const { mutate: updateSettings } = useUpdateRecruitmentSettingsMutation();
  const [overrides, setOverrides] = useState<Partial<RecruitmentSettingsDto>>({});

  const serverSettings = settingsQuery.data;
  const stages = overrides.stages
    ?? (serverSettings?.stages?.length ? serverSettings.stages : DEFAULT_STAGES);
  const reasons = overrides.rejectionReasons
    ?? (serverSettings?.rejectionReasons?.length
      ? serverSettings.rejectionReasons
      : DEFAULT_REASONS);
  const sources = overrides.sources
    ?? (serverSettings?.sources?.length ? serverSettings.sources : DEFAULT_SOURCES);
  const criteria = overrides.evaluationCriteria
    ?? (serverSettings?.evaluationCriteria?.length ? serverSettings.evaluationCriteria : DEFAULT_CRITERIA);
  const generalSettings = overrides.general ?? serverSettings?.general ?? DEFAULT_GENERAL_SETTINGS;

  const persistChanges = useCallback((changes: Partial<RecruitmentSettingsDto>) => {
    const payload: RecruitmentSettingsDto = {
      stages: changes.stages ?? stages,
      rejectionReasons: changes.rejectionReasons ?? reasons,
      sources: changes.sources ?? sources,
      evaluationCriteria: changes.evaluationCriteria ?? criteria,
      general: changes.general ?? generalSettings,
    };
    updateSettings(payload);
  }, [criteria, generalSettings, reasons, sources, stages, updateSettings]);

  const saveStages = useCallback((nextStages: RecruitmentStageConfig[]) => {
    setOverrides((current) => ({ ...current, stages: nextStages }));
    persistChanges({ stages: nextStages });
  }, [persistChanges]);

  const addStage = useCallback((stage: Omit<RecruitmentStageConfig, "id">) => {
    const nextStages = [...stages, { ...stage, id: `stage_${crypto.randomUUID()}` }]
      .sort((left, right) => left.sequence - right.sequence);
    saveStages(nextStages);
  }, [saveStages, stages]);

  const updateStage = useCallback((id: string, changes: Partial<RecruitmentStageConfig>) => {
    saveStages(stages
      .map((stage) => stage.id === id ? { ...stage, ...changes } : stage)
      .sort((left, right) => left.sequence - right.sequence));
  }, [saveStages, stages]);

  const deleteStage = useCallback((id: string) => {
    saveStages(stages.filter((stage) => stage.id !== id));
  }, [saveStages, stages]);

  const saveReasons = useCallback((nextReasons: RejectionReasonConfig[]) => {
    setOverrides((current) => ({ ...current, rejectionReasons: nextReasons }));
    persistChanges({ rejectionReasons: nextReasons });
  }, [persistChanges]);

  const addReason = useCallback((reason: Omit<RejectionReasonConfig, "id">) => {
    saveReasons([...reasons, { ...reason, id: `rr_${crypto.randomUUID()}` }]);
  }, [reasons, saveReasons]);

  const updateReason = useCallback((id: string, changes: Partial<RejectionReasonConfig>) => {
    saveReasons(reasons.map((reason) => reason.id === id ? { ...reason, ...changes } : reason));
  }, [reasons, saveReasons]);

  const deleteReason = useCallback((id: string) => {
    saveReasons(reasons.filter((reason) => reason.id !== id));
  }, [reasons, saveReasons]);

  const saveSources = useCallback((nextSources: RecruitmentSourceConfig[]) => {
    setOverrides((current) => ({ ...current, sources: nextSources }));
    persistChanges({ sources: nextSources });
  }, [persistChanges]);

  const addSource = useCallback((source: Omit<RecruitmentSourceConfig, "id">) => {
    saveSources([...sources, { ...source, id: `src_${crypto.randomUUID()}` }]);
  }, [saveSources, sources]);

  const updateSource = useCallback((id: string, changes: Partial<RecruitmentSourceConfig>) => {
    saveSources(sources.map((source) => source.id === id ? { ...source, ...changes } : source));
  }, [saveSources, sources]);

  const deleteSource = useCallback((id: string) => {
    saveSources(sources.filter((source) => source.id !== id));
  }, [saveSources, sources]);

  const saveCriteria = useCallback((nextCriteria: EvaluationCriterionConfig[]) => {
    setOverrides((current) => ({ ...current, evaluationCriteria: nextCriteria }));
    persistChanges({ evaluationCriteria: nextCriteria });
  }, [persistChanges]);

  const addCriterion = useCallback((criterion: Omit<EvaluationCriterionConfig, "id">) => {
    saveCriteria([...criteria, { ...criterion, id: `crit_${crypto.randomUUID()}` }]);
  }, [criteria, saveCriteria]);

  const updateCriterion = useCallback((id: string, changes: Partial<EvaluationCriterionConfig>) => {
    saveCriteria(criteria.map((criterion) =>
      criterion.id === id ? { ...criterion, ...changes } : criterion));
  }, [criteria, saveCriteria]);

  const deleteCriterion = useCallback((id: string) => {
    saveCriteria(criteria.filter((criterion) => criterion.id !== id));
  }, [criteria, saveCriteria]);

  const updateGeneralSettings = useCallback((changes: Partial<RecruitmentGeneralSettings>) => {
    const nextGeneralSettings = { ...generalSettings, ...changes };
    setOverrides((current) => ({ ...current, general: nextGeneralSettings }));
    persistChanges({ general: nextGeneralSettings });
  }, [generalSettings, persistChanges]);

  const resetAll = useCallback(() => {
    const defaults: RecruitmentSettingsDto = {
      stages: DEFAULT_STAGES,
      rejectionReasons: DEFAULT_REASONS,
      sources: DEFAULT_SOURCES,
      evaluationCriteria: DEFAULT_CRITERIA,
      general: DEFAULT_GENERAL_SETTINGS,
    };
    setOverrides(defaults);
    persistChanges(defaults);
  }, [persistChanges]);

  return {
    isLoaded: !settingsQuery.isLoading,
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
