# Authentication Flow Review — HrManagementSystem

**Date:** January 2025  
**Frontend:** Next.js (App Router) - `web-next/`  
**Backend:** ASP.NET Core Web API - `api/HrManagementSystem/`

---

## 📋 Overview

The HrManagementSystem uses a **JWT + Refresh Token** authentication architecture with:
- **Access tokens** (short-lived, ~15-60 minutes)
- **Refresh tokens** (long-lived, 14 days)
- **HttpOnly cookies** for token storage (secure, not accessible via JavaScript)
- **Server-side session validation** via Next.js middleware
- **Automatic token refresh** without user interruption
- **Session revocation** support (logout, password reset, admin revoke)

---

## 🔑 Key Components

### Frontend (web-next)

| Component | Path | Purpose |
|-----------|------|---------|
| **Middleware** | `src/proxy.ts` | Intercepts all requests, validates/refreshes tokens |
| **Session Context** | `src/lib/auth/session-context.tsx` | Client-side session state (React Context) |
| **Backend Session** | `src/lib/auth/backend-session.ts` | Server-side token validation & refresh logic |
| **Cookies** | `src/lib/auth/cookies.ts` | Cookie management (set/clear auth tokens) |
| **Session API Route** | `src/app/api/auth/session/route.ts` | Client-facing session endpoint |
| **Login Form Hook** | `src/features/auth/login/hooks/useLoginForm.ts` | Login form logic & submission |
| **API Client** | `src/lib/api/client.ts` | Axios wrapper with interceptors |

### Backend (api/HrManagementSystem)

| Component | Path | Purpose |
|-----------|------|---------|
| **Auth Controller** | `Features/Security/Authentication/Controllers/V1/AuthController.cs` | REST endpoints (login, refresh, session, etc.) |
| **Auth Service** | `Features/Security/Authentication/Services/AuthService.cs` | Business logic (user validation, token issuance) |
| **JWT Provider** | `Infrastructure/Security/Authentication/JwtProvider.cs` | JWT generation & validation |
| **Refresh Token Protector** | (inferred) | Hashing, rotation, replay detection for refresh tokens |

---

## 🔐 Authentication Flow

### 1️⃣ Login Flow

```
┌─────────┐                  ┌──────────┐                  ┌────────┐
│ Browser │                  │ web-next │                  │   API  │
└────┬────┘                  └─────┬────┘                  └───┬────┘
     │                              │                           │
     │ 1. Submit credentials        │                           │
     ├─────────────────────────────>│                           │
     │                              │                           │
     │                              │ 2. POST /api/v1/auth/login│
     │                              ├──────────────────────────>│
     │                              │   { username, password }  │
     │                              │                           │
     │                              │                           │ 3. Validate user
     │                              │                           │    (UserManager)
     │                              │                           │
     │                              │                           │ 4. Generate JWT access token
     │                              │                           │    (claims: userId, roles, permissions, exp)
     │                              │                           │
     │                              │                           │ 5. Create refresh token
     │                              │                           │    - sessionId (new GUID)
     │                              │                           │    - hash stored in DB
     │                              │                           │    - plain token returned
     │                              │                           │
     │                              │ 6. AuthResponse           │
     │                              │<──────────────────────────┤
     │                              │   { token, refreshToken,  │
     │                              │     tokenExpiration, ...  │
     │                              │     isAuthenticated: true }│
     │                              │                           │
     │                              │ 7. Set HttpOnly cookies:  │
     │                              │    - access_token         │
     │                              │    - refresh_token        │
     │                              │                           │
     │ 8. Redirect to /             │                           │
     │<─────────────────────────────┤                           │
     │                              │                           │
```

**Frontend code (login hook):**
```typescript
const data = await apiService.post(apiRoutes.auth.login, credentials);
if (data?.isAuthenticated) {
  await refresh(); // refresh session context
  router.replace(getSafeReturnTo()); // redirect to original URL or home
}
```

**Backend code (AuthService.GetTokenAsync):**
```csharp
var user = await _userManager.FindByNameAsync(userName);
var signInResult = await _signInManager.PasswordSignInAsync(user, password, ...);
// Generate tokens
var accessToken = await _jwtProvider.GenerateAccessTokenAsync(user, sessionId);
var refreshToken = RefreshTokenProtector.Issue(...);
user.RefreshTokens.Add(refreshToken.Token);
await _userManager.UpdateAsync(user);
return new AuthResponse(/* ... */, accessToken.Token, refreshToken.RawToken, ...);
```

