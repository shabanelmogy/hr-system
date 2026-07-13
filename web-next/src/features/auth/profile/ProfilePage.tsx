"use client";

import { Container, Fade, Stack } from "@mui/material";
import { useState } from "react";

import { useNotifications } from "@/shared/hooks";
import ProfileHeader from "./profile-header/ProfileHeader";
import ProfileTabs from "./profile-tabs/ProfileTabs";

const ProfilePage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [userData, setUserData] = useState({});
  const { showSuccess, showError, SnackbarComponent } = useNotifications();

  // Handle user info updates from PersonalInfo component
  const handleUserInfoUpdated = (updatedUserData: any) => {
    setUserData(updatedUserData);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Fade in={true} timeout={800}>
        <Stack spacing={1}>
          {/* Profile Header Card */}
          <ProfileHeader userData={userData} />

          {/* Tabs Section */}
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
