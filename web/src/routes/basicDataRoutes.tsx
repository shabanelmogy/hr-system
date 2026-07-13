import { appPermissions } from "@/constants";
import { MyLoadingIndicator } from "@/shared/components";
import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../shared/components/auth/protectedRoute";
import { appRoutes } from "./appRoutes";

const CountriesPage = lazy(() =>
  import("../features/basicData/countries/countriesPage")
);
const StatesPage = lazy(() =>
  import("../features/basicData/states").then((m) => ({
    default: m.StatesPage,
  }))
);
const DistrictsPage = lazy(() =>
  import("../features/basicData/districts/districtsPage")
);
const AddressTypesPage = lazy(() =>
  import("../features/basicData/addressesType/addressTypesPage")
);
const EmployeePage = lazy(() =>
  import("../features/employee/components/EmployeePage")
);
const EmployeeDetailPage = lazy(() =>
  import("../features/employee/components/EmployeeDetailPage")
);
const EmployeeForm = lazy(() =>
  import("../features/employee/components/EmployeeForm")
);
const DocumentManagementPage = lazy(() =>
  import("../features/employee/components/documents/DocumentManagementPage")
);
const CountryReport = lazy(() =>
  import("@/features/basicData/countries/reports/CountryReport")
);

export const BasicDataRoutes = () => (
  <>
    <Route
      path={appRoutes.basicData.countries}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewCountries]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <CountriesPage />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.countryReport}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewCountries]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <CountryReport />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.basicData.states}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewStates]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <StatesPage />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.basicData.addressTypes}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewAddressTypes]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <AddressTypesPage />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.basicData.districts}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewStates]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <DistrictsPage />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.basicData.employees}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <EmployeePage />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.basicData.employeeDetail}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <EmployeeDetailPage />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.basicData.employeeEdit}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.ViewCountries]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <EmployeeForm mode="edit" />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.basicData.employeeCreate}
      element={
        <ProtectedRoute
          requiredPermissions={[appPermissions.CreateUsers]}
        >
          <Suspense fallback={<MyLoadingIndicator />}>
            <EmployeeForm mode="create" />
          </Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path={appRoutes.basicData.employeeDocuments}
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
  </>
);