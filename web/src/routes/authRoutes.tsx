import { MyLoadingIndicator } from "@/shared/components";
import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import Login from "../features/auth/login/login";
import AuthLayout from "../layouts/authLayout/authLayout";
import { appRoutes } from "./appRoutes";

const ProfilePage = lazy(() => import("../features/auth/profile/profilePage"));
const ChangePassword = lazy(() =>
  import("../features/auth/profile/profileTabs/changePassword/changePassword")
);
const Register = lazy(() => import("../features/auth/register/register"));
const ResendEmailConfirmation = lazy(() =>
  import("../features/auth/resendEmailConfirmation")
);
const EmailConfirmed = lazy(() => import("../features/auth/emailConfirmed"));
const ForgetPassword = lazy(() => import("../features/auth/forgetPassword"));
const ResetPassword = lazy(() => import("../features/auth/resetPassword"));

export const AuthRoutes = () => (
  <Route element={<AuthLayout />}>
    <Route
      path={appRoutes.profile}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <ProfilePage />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.login}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <Login />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.register}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <Register />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.resendEmailConfirmation}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <ResendEmailConfirmation />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.emailConfirmed}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <EmailConfirmed />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.forgetPassword}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <ForgetPassword />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.resetPassword}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <ResetPassword />
        </Suspense>
      }
    />
    <Route
      path={appRoutes.changePassword}
      element={
        <Suspense fallback={<MyLoadingIndicator />}>
          <ChangePassword />
        </Suspense>
      }
    />
  </Route>
);