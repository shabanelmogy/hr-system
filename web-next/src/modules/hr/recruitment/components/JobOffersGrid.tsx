"use client";

import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "@/shared/components/dialogs/confirmation/ConfirmationDialog";
import { CardViewPagination } from "@/shared/components/lists/card-view";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { showToast } from "@/shared/components/feedback/transient/showToast";
import { useRecruitmentPermissions } from "@/shared/hooks/usePermissions";
import { JobOfferStatus, type JobOfferDto } from "../types";
import { useApproveJobOffer, useIssueJobOffer, useJobOffers, useRejectJobOffer, useSubmitJobOffer } from "../hooks/useRecruitment";

type PendingAction = { kind: "submit" | "approve" | "reject" | "issue"; offer: JobOfferDto } | null;

export default function JobOffersGrid() {
  const { t } = useTranslation();
  const permissions = useRecruitmentPermissions();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pending, setPending] = useState<PendingAction>(null);
  const [rejectReason, setRejectReason] = useState("");
  const query = useJobOffers({ pageNumber: page + 1, pageSize });
  const submit = useSubmitJobOffer();
  const approve = useApproveJobOffer();
  const reject = useRejectJobOffer();
  const issue = useIssueJobOffer();
  const busy = submit.isPending || approve.isPending || reject.isPending || issue.isPending;
  const execute = async () => {
    if (!pending) return;
    try {
      if (pending.kind === "submit") await submit.mutateAsync(pending.offer.id);
      if (pending.kind === "approve") await approve.mutateAsync(pending.offer.id);
      if (pending.kind === "reject") {
        const reason = rejectReason.trim();
        if (!reason || reason.length > 1000) return;
        await reject.mutateAsync({ id: pending.offer.id, reason });
      }
      if (pending.kind === "issue") await issue.mutateAsync(pending.offer.id);
      setPending(null);
      setRejectReason("");
    } catch (error) {
      showToast.error(error, t("common.error"));
    }
  };
  const actionLabel = pending ? t(`recruitment.offers.actions.${pending.kind}`) : "";
  if (query.isLoading) return <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress aria-label={t("common.loading")} /></Box>;
  if (query.error) return <Alert severity="error">{extractErrorMessage(query.error) || t("recruitment.offers.fetchError")}</Alert>;
  const offers = query.data?.items ?? [];
  return <Stack spacing={2}>
    {offers.length === 0 ? <Alert severity="info">{t("recruitment.offers.noOffers")}</Alert> : offers.map(offer => <Card key={offer.id} variant="outlined"><CardContent><Stack spacing={1}><Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}><Typography variant="h6">{offer.offerNumber}</Typography><Chip label={t(`recruitment.offers.status.${JobOfferStatus[offer.status]}`, JobOfferStatus[offer.status])} color={offer.status === JobOfferStatus.Approved ? "success" : "default"} size="small" /></Stack><Typography variant="body2">{offer.candidateName}</Typography><Typography variant="body2" color="text.secondary">{t("recruitment.offers.annualSnapshot")}: {offer.annualSalarySnapshot.toLocaleString()} {offer.currencyCode} · {t("recruitment.offers.fiscalSnapshot")}: {offer.fiscalYearCostSnapshot.toLocaleString()} {offer.currencyCode}</Typography><Typography variant="body2" color="text.secondary">{t("recruitment.offers.reservationDelta")}: {offer.reservationDelta.toLocaleString()} {offer.currencyCode}</Typography>{offer.approvalHistory.length > 0 ? <Box component="ul" sx={{ my: 0, pl: 2 }}>{offer.approvalHistory.map(history => <li key={history.id}><Typography variant="caption">{t(`recruitment.offers.history.${history.action}`, history.action)} · {history.actorUserId} · {new Date(history.occurredOn).toLocaleString()}</Typography></li>)}</Box> : null}<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>{permissions.canManageOffers && offer.status === JobOfferStatus.Draft ? <Button size="small" onClick={() => setPending({ kind: "submit", offer })}>{t("recruitment.offers.actions.submit")}</Button> : null}{permissions.canApproveOffers && offer.status === JobOfferStatus.PendingApproval ? <><Button size="small" color="success" onClick={() => setPending({ kind: "approve", offer })}>{t("recruitment.offers.actions.approve")}</Button><Button size="small" color="warning" onClick={() => { setRejectReason(""); setPending({ kind: "reject", offer }); }}>{t("recruitment.offers.actions.reject")}</Button></> : null}{permissions.canManageOffers && offer.status === JobOfferStatus.Approved ? <Button size="small" onClick={() => setPending({ kind: "issue", offer })}>{t("recruitment.offers.actions.issue")}</Button> : null}</Stack></Stack></CardContent></Card>)}
    {query.data ? <CardViewPagination page={page} rowsPerPage={pageSize} totalItems={query.data.metaData.totalCount} itemsPerPageOptions={[5, 10, 25]} itemsLabel={t("recruitment.offers.total")} onPageChange={setPage} onRowsPerPageChange={value => { setPageSize(value); setPage(0); }} /> : null}
    <ConfirmationDialog open={pending !== null} title={actionLabel} description={t("recruitment.offers.actionDescription")} confirmLabel={actionLabel} cancelLabel={t("common.cancel")} onClose={() => { setPending(null); setRejectReason(""); }} onConfirm={() => void execute()} busy={busy}>
      {pending?.kind === "reject" ? <TextField autoFocus fullWidth required multiline minRows={3} sx={{ mt: 2 }} label={t("recruitment.offers.rejectReason")} value={rejectReason} slotProps={{ htmlInput: { maxLength: 1000 } }} onChange={event => setRejectReason(event.target.value)} error={rejectReason.length > 1000 || (pending !== null && !rejectReason.trim())} helperText={rejectReason.length > 1000 ? t("recruitment.offers.rejectReasonRequired") : " "} /> : null}
    </ConfirmationDialog>
  </Stack>;
}
