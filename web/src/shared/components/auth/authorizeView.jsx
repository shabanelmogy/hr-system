/* eslint-disable react/prop-types */
import { jwtDecode } from "jwt-decode";

const AuthorizeView = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
}) => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    // If the user is not authenticated, hide the content
    return null;
  }

  let userRole = [];
  let userPermissions = [];

  try {
    const decodedToken = jwtDecode(token);

    // Extract the role and permissions from the token
    userRole =
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] || [];

    userPermissions = decodedToken["Permissions"] || [];
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }

  // Check if role allowed or not role needed
  const hasRole =
    !allowedRoles.length ||
    allowedRoles.some((role) => userRole.includes(role));

  // Check if permission allowed or not permission needed
  const hasPermissions =
    !requiredPermissions.length ||
    requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

  // If the user meets the role and permission requirements, render children
  if (hasRole && hasPermissions) {
    return children;
  }

  // Otherwise, hide the content
  return null;
};

export default AuthorizeView;
