import { MyLoadingIndicator } from "@/shared/components";
import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import Home from "../features/home/home";
import { appRoutes } from "./appRoutes";

const AllKpisPage = lazy(() => import("../features/home/AllKpisPage"));
const AllTrendsPage = lazy(() => import("../features/home/AllTrendsPage"));
const AllHealthPipelinePage = lazy(() => import("../features/home/AllHealthPipelinePage"));
const AllGlobalPresencePage = lazy(() => import("../features/home/AllGlobalPresencePage"));
const AllAttendanceTrendsPage = lazy(() => import("../features/home/AllAttendanceTrendsPage"));

export const DashboardRoutes = () => (
  <>
    <Route
      path={appRoutes.home}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <Home />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.kpis}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <AllKpisPage />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.trends}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <AllTrendsPage />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.healthPipeline}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <AllHealthPipelinePage />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.globalPresence}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <AllGlobalPresencePage />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.attendanceTrends}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <AllAttendanceTrendsPage />
        </Suspense>
      }
    />
  </>
);