import { appRoutes } from "./appRoutes";
import { appPermissions } from "@/constants";
import { MyLoadingIndicator } from "@/shared/components";
import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";

const ProtectedRoute = lazy(() =>
  import("../shared/components/auth/protectedRoute")
);
const HRMainDashboard = lazy(() =>
  import("@/features/analytics/components/HRMainDashboard")
);
const PerformanceAnalytics = lazy(() =>
  import("@/features/analytics/components/PerformanceAnalytics")
);
const TimeAttendanceAnalytics = lazy(() =>
  import("@/features/analytics/components/TimeAttendanceAnalytics")
);
const EmployeeEngagementDashboard = lazy(() =>
  import("@/features/analytics/components/EmployeeEngagementDashboard")
);
const DocumentAnalytics = lazy(() =>
  import("@/features/analytics/components/DocumentAnalytics")
);
const CustomReportBuilder = lazy(() =>
  import("@/features/analytics/components/CustomReportBuilder")
);
const ReportViewer = lazy(() =>
  import("@/features/analytics/components/ReportViewer")
);
const DataExportTools = lazy(() =>
  import("@/features/analytics/components/DataExportTools")
);
// dd
export const AnalyticsRoutes = () => (
  <>
    <Route
      path={appRoutes.analytics.mainDashboard}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <HRMainDashboard />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.analytics.performanceAnalytics}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <PerformanceAnalytics />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.analytics.timeAttendanceAnalytics}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <TimeAttendanceAnalytics />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.analytics.employeeEngagement}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <EmployeeEngagementDashboard />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.analytics.documentAnalytics}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <DocumentAnalytics />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.analytics.customReports}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <CustomReportBuilder />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.analytics.reportViewer}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <ReportViewer />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.analytics.dataExport}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <DataExportTools />
          </Suspense>
        </ProtectedRoute>
      }
    />
  </>
);