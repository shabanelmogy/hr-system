import { MyLoadingIndicator } from "@/shared/components/common/loaders/myLoadingIndicator";
import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/mainLayout/mainLayout";
import { AnalyticsRoutes } from "./analyticsRoutes";
import { appRoutes } from "./appRoutes";
import { AuthRoutes } from "./authRoutes";
import { BasicDataRoutes } from "./basicDataRoutes";
import { CommunicationRoutes } from "./communicationRoutes";
import { DashboardRoutes } from "./dashboardRoutes";
import { ExtrasRoutes } from "./extrasRoutes";

const ProtectedRoute = lazy(() =>
  import("../shared/components/auth/protectedRoute")
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<MyLoadingIndicator />}>
      <Routes>
        {/* Authentication Routes */}
        {AuthRoutes()}

        {/* Protected Main App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Dashboard Routes */}
            {DashboardRoutes()}

            {/* Basic Data Routes */}
            {BasicDataRoutes()}

            {/* Analytics Routes */}
            {AnalyticsRoutes()}

            {/* Extras Routes */}
            {ExtrasRoutes()}

            {/* Communication Routes */}
            {CommunicationRoutes()}

            {/* Redirect unmatched routes to home */}
            <Route
              path="*"
              element={<Navigate to={appRoutes.home} replace />}
            />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
