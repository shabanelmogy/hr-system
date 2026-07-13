// const FilesGrid = lazy(() => import("@/features/fileManager/FilesGrid"));
import { appPermissions } from "@/constants";
import { MyLoadingIndicator } from "@/shared/components";
import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import RolesPage from "../features/auth/roles/rolesPage";
import ProtectedRoute from "../shared/components/auth/protectedRoute";
import { appRoutes } from "./appRoutes";

const UsersPage = lazy(() => import("@/features/auth/users/UsersPage"));
const RolePermissionsPage = lazy(() =>
  import("../features/auth/roles/components/rolePermissionsPage")
);
const TrackChangesGrid = lazy(() =>
  import("@/features/advancedTools/trackChangesGrid")
);
const LocalizationGrid = lazy(() =>
  import("@/features/advancedTools/localizationGrid")
);
const HealthCheck = lazy(() => import("@/features/advancedTools/healthCheck"));
const ApiEndpoints = lazy(() =>
  import("@/features/advancedTools/apiEndpoints")
);
const HangfireDashboard = lazy(() =>
  import("@/features/advancedTools/hangfireDashboard")
);
const FilesGrid = lazy(() => import("@/features/fileManager/FilesGrid"));
const MediaViewer = lazy(() => import("@/features/fileManager/mediaViewer/MediaViewer"));
const AppointmentsPage = lazy(() => import("@/features/appointments/pages/AppointmentsPage"));

export const ExtrasRoutes = () => (
  <>
    {/* Roles Management */}
    <Route
      path={appRoutes.auth.rolesPage}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <RolesPage />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.auth.rolePermissionsPage}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <RolePermissionsPage />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.auth.usersPage}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <UsersPage />
        </Suspense>
      }
    />

    {/* Advanced Tools */}
    <Route
      path={appRoutes.advancedTools.trackChanges}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <TrackChangesGrid />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.advancedTools.localizationApi}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <LocalizationGrid />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.advancedTools.healthCheck}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <HealthCheck />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.advancedTools.apiEndpoints}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <ApiEndpoints />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.advancedTools.hangfireDashboard}
      element={
        <ProtectedRoute>
          <Suspense fallback={<MyLoadingIndicator />}>
            <HangfireDashboard />
          </Suspense>
        </ProtectedRoute>
      }
    />

    {/* File Manager */}
    <Route
      path={appRoutes.extras.filesManager}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <FilesGrid />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.extras.mediaViewer}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <MediaViewer />
          </Suspense>
        </ProtectedRoute>
      }
    />

    {/* Appointments */}
    <Route
      path={appRoutes.extras.appointments}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <AppointmentsPage />
          </Suspense>
        </ProtectedRoute>
      }
    />
  </>
);