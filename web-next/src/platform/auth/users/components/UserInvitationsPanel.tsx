import { Add, DeleteOutlined, Refresh } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import type { Translator, UserInvitation } from "../../types";

interface UserInvitationsPanelProps {
  invitations: UserInvitation[];
  loading: boolean;
  canResend: boolean;
  canRevoke: boolean;
  canCreate: boolean;
  onCreate: () => void;
  onResend: (id: string) => void;
  onRevoke: (id: string) => void;
  t: Translator;
}

const UserInvitationsPanel = ({
  invitations,
  loading,
  canResend,
  canRevoke,
  canCreate,
  onCreate,
  onResend,
  onRevoke,
  t,
}: UserInvitationsPanelProps) => {
  const actionableInvitations = invitations.filter(
    (invitation) => invitation.status === "pending" || invitation.status === "expired",
  );

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <Typography variant="h6">{t("users.pendingInvitations")}</Typography>
          {canCreate ? (
            <Button variant="contained" startIcon={<Add />} disabled={loading} onClick={onCreate}>
              {t("users.sendInvitation")}
            </Button>
          ) : null}
        </Box>
        {actionableInvitations.length === 0 ? (
          <Typography color="text.secondary">{t("users.noPendingInvitations")}</Typography>
        ) : (
          <Stack spacing={1.5}>
            {actionableInvitations.map((invitation) => (
              <Box
                key={invitation.id}
                sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", py: 1 }}
              >
                <Box sx={{ flex: "1 1 250px" }}>
                  <Typography sx={{ fontWeight: 600 }}>{invitation.firstName} {invitation.lastName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invitation.email} · {t("users.expiresOn", { date: new Date(invitation.expiresOn).toLocaleString() })}
                  </Typography>
                </Box>
                <Chip
                  label={t(invitation.status === "expired"
                    ? "users.invitationExpired"
                    : "users.invitationPending")}
                  size="small"
                  color={invitation.status === "expired" ? "error" : "warning"}
                />
                {canResend || canRevoke ? (
                  <Stack direction="row" spacing={1}>
                    {canResend ? (
                      <Button size="small" startIcon={<Refresh />} disabled={loading} onClick={() => onResend(invitation.id)}>
                        {t("users.resendInvitation")}
                      </Button>
                    ) : null}
                    {canRevoke ? (
                      <Button size="small" color="error" startIcon={<DeleteOutlined />} disabled={loading} onClick={() => onRevoke(invitation.id)}>
                        {t("users.revokeInvitation")}
                      </Button>
                    ) : null}
                  </Stack>
                ) : null}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default UserInvitationsPanel;
