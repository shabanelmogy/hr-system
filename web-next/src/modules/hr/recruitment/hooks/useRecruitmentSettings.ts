"use client";

import { useCallback, useMemo } from "react";
import { useRecruitmentSettingsQuery, useUpdateRecruitmentSettingsMutation } from "./useRecruitment";
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
  const updateSettingsMutation = useUpdateRecruitmentSettingsMutation();

  const serverSettings = settingsQuery.data;
  const stages = useMemo(() => serverSettings?.stages ?? [], [serverSettings?.stages]);
  const reasons = useMemo(
    () => serverSettings?.rejectionReasons ?? [],
    [serverSettings?.rejectionReasons],
  );
  const sources = useMemo(() => serverSettings?.sources ?? [], [serverSettings?.sources]);
  const criteria = useMemo(
    () => serverSettings?.evaluationCriteria ?? [],
    [serverSettings?.evaluationCriteria],
  );
  const generalSettings = serverSettings?.general;

  const persistChanges = useCallback((changes: Partial<RecruitmentSettingsDto>) => {
    if (!serverSettings) return;
    const payload: RecruitmentSettingsDto = {
      stages: changes.stages ?? serverSettings.stages,
      rejectionReasons: changes.rejectionReasons ?? serverSettings.rejectionReasons,
      sources: changes.sources ?? serverSettings.sources,
      evaluationCriteria: changes.evaluationCriteria ?? serverSettings.evaluationCriteria,
      general: changes.general ?? serverSettings.general,
    };
    updateSettingsMutation.mutate(payload);
  }, [serverSettings, updateSettingsMutation]);

  const saveStages = useCallback((nextStages: RecruitmentStageConfig[]) => {
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

  const saveReasons = useCallback((nextReasons: RejectionReasonConfig[]) => {
    persistChanges({ rejectionReasons: nextReasons });
  }, [persistChanges]);

  const addReason = useCallback((reason: Omit<RejectionReasonConfig, "id">) => {
    saveReasons([...reasons, { ...reason, id: `rr_${crypto.randomUUID()}` }]);
  }, [reasons, saveReasons]);

  const updateReason = useCallback((id: string, changes: Partial<RejectionReasonConfig>) => {
    saveReasons(reasons.map((reason) => reason.id === id ? { ...reason, ...changes } : reason));
  }, [reasons, saveReasons]);

  const saveSources = useCallback((nextSources: RecruitmentSourceConfig[]) => {
    persistChanges({ sources: nextSources });
  }, [persistChanges]);

  const addSource = useCallback((source: Omit<RecruitmentSourceConfig, "id">) => {
    saveSources([...sources, { ...source, id: `src_${crypto.randomUUID()}` }]);
  }, [saveSources, sources]);

  const updateSource = useCallback((id: string, changes: Partial<RecruitmentSourceConfig>) => {
    saveSources(sources.map((source) => source.id === id ? { ...source, ...changes } : source));
  }, [saveSources, sources]);

  const saveCriteria = useCallback((nextCriteria: EvaluationCriterionConfig[]) => {
    persistChanges({ evaluationCriteria: nextCriteria });
  }, [persistChanges]);

  const addCriterion = useCallback((criterion: Omit<EvaluationCriterionConfig, "id">) => {
    saveCriteria([...criteria, { ...criterion, id: `crit_${crypto.randomUUID()}` }]);
  }, [criteria, saveCriteria]);

  const updateCriterion = useCallback((id: string, changes: Partial<EvaluationCriterionConfig>) => {
    saveCriteria(criteria.map((criterion) =>
      criterion.id === id ? { ...criterion, ...changes } : criterion));
  }, [criteria, saveCriteria]);

  const updateGeneralSettings = useCallback((changes: Partial<RecruitmentGeneralSettings>) => {
    if (!generalSettings) return;
    const nextGeneralSettings = { ...generalSettings, ...changes };
    persistChanges({ general: nextGeneralSettings });
  }, [generalSettings, persistChanges]);

  return {
    isLoaded: settingsQuery.isSuccess,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    isSaving: updateSettingsMutation.isPending,
    stages,
    saveStages,
    addStage,
    updateStage,
    reasons,
    addReason,
    updateReason,
    sources,
    addSource,
    updateSource,
    criteria,
    addCriterion,
    updateCriterion,
    generalSettings,
    updateGeneralSettings,
  };
}
