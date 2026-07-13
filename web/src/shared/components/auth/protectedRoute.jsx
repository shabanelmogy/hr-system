/* eslint-disable react/prop-types */
import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({
  allowedRoles = [],
  requiredPermissions = [],
  children = null,
}) => {
  const location = useLocation();
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (location.pathname === "/logout") {
    return children || <Outlet />;
  }

  // Decode the token to get user role and permissions
  let userRole = [];
  let userPermissions = [];

  try {
    const decodedToken = jwtDecode(token);

    // Handle both single role and array of roles
    const rolesClaim =
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];
    userRole = Array.isArray(rolesClaim)
      ? rolesClaim
      : rolesClaim
      ? [rolesClaim]
      : [];

    // Handle both single permission and array of permissions
    const permissionsClaim = decodedToken["Permissions"];
    userPermissions = Array.isArray(permissionsClaim)
      ? permissionsClaim
      : permissionsClaim
      ? [permissionsClaim]
      : [];
  } catch {
    sessionStorage.removeItem("token"); // Clear invalid token
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRole =
    !allowedRoles.length ||
    allowedRoles.some((role) => userRole.includes(role));

  const hasPermissions =
    !requiredPermissions.length ||
    requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

  if (hasRole && hasPermissions) {
    return children || <Outlet />;
  } else {
    console.error("Access Denied: Unauthorized role or permissions");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
