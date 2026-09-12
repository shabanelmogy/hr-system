import React, { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import {
  AppIcon,
  AppIconButton,
  AppDataCard,
  AppStatusBadge,
  AppPaginationNavigation,
  AppScreen,
  AppStateView,
  AppText,
  ConfirmationDialog,
  showToast,
} from '@/src/shared/components';
import {
  useApplications,
  useApproveJobRequisition,
  useRejectJobRequisition,
  useChangeApplicationStage,
  useCloseJobOpening,
  useHireCandidate,
  useJobOpenings,
  useJobRequisitions,
  useCreateJobRequisition,
  useOpenJobOpening,
  usePauseJobOpening,
  useRecruitmentSummary,
  useJobOffers,
  useSubmitJobOffer,
  useApproveJobOffer,
  useRejectJobOffer,
  useIssueJobOffer,
} from '../queries/use-recruitment';
import {
  ApplicationStage,
  ApplicationStatus,
  EmploymentApplicationDto,
  JobRequisitionMutation,
  JobOfferStatus,
  type JobOfferDto,
} from '../../domain/models/recruitment';
import { useRecruitmentPermissions } from '../hooks/use-recruitment-permissions';
import { CandidateDetailModal } from '../components/CandidateDetailModal';
import { CandidatePipelineCard } from '../components/CandidatePipelineCard';
import { JobOfferModal } from '../components/JobOfferModal';
import { JobOpeningCard } from '../components/JobOpeningCard';
import { JobRequisitionCard } from '../components/JobRequisitionCard';
import { PlannedRequisitionForm } from '../components/PlannedRequisitionForm';
import { RecruitmentSettingsViewMobile } from '../components/RecruitmentSettingsViewMobile';
import { RecruitmentSummaryStats } from '../components/RecruitmentSummaryStats';
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal';
import { InterviewEvaluationModal } from '../components/InterviewEvaluationModal';

type ActiveTab = 'openings' | 'requisitions' | 'pipeline' | 'offers' | 'settings';
type PendingOfferAction = { action: 'submit' | 'approve' | 'reject' | 'issue'; offer: JobOfferDto } | null;

export function RecruitmentScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const [activeTab, setActiveTab] = useState<ActiveTab>('openings');
  const [selectedOpeningId, setSelectedOpeningId] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<ApplicationStage | 'all'>('all');
  const [search, setSearch] = useState('');
  const [offersPage, setOffersPage] = useState(0);
  const [pendingOfferAction, setPendingOfferAction] = useState<PendingOfferAction>(null);
  const [offerRejectReason, setOfferRejectReason] = useState('');

  // Modals state
  const [selectedApplication, setSelectedApplication] = useState<EmploymentApplicationDto | null>(null);
  const [interviewAppId, setInterviewAppId] = useState<number | null>(null);
  const [offerAppId, setOfferAppId] = useState<number | null>(null);
  const [hireAppId, setHireAppId] = useState<number | null>(null);
  const [evaluateInterviewId, setEvaluateInterviewId] = useState<number | null>(null);
  const [requisitionFormOpen, setRequisitionFormOpen] = useState(false);

  // Queries
  const summaryQuery = useRecruitmentSummary();
  const openingsQuery = useJobOpenings({ search });
  const requisitionsQuery = useJobRequisitions({ search });
  const applicationsQuery = useApplications({
    jobOpeningId: selectedOpeningId ?? undefined,
    stage: selectedStage === 'all' ? undefined : selectedStage,
    search,
  });
  const offersQuery = useJobOffers({ pageNumber: offersPage + 1, pageSize: 10 });

  // Mutations
  const openOpeningMutation = useOpenJobOpening();
  const pauseOpeningMutation = usePauseJobOpening();
  const closeOpeningMutation = useCloseJobOpening();
  const approveRequisitionMutation = useApproveJobRequisition();
  const rejectRequisitionMutation = useRejectJobRequisition();
  const changeStageMutation = useChangeApplicationStage();
  const hireMutation = useHireCandidate();
  const createRequisitionMutation = useCreateJobRequisition();
  const submitOfferMutation = useSubmitJobOffer();
  const approveOfferMutation = useApproveJobOffer();
  const rejectOfferMutation = useRejectJobOffer();
  const issueOfferMutation = useIssueJobOffer();
  const perms = useRecruitmentPermissions();

  const isRefreshing =
    summaryQuery.isRefetching ||
    openingsQuery.isRefetching ||
    applicationsQuery.isRefetching ||
    requisitionsQuery.isRefetching ||
    offersQuery.isRefetching;

  const handleRefresh = () => {
    summaryQuery.refetch();
    openingsQuery.refetch();
    applicationsQuery.refetch();
    requisitionsQuery.refetch();
    offersQuery.refetch();
  };

  const openings = openingsQuery.data?.items ?? [];
  const requisitions = requisitionsQuery.data?.items ?? [];
  const applications = applicationsQuery.data?.items ?? [];
  const offers = offersQuery.data?.items ?? [];

  const stageChips: { id: ApplicationStage | 'all'; label: string }[] = [
    { id: 'all', label: t('common.all', 'الكل / All') },
    { id: ApplicationStage.Applied, label: t('recruitment.stages.applied', 'تم التقديم / Applied') },
    { id: ApplicationStage.Shortlisted, label: t('recruitment.stages.shortlisted', 'المختصرة / Shortlisted') },
    { id: ApplicationStage.Interview, label: t('recruitment.stages.interview', 'المقابلات / Interviews') },
    { id: ApplicationStage.Offer, label: t('recruitment.stages.offer', 'العروض / Offers') },
    { id: ApplicationStage.Hired, label: t('recruitment.stages.hired', 'تم التعيين / Hired') },
  ];

  const handleConfirmHire = async () => {
    if (!hireAppId) return;
    try {
      await hireMutation.mutateAsync({
        id: hireAppId,
        employeeNumber: `EMP-${new Date().getFullYear()}-${hireAppId}`,
        hireDate: new Date().toISOString().split('T')[0],
        idempotencyKey: `hire-${hireAppId}`,
      });
      showToast.success(t('recruitment.candidate.hiredSuccess', 'تم تعيين المرشح بنجاح!'));
      setHireAppId(null);
    } catch (error) {
      showToast.error(error, t('common.error', 'حدث خطأ أثناء التعيين'));
    }
  };

  const confirmOfferAction = async () => {
    if (!pendingOfferAction) return;
    try {
      if (pendingOfferAction.action === 'submit') await submitOfferMutation.mutateAsync(pendingOfferAction.offer.id);
      else if (pendingOfferAction.action === 'approve') await approveOfferMutation.mutateAsync(pendingOfferAction.offer.id);
      else if (pendingOfferAction.action === 'issue') await issueOfferMutation.mutateAsync(pendingOfferAction.offer.id);
      else {
        if (!offerRejectReason.trim() || offerRejectReason.trim().length > 1000) {
          showToast.error(new Error(t('recruitment.offers.rejectReasonRequired')));
          return;
        }
        await rejectOfferMutation.mutateAsync({ id: pendingOfferAction.offer.id, reason: offerRejectReason.trim() });
      }
      setPendingOfferAction(null);
      setOfferRejectReason('');
      await offersQuery.refetch();
    } catch (error) {
      showToast.error(error, t('common.error', 'حدث خطأ أثناء تحديث العرض'));
    }
  };

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View style={styles.container}>
        {/* KPI summary strip (Hidden in settings tab) */}
        {activeTab !== 'settings' && (
          <RecruitmentSummaryStats summary={summaryQuery.data} isLoading={summaryQuery.isLoading} />
        )}

        {activeTab === 'requisitions' && perms.canManageRequisitions ? (
          <AppIconButton icon="add-outline" label={t('recruitment.requisitions.newRequisition')} onPress={() => setRequisitionFormOpen(true)} />
        ) : null}

        {/* Tab switcher: Openings vs Requisitions vs Pipeline vs Settings */}
        <View style={[styles.tabBar, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
          <Pressable
            onPress={() => setActiveTab('openings')}
            style={[
              styles.tabBtn,
              activeTab === 'openings' && {
                backgroundColor: theme.colors.surface,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          >
            <AppIcon
              name="briefcase-outline"
              size={15}
              color={activeTab === 'openings' ? theme.colors.primary : theme.colors.textMuted}
            />
            <AppText
              variant="caption"
              weight={activeTab === 'openings' ? '800' : '600'}
              style={{
                color: activeTab === 'openings' ? theme.colors.primary : theme.colors.textMuted,
              }}
            >
              {t('recruitment.tabs.openingsShort', 'الشواغر')}
            </AppText>
          </Pressable>

          {perms.canView ? <Pressable
            onPress={() => setActiveTab('offers')}
            style={[styles.tabBtn, activeTab === 'offers' && { backgroundColor: theme.colors.surface, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }]}
          >
            <AppIcon name="mail-outline" size={15} color={activeTab === 'offers' ? theme.colors.primary : theme.colors.textMuted} />
            <AppText variant="caption" weight={activeTab === 'offers' ? '800' : '600'} style={{ color: activeTab === 'offers' ? theme.colors.primary : theme.colors.textMuted }}>{t('recruitment.tabs.offersShort', 'العروض')} ({offers.length})</AppText>
          </Pressable> : null}

          <Pressable
            onPress={() => setActiveTab('requisitions')}
            style={[
              styles.tabBtn,
              activeTab === 'requisitions' && {
                backgroundColor: theme.colors.surface,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          >
            <AppIcon
              name="document-text-outline"
              size={15}
              color={activeTab === 'requisitions' ? theme.colors.primary : theme.colors.textMuted}
            />
            <AppText
              variant="caption"
              weight={activeTab === 'requisitions' ? '800' : '600'}
              style={{
                color: activeTab === 'requisitions' ? theme.colors.primary : theme.colors.textMuted,
              }}
            >
              {t('recruitment.tabs.requisitionsShort', 'الاحتياجات')} ({requisitions.length})
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('pipeline')}
            style={[
              styles.tabBtn,
              activeTab === 'pipeline' && {
                backgroundColor: theme.colors.surface,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          >
            <AppIcon
              name="people-outline"
              size={15}
              color={activeTab === 'pipeline' ? theme.colors.primary : theme.colors.textMuted}
            />
            <AppText
              variant="caption"
              weight={activeTab === 'pipeline' ? '800' : '600'}
              style={{
                color: activeTab === 'pipeline' ? theme.colors.primary : theme.colors.textMuted,
              }}
            >
              {t('recruitment.tabs.pipelineShort', 'المسار')}
            </AppText>
          </Pressable>

          {(perms.canManageOpenings || perms.canManageRequisitions) && (
            <Pressable
              onPress={() => setActiveTab('settings')}
              style={[
                styles.tabBtn,
                activeTab === 'settings' && {
                  backgroundColor: theme.colors.surface,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
            >
              <AppIcon
                name="settings-outline"
                size={15}
                color={activeTab === 'settings' ? theme.colors.primary : theme.colors.textMuted}
              />
              <AppText
                variant="caption"
                weight={activeTab === 'settings' ? '800' : '600'}
                style={{
                  color: activeTab === 'settings' ? theme.colors.primary : theme.colors.textMuted,
                }}
              >
                {t('recruitment.tabs.settingsShort', 'الإعدادات')}
              </AppText>
            </Pressable>
          )}
        </View>

        {/* Search Bar (Hidden in settings tab) */}
        {activeTab !== 'settings' && (
          <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <AppIcon name="search-outline" size={18} color={theme.colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={
                activeTab === 'openings'
                  ? t('recruitment.openings.searchPlaceholder', 'بحث عن وظيفة...')
                  : activeTab === 'requisitions'
                  ? t('recruitment.requisitions.searchPlaceholder', 'بحث عن طلب احتياج...')
                : activeTab === 'offers' ? t('recruitment.offers.managementTitle') : t('recruitment.pipeline.searchPlaceholder', 'بحث عن مرشح بالاسم أو البريد...')
              }
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.searchInput, { color: theme.colors.text }]}
            />
            {Boolean(search) && (
              <Pressable onPress={() => setSearch('')}>
                <AppIcon name="close-circle" size={16} color={theme.colors.textMuted} />
              </Pressable>
            )}
          </View>
        )}

        {/* Pipeline Stage Filter Chips (Visible when in Pipeline tab) */}
        {activeTab === 'pipeline' && (
          <View style={styles.pipelineFilterSection}>
            {selectedOpeningId && (
              <View style={[styles.activeOpeningPill, { backgroundColor: `${theme.colors.primary}15`, borderColor: theme.colors.primary }]}>
                <AppText variant="caption" weight="700" style={{ color: theme.colors.primary }}>
                  {t('recruitment.pipeline.filteredByOpening', 'مصفاة حسب الوظيفة المحددة')}
                </AppText>
                <Pressable onPress={() => setSelectedOpeningId(null)}>
                  <AppIcon name="close-circle" size={16} color={theme.colors.primary} />
                </Pressable>
              </View>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stageChipsList}
            >
              {stageChips.map((item) => {
                const isSelected = selectedStage === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelectedStage(item.id)}
                    style={[
                      styles.stageChip,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight={isSelected ? '800' : '600'}
                      style={{
                        color: isSelected ? theme.colors.onPrimary : theme.colors.text,
                      }}
                    >
                      {item.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Content Lists */}
        {activeTab === 'openings' ? (
          openingsQuery.isLoading ? (
            <AppStateView state="loading" />
          ) : openings.length === 0 ? (
            <AppStateView
              state="empty"
              message={t('recruitment.openings.noPositions', 'لا توجد وظائف معلنة حالياً')}
            />
          ) : (
            <View style={styles.listContent}>
              {openings.map((item) => (
                <JobOpeningCard
                  key={item.id}
                  opening={item}
                  isSelected={selectedOpeningId === item.id}
                  onSelect={(id) => {
                    setSelectedOpeningId(selectedOpeningId === id ? null : id);
                    setActiveTab('pipeline');
                  }}
                  onOpen={perms.canManageOpenings ? (id) => openOpeningMutation.mutate(id) : undefined}
                  onPause={perms.canManageOpenings ? (id) => pauseOpeningMutation.mutate(id) : undefined}
                  onClose={perms.canManageOpenings ? (id) => closeOpeningMutation.mutate(id) : undefined}
                />
              ))}
            </View>
          )
        ) : activeTab === 'requisitions' ? (
          requisitionsQuery.isLoading ? (
            <AppStateView state="loading" />
          ) : requisitions.length === 0 ? (
            <AppStateView
              state="empty"
              message={t('recruitment.requisitions.noRequisitions', 'لا توجد طلبات احتياج مسجلة')}
            />
          ) : (
            <View style={styles.listContent}>
              {requisitions.map((item) => (
                <JobRequisitionCard
                  key={item.id}
                  requisition={item}
                  onApprove={perms.canApproveRequisitions ? (id) => approveRequisitionMutation.mutate(id) : undefined}
                  onReject={perms.canApproveRequisitions ? (id) => rejectRequisitionMutation.mutate({ id, reason: 'Rejected from mobile' }) : undefined}
                  onOpenOpening={perms.canManageOpenings ? () => setActiveTab('openings') : undefined}
                />
              ))}
            </View>
          )
        ) : activeTab === 'pipeline' ? (
          applicationsQuery.isLoading ? (
            <AppStateView state="loading" />
          ) : applications.length === 0 ? (
            <AppStateView
              state="empty"
              message={t('recruitment.pipeline.noApplicants', 'لا يوجد متقدمون في هذه المرحلة')}
            />
          ) : (
            <View style={styles.listContent}>
              {applications.map((item) => (
                <CandidatePipelineCard
                  key={item.id}
                  application={item}
                  onPress={(app) => setSelectedApplication(app)}
                  onScheduleInterview={
                    perms.canEvaluateInterviews || perms.canManageApplications
                      ? (appId) => setInterviewAppId(appId)
                      : undefined
                  }
                  onEvaluateInterview={
                    perms.canEvaluateInterviews
                      ? (appId) => setEvaluateInterviewId(appId)
                      : undefined
                  }
                  onMakeOffer={
                    perms.canManageOffers
                      ? (appId) => setOfferAppId(appId)
                      : undefined
                  }
                  onHire={
                    perms.canHire && item.status === ApplicationStatus.OfferAccepted
                      ? (appId) => setHireAppId(appId)
                      : undefined
                  }
                  onMoveStage={
                    perms.canManageApplications
                      ? (appId, nextStage) => changeStageMutation.mutate({ id: appId, stage: nextStage })
                      : undefined
                  }
                />
              ))}
            </View>
          )
        ) : activeTab === 'offers' ? (
           offersQuery.isLoading ? <AppStateView state="loading" /> : offers.length === 0 ? <AppStateView state="empty" message={t('recruitment.offers.noOffers')} /> : <View style={styles.listContent}>{offers.filter(offer => !search || offer.offerNumber.toLowerCase().includes(search.toLowerCase())).map(offer => {
             const statusKey = JobOfferStatus[offer.status] ?? String(offer.status);
             return <AppDataCard key={offer.id} padding="md"><View style={styles.offerHeader}><AppText weight="800">{offer.offerNumber}</AppText><AppStatusBadge label={t(`recruitment.offers.statusValues.${statusKey}`, statusKey)} color={offer.status === JobOfferStatus.Approved ? theme.colors.success : theme.colors.primary} /></View><AppText variant="bodySmall">{offer.candidateName ?? `#${offer.employmentApplicationId}`}</AppText><AppText color="muted" variant="caption">{t('recruitment.offers.annualSnapshot')}: {offer.annualSalarySnapshot ?? 0} {offer.currencyCode} • {t('recruitment.offers.fiscalSnapshot')}: {offer.fiscalYearCostSnapshot ?? 0} {offer.currencyCode}</AppText><AppText color="muted" variant="caption">{t('recruitment.offers.reservationDelta')}: {offer.reservationDelta ?? 0} {offer.currencyCode}</AppText>{offer.approvalHistory?.map(history => <AppText key={history.id} color="muted" variant="caption">{t(`recruitment.offers.history.${history.action}`, history.action)} • {history.actorUserId} • {new Date(history.occurredOn).toLocaleDateString()}</AppText>)}<View style={styles.offerActions}>{perms.canManageOffers && offer.status === JobOfferStatus.Draft ? <AppIconButton icon="send-outline" label={t('recruitment.offers.submit')} onPress={() => setPendingOfferAction({ action: 'submit', offer })} /> : null}{perms.canApproveOffers && offer.status === JobOfferStatus.PendingApproval ? <><AppIconButton icon="checkmark-circle-outline" label={t('recruitment.offers.approveOffer')} onPress={() => setPendingOfferAction({ action: 'approve', offer })} /><AppIconButton icon="close-circle-outline" label={t('recruitment.offers.rejectApproval')} onPress={() => { setOfferRejectReason(''); setPendingOfferAction({ action: 'reject', offer }); }} /></> : null}{perms.canManageOffers && offer.status === JobOfferStatus.Approved ? <AppIconButton icon="send-outline" label={t('recruitment.offers.issue')} onPress={() => setPendingOfferAction({ action: 'issue', offer })} /> : null}</View></AppDataCard>;
           })}{offersQuery.data?.metaData.totalPages && offersQuery.data.metaData.totalPages > 1 ? <AppPaginationNavigation page={offersPage} pageCount={offersQuery.data.metaData.totalPages} onPageChange={setOffersPage} /> : null}</View>
        ) : (
          <RecruitmentSettingsViewMobile />
        )}
      </View>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        visible={interviewAppId !== null}
        applicationId={interviewAppId}
        onClose={() => setInterviewAppId(null)}
        onSuccess={() => applicationsQuery.refetch()}
      />

      {/* Interview Evaluation Modal */}
      <InterviewEvaluationModal
        visible={evaluateInterviewId !== null}
        interviewId={evaluateInterviewId}
        onClose={() => setEvaluateInterviewId(null)}
        onSuccess={() => applicationsQuery.refetch()}
      />

      {/* Job Offer Modal */}
      <JobOfferModal
        visible={offerAppId !== null}
        applicationId={offerAppId}
        onClose={() => setOfferAppId(null)}
        onSuccess={() => applicationsQuery.refetch()}
      />

      <PlannedRequisitionForm
        visible={requisitionFormOpen}
        loading={createRequisitionMutation.isPending}
        onClose={() => setRequisitionFormOpen(false)}
        onSave={async (request: JobRequisitionMutation) => {
          try {
            await createRequisitionMutation.mutateAsync(request);
            showToast.success(t('recruitment.requisitions.createdDraftSuccess'));
            setRequisitionFormOpen(false);
          } catch (error) {
            showToast.error(error, t('recruitment.requisitions.createError'));
          }
        }}
      />

      {/* Candidate Profile Details Modal */}
      <CandidateDetailModal
        visible={selectedApplication !== null}
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onSuccess={() => applicationsQuery.refetch()}
      />

      {/* Confirmation Dialog for Hiring */}
      <ConfirmationDialog
        visible={hireAppId !== null}
        title={t('recruitment.candidate.confirmHireTitle', 'تأكيد تعيين المرشح')}
        description={t(
          'recruitment.candidate.confirmHire',
          'هل أنت متأكد من تعيين هذا المرشح كموظف رسمي في المنشأة؟'
        )}
        confirmLabel={t('recruitment.actions.hireCandidate', 'تعيين كموظف')}
        loading={hireMutation.isPending}
        tone="default"
        onConfirm={handleConfirmHire}
        onCancel={() => setHireAppId(null)}
      />

      <ConfirmationDialog
        visible={pendingOfferAction !== null}
        title={pendingOfferAction ? t(`recruitment.offers.actions.${pendingOfferAction.action}`) : ''}
        description={t('recruitment.offers.actionDescription')}
        confirmLabel={pendingOfferAction ? t(`recruitment.offers.actions.${pendingOfferAction.action}`) : t('common.confirm')}
        tone={pendingOfferAction?.action === 'reject' ? 'danger' : 'default'}
        loading={submitOfferMutation.isPending || approveOfferMutation.isPending || rejectOfferMutation.isPending || issueOfferMutation.isPending}
        onConfirm={confirmOfferAction}
        onCancel={() => { setPendingOfferAction(null); setOfferRejectReason(''); }}
      >
        {pendingOfferAction?.action === 'reject' ? <TextInput value={offerRejectReason} onChangeText={setOfferRejectReason} maxLength={1000} placeholder={t('recruitment.offers.rejectReason')} placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]} /> : null}
      </ConfirmationDialog>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  offerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  offerActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  input: { minHeight: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginTop: 8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    height: 42,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  pipelineFilterSection: {
    gap: 8,
    marginBottom: 8,
  },
  activeOpeningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 16,
  },
  stageChipsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  stageChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
