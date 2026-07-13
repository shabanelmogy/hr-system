import { appRoutes } from "./appRoutes";
import { appPermissions } from "@/constants";
import { MyLoadingIndicator } from "@/shared/components";
import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";

const ProtectedRoute = lazy(() =>
  import("../shared/components/auth/protectedRoute")
);
const MessagingSystem = lazy(() =>
  import("@/features/communication").then((m) => ({
    default: m.MessagingSystem,
  }))
);
const AnnouncementCenter = lazy(() =>
  import("@/features/communication").then((m) => ({
    default: m.AnnouncementCenter,
  }))
);
const FeedbackCollection = lazy(() =>
  import("@/features/communication").then((m) => ({
    default: m.FeedbackCollection,
  }))
);
const CommunicationDashboard = lazy(() =>
  import("@/features/communication").then((m) => ({
    default: m.CommunicationDashboard,
  }))
);
const NotificationSystem = lazy(() =>
  import("@/features/communication").then((m) => ({
    default: m.NotificationSystem,
  }))
);
const CommunicationReports = lazy(() =>
  import("@/features/communication").then((m) => ({
    default: m.CommunicationReports,
  }))
);
const DocumentManagementPage = lazy(() =>
  import("../features/employee").then((m) => ({
    default: m.DocumentManagementPage,
  }))
);
const KanbanBoards = lazy(() =>
  import("@/features/kanban").then((m) => ({ default: m.KanbanBoards }))
);
const KanbanBoardView = lazy(() =>
  import("@/features/kanban").then((m) => ({ default: m.KanbanBoardView }))
);

export const CommunicationRoutes = () => (
  <>
    {/* Communication Routes */}
    <Route
      path={appRoutes.communication.messaging}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <MessagingSystem userId="current-user" />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.communication.announcements}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <AnnouncementCenter userId="current-user" />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.communication.feedback}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <FeedbackCollection userId="current-user" />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.communication.dashboard}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <CommunicationDashboard userId="current-user" />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.communication.notifications}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <NotificationSystem userId="current-user" />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.communication.reports}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <CommunicationReports userId="current-user" />
          </Suspense>
        </ProtectedRoute>
      }
    />

    {/* Document Management Routes */}
    <Route
      path={appRoutes.documents.overview}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <DocumentManagementPage />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.documents.employeeDocuments}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <DocumentManagementPage />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.documents.companyDocuments}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <DocumentManagementPage />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.documents.templates}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <DocumentManagementPage />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.documents.archives}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <DocumentManagementPage />
          </Suspense>
        </ProtectedRoute>
      }
    />

    {/* Kanban Routes */}
    <Route
      path={appRoutes.kanban.boards}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <KanbanBoards />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.kanban.boardView}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <KanbanBoardView />
          </Suspense>
        </ProtectedRoute>
      }
    />
  </>
);