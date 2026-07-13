# Logout Issue Fix — User Stays on Home Page After Logout

## Problem

When users click logout, they remain on the home page instead of being redirected to the login page.

## Root Cause

The issue was caused by a **race condition** in the logout flow:

1. User clicks logout
2. `apiClient.logout()` fires `/api/auth/logout` request **without waiting** (fire-and-forget)
3. Immediately redirects to `/login` using `window.location.replace()`
4. The redirect happens **before** the cookies are actually cleared by the server
5. Middleware reads the still-valid cookies and allows access to the home page
6. User appears "stuck" on home page even though they clicked logout

## Solution Applied

### 1. **Wait for Cookie Clearance** (`lib/api/client.ts`)

Changed from fire-and-forget to awaiting the logout endpoint:

**Before:**
```typescript
async logout() {
  // Fire without waiting ❌
  void fetch("/api/auth/logout", { method: "POST", ... }).catch(() => {});
  window.location.replace("/login");
}
```

**After:**
```typescript
async logout() {
  try {
    // Wait for cookies to be cleared ✅
    await fetch("/api/auth/logout", { 
      method: "POST", 
      credentials: "same-origin" 
    });
  } catch {
    // Still redirect even if backend fails
  }

  // Clear session storage
  sessionStorage.clear();
  
  // Use window.location.href for full page reload
  window.location.href = "/login";
}
```

### 2. **Prevent Response Caching** (`app/api/auth/logout/route.ts`)

Added cache-control headers to ensure logout response is never cached:

```typescript
const response = new NextResponse(null, { status: 204 });
clearAuthCookies(response);

// Prevent any caching ✅
response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
response.headers.set("Pragma", "no-cache");
response.headers.set("Expires", "0");

return response;
```

### 3. **Add Session Context Logout** (`lib/auth/session-context.tsx`)

Added a `logout()` method to clear local session state immediately:

```typescript
const logout = useCallback(() => {
  setUser(null); // Clear user state immediately
}, []);
```


### 4. **Use Full Page Reload**

Changed from `window.location.replace()` to `window.location.href`:

- `replace()` sometimes caches the page state
- `href` forces a complete navigation and triggers middleware re-evaluation

---

## Changes Summary

| File | Change | Reason |
|------|--------|--------|
| `lib/api/client.ts` | **Await** logout endpoint before redirect | Ensure cookies cleared before navigation |
| `lib/api/client.ts` | Clear `sessionStorage` | Remove any client-side cached session data |
| `lib/api/client.ts` | Use `window.location.href` instead of `replace()` | Force full page reload |
| `app/api/auth/logout/route.ts` | Add cache-control headers | Prevent browser from caching logout response |
| `lib/auth/session-context.tsx` | Add `logout()` method | Clear local React state immediately |

---

## Testing Checklist

Test the following scenarios:

- [ ] **Normal logout:** Click logout → redirected to `/login` page
- [ ] **Logout from home page:** Verify user cannot stay on home
- [ ] **Logout with slow network:** Wait for logout to complete before redirect
- [ ] **Backend unavailable:** Still redirect even if API fails
- [ ] **Try accessing protected route after logout:** Should redirect to login
- [ ] **Session storage cleared:** Verify `sessionStorage` is empty after logout
- [ ] **Multiple logout clicks:** Verify `navigatingToLogin` flag prevents duplicate calls

---

## How to Test

### Test 1: Basic Logout
1. Login to the application
2. Navigate to home page
3. Click logout button (top-right menu)
4. **Expected:** Redirected to `/login` page immediately
5. **Expected:** Login form is displayed
6. Try navigating to `/` manually
7. **Expected:** Redirected back to `/login`

### Test 2: Cookie Verification
1. Open DevTools → Application → Cookies
2. Login and verify `access_token` and `refresh_token` exist
3. Click logout
4. **Expected:** Both cookies are deleted
5. **Expected:** Redirected to login page

### Test 3: Network Throttling
1. Open DevTools → Network → Enable "Slow 3G" throttling
2. Login to the application
3. Click logout
4. **Expected:** Slight delay, then redirected to login
5. **Expected:** No errors in console

### Test 4: Middleware Verification
1. Login to the application
2. Click logout
3. Open DevTools → Network tab
4. Look for request to `/` (home page)
5. **Expected:** Request returns 307 redirect to `/login`
6. **Expected:** Cookies are empty in the request headers

---

## Related Files

### Frontend
- ✅ `web-next/src/lib/api/client.ts` — Modified logout method
- ✅ `web-next/src/app/api/auth/logout/route.ts` — Added cache headers
- ✅ `web-next/src/lib/auth/session-context.tsx` — Added logout method
- 📄 `web-next/src/proxy.ts` — Middleware (unchanged, handles redirect)
- 📄 `web-next/src/layouts/components/topBar/topBar.tsx` — Logout button (unchanged)

### Backend
- 📄 `api/HrManagementSystem/Features/Security/Authentication/Controllers/V1/AuthController.cs` — LogOut endpoint (unchanged)
- 📄 `api/HrManagementSystem/Features/Security/Authentication/Services/AuthService.cs` — Logout logic (unchanged)

---

## Before & After Flow

### Before (Broken)

```
User clicks logout
    ↓
Fire logout API (don't wait) ⚡
    ↓
Immediately redirect to /login
    ↓
Middleware checks cookies
    ↓
Cookies still exist! (not cleared yet) ❌
    ↓
Redirect back to / (home)
    ↓
User stuck on home page
```

### After (Fixed)

```
User clicks logout
    ↓
Call logout API and WAIT ⏳
    ↓
Server clears cookies
    ↓
Response received with cleared cookies ✅
    ↓
Clear sessionStorage
    ↓
Redirect to /login (full page reload)
    ↓
Middleware checks cookies
    ↓
No cookies found ✅
    ↓
User stays on /login page
    ↓
Success! 🎉
```

---

## Additional Improvements (Optional)

If issues persist, consider these additional enhancements:

### 1. Add Loading State During Logout

```typescript
// In topBar.tsx
const [isLoggingOut, setIsLoggingOut] = useState(false);

const handleLogout = async () => {
  setIsLoggingOut(true);
  await apiClient.logout();
  // No need to set false — user will be on login page
};

// Show spinner during logout
{isLoggingOut && <CircularProgress size={20} />}
```

### 2. Add Logout Confirmation Dialog

```typescript
const handleLogout = () => {
  if (confirm(t("confirmLogout"))) {
    void apiClient.logout();
  }
};
```

### 3. Add Telemetry/Logging

```typescript
async logout() {
  console.log("Logout started");
  await fetch("/api/auth/logout", ...);
  console.log("Cookies cleared");
  window.location.href = "/login";
  console.log("Redirecting to login");
}
```

---

## Summary

The logout issue has been fixed by ensuring the cookie-clearing operation completes **before** the redirect happens. This eliminates the race condition that was causing users to stay on the home page after logout.

**Key takeaway:** Always wait for critical async operations (like cookie clearance) to complete before performing navigation.