---

### 2️⃣ Request Authentication (Middleware)

Every non-API request passes through `proxy.ts` middleware:

```
┌─────────┐                  ┌──────────────┐              ┌────────┐
│ Browser │                  │   Middleware │              │   API  │
└────┬────┘                  └──────┬───────┘              └───┬────┘
     │                              │                           │
     │ 1. GET /dashboard            │                           │
     ├─────────────────────────────>│                           │
     │                              │                           │
     │                              │ 2. Read cookies:          │
     │                              │    - access_token         │
     │                              │    - refresh_token        │
     │                              │                           │
     │                              │ 3. resolveSession()       │
     │                              │                           │
     │                              │ 4. POST /api/v1/auth/session
     │                              ├──────────────────────────>│
     │                              │   Authorization: Bearer {token}
     │                              │                           │
     │                              │ 5. Validate JWT           │
     │                              │    - signature check      │
     │                              │    - expiration check     │
     │                              │                           │
     │                              │ 6a. If valid:             │
     │                              │<──────────────────────────┤
     │                              │    SessionResponse        │
     │                              │    { userId, roles,       │
     │                              │      permissions, exp }   │
     │                              │                           │
     │ 7. Allow request             │                           │
     │<─────────────────────────────┤                           │
     │                              │                           │
     │                              │ 6b. If token expired:     │
     │                              │    → Attempt refresh      │
     │                              │      (see Refresh Flow)   │
```

**Middleware code (proxy.ts):**
```typescript
const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
const resolved = await resolveSession(accessToken, refreshToken);

if (resolved.status === "unauthenticated") {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("returnTo", pathname);
  return NextResponse.redirect(loginUrl);
}

// Continue to protected route
return NextResponse.next();
```

---

### 3️⃣ Token Refresh Flow (Automatic)

When the access token expires, the middleware automatically refreshes it:

```
┌──────────────┐                  ┌────────┐
│   Middleware │                  │   API  │
└──────┬───────┘                  └───┬────┘
       │                              │
       │ 1. Access token expired      │
       │                              │
       │ 2. POST /api/v1/auth/refreshToken
       ├─────────────────────────────>│
       │   { token (expired),          │
       │     refreshToken }            │
       │                              │
       │                              │ 3. Validate refresh token:
       │                              │    - hash matches DB entry
       │                              │    - sessionId + jwtId match
       │                              │    - not revoked
       │                              │    - not expired (14 days)
       │                              │
       │                              │ 4. Generate new access token
       │                              │    (same sessionId)
       │                              │
       │                              │ 5. Rotate refresh token:
       │                              │    - revoke old token
       │                              │    - issue new token
       │                              │    - link to same sessionId
       │                              │
       │ 6. New AuthResponse          │
       │<─────────────────────────────┤
       │   { token (new), refreshToken (new) }
       │                              │
       │ 7. Update cookies            │
       │                              │
       │ 8. Continue original request │
```

**Frontend code (backend-session.ts):**
```typescript
async function resolveSession(accessToken, refreshToken) {
  const currentSession = await fetchVerifiedSession(accessToken);
  if (currentSession.status === "authenticated") return currentSession;
  
  // Token expired → refresh
  const refreshResult = await refreshAuthTokens(accessToken, refreshToken);
  if (refreshResult.status === "refreshed") {
    return { 
      status: "authenticated", 
      session: newSession, 
      authPayload: refreshResult.payload // new tokens
    };
  }
}
```

**Backend code (AuthService.GetRefreshTokenAsync):**
```csharp
var validatedAccessToken = _jwtProvider.ValidateExpiredAccessToken(request.Token);
var user = await FindUserWithTokensAsync(validatedAccessToken.UserId, ...);
var tokenHash = RefreshTokenProtector.Hash(request.RefreshToken);
var storedToken = user.RefreshTokens.Single(t => t.TokenHash == tokenHash);

// Security checks: session match, not revoked, not expired
if (!claimsMatchSession || storedToken.RevokedOn != null) {
  RevokeSessionFamily(user, storedToken.SessionId, "Replay detected");
  return Failure(InvalidRefreshToken);
}

// Issue new tokens
var accessToken = await _jwtProvider.GenerateAccessTokenAsync(user, storedToken.SessionId);
var replacement = RefreshTokenProtector.Rotate(storedToken, accessToken.JwtId, ...);
user.RefreshTokens.Add(replacement.Token);
await _userManager.UpdateAsync(user);
```

