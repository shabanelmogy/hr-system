"use client";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { Box, Chip, Container, Fade, Stack, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { useSession } from "@/lib/auth/SessionContext";
import { useNotifications } from "@/shared/hooks";
import ProfileHeader from "./profile-header/ProfileHeader";
import ProfileTabs from "./profile-tabs/ProfileTabs";
import type { ProfileUserData } from "./types";

const ProfilePage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { user } = useSession();
  const { t } = useTranslation();
  const [userData, setUserData] = useState<ProfileUserData>({
    userName: user?.userName ?? "",
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    roles: user?.roles ?? [],
  });
  const { showSuccess, showError, SnackbarComponent } = useNotifications();

  const handleUserInfoUpdated = useCallback((updatedUserData: ProfileUserData) => {
    setUserData((current) => ({ ...current, ...updatedUserData }));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Fade in={true} timeout={800}>
        <Stack spacing={{ xs: 2, md: 3 }}>
          <Box component="header">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                <AccountCircleOutlinedIcon color="primary" sx={{ fontSize: { xs: 30, sm: 36 } }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography component="h1" variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                    {t("general.profile")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {t("auth.profilePageDescription")}
                  </Typography>
                </Box>
              </Stack>
              {user?.roles?.[0] && (
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={user.roles[0]}
                  sx={{ alignSelf: { xs: "flex-start", sm: "center" }, fontWeight: 600 }}
                />
              )}
            </Stack>
          </Box>

          <ProfileHeader userData={userData} />

          <ProfileTabs
            tabIndex={tabIndex}
            setTabIndex={setTabIndex}
            showSuccess={showSuccess}
            showError={showError}
            onInfoUpdated={handleUserInfoUpdated}
          />
        </Stack>
      </Fade>
      {SnackbarComponent}
    </Container>
  );
};

export default ProfilePage;