---

### 4️⃣ Client-Side Session Access

React components use `SessionContext` to access user data:

```typescript
// In any component:
const { user, isLoading, hasPermission, hasRole } = useSession();

if (isLoading) return <Skeleton />;
if (!user) return <Navigate to="/login" />;

return <div>Welcome, {user.firstName}!</div>;
```

**How it works:**
1. `SessionProvider` wraps the app (in `app/providers.tsx`)
2. On mount, calls `fetch("/api/auth/session")` (Next.js API route)
3. API route calls `resolveSession()` (same middleware logic)
4. Returns `{ isAuthenticated: true, user: {...} }`
5. Context stores user data → components access via `useSession()`

---

## 🔒 Security Features

### 1. HttpOnly Cookies
- Tokens stored in cookies with `httpOnly: true`, `secure: true`, `sameSite: "lax"`
- **Not accessible** via JavaScript → protects against XSS attacks
- Automatically sent with every request to the same domain

### 2. Refresh Token Rotation
- Every refresh operation **revokes the old refresh token** and issues a new one
- Prevents token reuse (if an attacker steals a token, it's only valid once)
- **Replay detection:** If a revoked token is used, the entire session family is revoked

**Backend code:**
```csharp
var replacement = RefreshTokenProtector.Rotate(storedToken, ...);
storedToken.Revoke("Rotated"); // old token invalidated
user.RefreshTokens.Add(replacement.Token); // new token added
```

### 3. Session Revocation
Sessions can be revoked by:
- **User logout** → revokes current session
- **Password reset** → revokes **all** sessions
- **Admin action** → `RevokeRefreshTokenByUserId` (requires `EditUsers` permission)
- **Replay detection** → automatic revocation

**SignalR notification:**
```csharp
await _companyHubContext.Clients.User(userId)
  .ReceiveTokenRevoked("Your session was revoked because token reuse was detected.");
```

### 4. Token Expiry Limits
- **Access token:** Short-lived (15-60 minutes, configurable in `appsettings.json`)
- **Refresh token:** 14 days
- **Revoked token retention:** 30 days (then pruned from DB)

### 5. Concurrent Request Deduplication
The refresh logic uses an in-memory cache to prevent multiple simultaneous requests from triggering duplicate refresh calls:

**Frontend code (backend-session.ts):**
```typescript
const refreshRequests = new Map<string, Promise<RefreshResult>>();

function refreshAuthTokens(accessToken, refreshToken) {
  const key = createHash("sha256").update(refreshToken).digest("hex").slice(0, 12);
  const existingRequest = refreshRequests.get(key);
  if (existingRequest) {
    console.log("♻️ Reusing in-flight refresh request");
    return existingRequest;
  }
  // ... make new request, cache it
}
```

### 6. Permission-Based Authorization
- **Role-based:** User has roles (`Admin`, `Manager`, `User`)
- **Permission-based:** Fine-grained permissions (`Countries:View`, `Users:Edit`, etc.)
- **Enforced on backend:** `[HasPermission(Permissions.ViewCountries)]` attribute
- **Checked on frontend:** `usePermissions()` hook for UI elements

---

## 🚀 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/login` | ❌ Anonymous | Login with username/password |
| POST | `/api/v1/auth/register` | ❌ Anonymous | Register new user |
| POST | `/api/v1/auth/refreshToken` | ❌ Anonymous | Refresh access token |
| POST | `/api/v1/auth/logout` | ❌ Anonymous | Revoke refresh token |
| GET | `/api/v1/auth/session` | ✅ Authorized | Get current session claims |
| GET | `/api/v1/auth/realtimeToken` | ✅ Authorized | Get SignalR connection token |
| PUT | `/api/v1/auth/revokeRefreshTokenByUserId` | ✅ `EditUsers` | Admin revoke user sessions |
| POST | `/api/v1/auth/confirmEmail` | ❌ Anonymous | Confirm email with token |
| POST | `/api/v1/auth/resendConfirmationEmail` | ❌ Anonymous | Resend confirmation email |
| POST | `/api/v1/auth/forgetPassword` | ❌ Anonymous | Request password reset code |
| POST | `/api/v1/auth/resetPassword` | ❌ Anonymous | Reset password with code |

---

## 📊 Database Schema (Refresh Tokens)

**Entity:** `RefreshToken` (part of `ApplicationUser.RefreshTokens`)

| Column | Type | Description |
|--------|------|-------------|
| `Id` | string (GUID) | Primary key |
| `TokenHash` | string | SHA256 hash of the plain token |
| `SessionId` | string (GUID) | Groups tokens from same login |
| `JwtId` | string (GUID) | Links to specific access token (from `jti` claim) |
| `ExpiresOn` | DateTime | Expiration timestamp (14 days) |
| `CreatedOn` | DateTime | Creation timestamp |
| `RevokedOn` | DateTime? | Revocation timestamp (null = active) |
| `ReasonRevoked` | string? | Why revoked ("Rotated", "Replay detected", etc.) |
| `ReplacedByTokenId` | string? | New token ID after rotation |
| `IpAddress` | string? | Client IP at creation |
| `UserAgent` | string? | Client user agent |

**Security notes:**
- Plain token **never stored** — only the hash
- Replay detection compares `sessionId` + `jwtId` claims with stored values
- Entire session family revoked if replay detected

---

## 🛠️ Configuration

### Backend (appsettings.json)

```json
{
  "Jwt": {
    "Key": "your-secret-key-here-at-least-256-bits",
    "Issuer": "HrManagementSystemAPI",
    "Audience": "HrManagementSystemUsers",
    "ExpiryMinutes": 60
  }
}
```

### Frontend (environment variables)

```env
NEXT_PUBLIC_API_URL=https://api.example.com
BACKEND_URL=https://api.example.com  # server-side only
```

**Cookie names (constants.ts):**
```typescript
export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const PUBLIC_ROUTES = ["/login", "/register", "/forget-password"];
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "User not authenticated" loop
**Symptom:** User logs in successfully but immediately redirected back to login

**Cause:** Cookies not being set (wrong domain, SameSite attribute, HTTPS mismatch)

**Solution:**
- Check cookie settings in `cookies.ts`: `secure: true` requires HTTPS in production
- Verify `sameSite: "lax"` allows cross-page navigation
- Ensure backend and frontend on same root domain (or use `sameSite: "none"` for cross-domain)

### Issue 2: Token refresh fails silently
**Symptom:** User logged out after ~1 hour (access token expires)

**Cause:** Refresh token expired or revoked, or refresh endpoint failing

**Solution:**
- Check backend logs for refresh endpoint errors
- Verify refresh token not revoked in database (`RevokedOn` should be null)
- Ensure `RefreshTokenLifetimeDays` in backend is 14 days (not too short)

### Issue 3: Session claims mismatch after password change
**Symptom:** User can't access features after password reset

**Cause:** Old JWT still valid (hasn't expired yet), but user's `SecurityStamp` changed

**Solution:** Password reset should revoke all sessions:
```csharp
RevokeAllSessions(user, "Password was reset");
await NotifySessionRevokedAsync(user.Id, "Please sign in again.");
```

### Issue 4: Middleware not triggering
**Symptom:** Protected routes accessible without login

**Cause:** Middleware matcher config not covering the route

**Solution:** Check `proxy.ts` matcher:
```typescript
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
```

---

## 🧪 Testing Checklist

- [ ] **Login** with valid credentials → redirects to home
- [ ] **Login** with invalid credentials → shows error
- [ ] **Login** with disabled account → shows "account disabled" error
- [ ] **Access protected route** without login → redirects to login with `returnTo`
- [ ] **Access protected route** with valid token → allows access
- [ ] **Wait for token expiry** → auto-refreshes without logout
- [ ] **Logout** → clears cookies, redirects to login
- [ ] **Password reset** → revokes all sessions, forces re-login
- [ ] **Admin revoke** → user receives SignalR notification, forced logout
- [ ] **Concurrent requests** → only one refresh call triggered
- [ ] **Token replay** → entire session family revoked
- [ ] **Permissions** → UI elements hidden, API calls blocked without permission

---

## 📚 References

### Frontend Files
- `web-next/src/proxy.ts` — Middleware entry point
- `web-next/src/lib/auth/backend-session.ts` — Token validation & refresh
- `web-next/src/lib/auth/cookies.ts` — Cookie management
- `web-next/src/lib/auth/session-context.tsx` — React session state
- `web-next/src/lib/auth/constants.ts` — Cookie names, public routes
- `web-next/src/lib/api/client.ts` — Axios interceptors
- `web-next/src/app/api/auth/session/route.ts` — Session API route
- `web-next/src/features/auth/login/hooks/useLoginForm.ts` — Login logic

### Backend Files
- `api/HrManagementSystem/Features/Security/Authentication/Controllers/V1/AuthController.cs`
- `api/HrManagementSystem/Features/Security/Authentication/Services/AuthService.cs`
- `api/HrManagementSystem/Infrastructure/Security/Authentication/JwtProvider.cs`
- `api/HrManagementSystem/Features/Security/Authentication/Contracts/AuthResponse.cs`
- `api/HrManagementSystem/Features/Security/Authentication/Contracts/LoginRequest.cs`

---

## ✅ Architecture Strengths

1. **Secure by default:** HttpOnly cookies, refresh token rotation, replay detection
2. **Zero interruption:** Automatic token refresh happens transparently
3. **Fine-grained authorization:** Role + permission-based access control
4. **Scalable:** Stateless JWT (no server-side session storage)
5. **Real-time updates:** SignalR notifications for session revocation
6. **Audit trail:** User login/logout tracking in database

---

## 🔧 Potential Improvements

1. **Rate limiting:** Add throttling on login/refresh endpoints to prevent brute force
2. **Device tracking:** Show "Active Sessions" page (like Google/GitHub) with device info
3. **2FA support:** Add optional two-factor authentication (TOTP, SMS)
4. **Remember me:** Extend refresh token lifetime for "remember me" checkbox
5. **Token blacklist:** For instant token revocation (currently relies on refresh token revocation)
6. **Logging:** Add structured logging (Serilog) for auth events (login, refresh, revoke)

---

## 🐛 Bug Fix: Logout Not Redirecting to Login

### Issue
Users remained on the home page after clicking logout instead of being redirected to the login page.

### Root Cause
**Race condition:** The logout function was using a "fire-and-forget" pattern for the logout API call, then immediately redirecting. The middleware still saw valid cookies because they hadn't been cleared yet.

**Before (Broken Flow):**
```
User clicks logout → Fire logout API (don't wait) → Immediate redirect to /login
→ Middleware checks cookies → Cookies still exist! → Redirect back to home
```

### Solution Applied

**Three key changes:**

1. **Wait for Cookie Clearance** (`lib/api/client.ts`)
   ```typescript
   // Changed from fire-and-forget to await
   await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
   ```

2. **Prevent Response Caching** (`app/api/auth/logout/route.ts`)
   ```typescript
   response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
   response.headers.set("Pragma", "no-cache");
   response.headers.set("Expires", "0");
   ```

3. **Clear Session State** (`lib/auth/session-context.tsx`)
   ```typescript
   const logout = useCallback(() => setUser(null), []);
   ```

**After (Fixed Flow):**
```
User clicks logout → Call logout API and WAIT → Cookies cleared → Clear sessionStorage
→ Redirect to /login → Middleware checks cookies → No cookies → Stay on login page ✅
```

### Files Modified
- ✅ `web-next/src/lib/api/client.ts` — Await logout completion before redirect
- ✅ `web-next/src/app/api/auth/logout/route.ts` — Add cache-control headers
- ✅ `web-next/src/lib/auth/session-context.tsx` — Add logout method to clear state

### Testing Checklist
- [x] Click logout → redirected to `/login` immediately
- [x] Cookies cleared in DevTools (access_token + refresh_token)
- [x] Cannot access protected routes after logout
- [x] sessionStorage cleared
- [x] Works with slow network (network throttling test)

**Status:** ✅ Fixed (January 2025)

---

**End of Review**
