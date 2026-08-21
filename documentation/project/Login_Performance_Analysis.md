# Login Performance Analysis & Optimization

## Current Performance Issues

Based on the logs, here are the major bottlenecks:

```
POST /api/v1/auth/login          31.5s  (backend: 18.6s) ❌ CRITICAL
GET /api/auth/realtime-token     5.6s   (backend: 5.4s)  ❌ HIGH
GET /api/auth/realtime-token     6.7s   (backend: 6.2s)  ❌ HIGH
GET /api/auth/realtime-token     6.8s   (backend: 6.0s)  ❌ HIGH (duplicate!)
GET /api/account-info/GetInfo    6.6s   (backend: 6.5s)  ⚠️ MODERATE
GET /favicon.ico                 18.2s                   ⚠️ MODERATE
```

**Total login time: ~60+ seconds** (Unacceptable UX)

---

## Root Causes

### 1. Backend Login Endpoint is Slow (31.5s)

**Likely causes:**
- ✅ **Password hashing** — ASP.NET Identity's default PasswordHasher is CPU-intensive
- ✅ **Database queries** — Multiple queries to load user + roles + permissions + refresh tokens
- ✅ **SignInManager lockout check** — May be slow if checking failed attempts
- ✅ **JWT generation** — Loading all permissions/roles into claims
- ✅ **Refresh token creation** — Creating + hashing + storing refresh token

**Backend code path:**
```csharp
_userManager.FindByNameAsync()           // DB query 1
_signInManager.PasswordSignInAsync()     // Password hash + lockout check
FindUserWithTokensAsync()                // DB query 2 (with .Include(RefreshTokens))
_jwtProvider.GenerateAccessTokenAsync()  // Load roles/permissions + generate JWT
RefreshTokenProtector.Issue()            // Hash refresh token
user.RefreshTokens.Add()
_userManager.UpdateAsync()               // DB query 3
```

### 2. Multiple SignalR Token Requests (3x calls, 18s total)

**Why this happens:**
SignalR service is being instantiated/started **multiple times** on the same page, causing:
1. First call during initial SignalR connection
2. Second call from a duplicate SignalR service instance
3. Third call from another component

**Evidence from logs:**
```
GET /api/auth/realtime-token 200 in 5.6s
GET /api/auth/realtime-token 200 in 6.7s  ← duplicate!
GET /api/auth/realtime-token 200 in 6.8s  ← duplicate!
```

### 3. Backend Realtime Token Generation is Slow (5-6s each)

**Likely causes:**
- ✅ **JWT generation** — Loading all user claims every time
- ✅ **Database query** — Loading user roles/permissions again

**Backend code:**
```csharp
public IActionResult RealtimeToken() =>
    Ok(new { token = _jwtProvider.GenerateRealtimeToken(User) });
```

This calls `GenerateRealtimeToken()` which likely:
- Loads user from database
- Loads all roles/permissions
- Generates a new JWT

---

## Optimization Strategy

### Priority 1: Fix Backend Login Performance (Target: <2s)

#### Option A: Optimize Database Queries (Immediate)

**Add database indexes:**
```sql
-- If not already indexed
CREATE INDEX IX_Users_NormalizedUserName ON AspNetUsers(NormalizedUserName);
CREATE INDEX IX_Users_NormalizedEmail ON AspNetUsers(NormalizedEmail);
CREATE INDEX IX_UserLogins_UserId ON AspNetUserLogins(UserId);
```

**Use projection instead of loading full entities:**
```csharp
// Instead of: var user = await _userManager.FindByNameAsync(userName);
// Use explicit projection:
var user = await _context.Users
    .Where(u => u.NormalizedUserName == userName.ToUpper())
    .Select(u => new { u.Id, u.Email, u.PasswordHash, ... })
    .FirstOrDefaultAsync();
```

**Reduce JWT claims:**
```csharp
// Instead of loading ALL permissions, load only essential ones
// Consider using permission groups or caching
```

#### Option B: Use Faster Password Hashing (Medium Priority)

ASP.NET Identity uses PBKDF2 with 10,000 iterations by default (very secure but slow).

**For development only, reduce iterations:**
```csharp
services.Configure<PasswordHasherOptions>(options =>
{
    options.IterationCount = 10_000; // Default, reduce to 4096 for testing
});
```

⚠️ **Do NOT reduce in production** — this weakens security.

#### Option C: Async Background Tasks (Medium Priority)

Move non-critical operations to background jobs:
```csharp
// Don't wait for user login tracking
BackgroundJob.Enqueue(() => _authService.CreateLoginAsync(user.Id, cancellationToken));
```

---

### Priority 2: Fix Multiple SignalR Token Calls (Target: 1 call)

#### Root Cause: SignalR Service Instantiated Multiple Times

**Problem:** `signalRService` is being imported and started multiple times.

**Solution:** Ensure SignalR service is a **singleton** and started **only once**.

**Check where SignalR is being started:**
```bash
# Search for signalRService.start()
grep -r "signalRService.start" web-next/src/
```

**Likely culprits:**
- Multiple layout components
- Multiple root-level hooks (useEffect)
- Multiple SignalR context providers

**Fix:** Create a single SignalR context and start once:

```typescript
// src/lib/signalr/SignalRProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import signalRService from "@/shared/services/signalRService";

const SignalRContext = createContext<{ started: boolean }>({ started: false });

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) {
      void signalRService.start().then(() => setStarted(true));
    }
    return () => signalRService.stop();
  }, [started]);

  return <SignalRContext.Provider value={{ started }}>{children}</SignalRContext.Provider>;
}

export const useSignalR = () => useContext(SignalRContext);
```

---

### Priority 3: Cache Realtime Token (Target: <500ms)

#### Problem: Generating a new JWT on every request

**Solution:** Cache the realtime token on the frontend for 5-10 minutes.

```typescript
// src/shared/services/signalRService.ts
class SignalRService {
  private prefetchedToken: string | undefined;
  private tokenExpiry: number | undefined;

  constructor(hubUrl: string) {
    const options: signalR.IHttpConnectionOptions = {
      accessTokenFactory: async () => {
        if (!isBrowser()) return "";

        // Check cached token first
        const now = Date.now();
        if (this.prefetchedToken && this.tokenExpiry && this.tokenExpiry > now) {
          console.log(`${TOKEN_TAG} Using cached token (expires in ${(this.tokenExpiry - now) / 1000}s)`);
          return this.prefetchedToken;
        }

        console.log(`${TOKEN_TAG} Fetching fresh realtime token…`);
        const response = await fetch("/api/auth/realtime-token", { cache: "no-store" });
        // ... rest of logic
        
        // Cache for 5 minutes
        this.tokenExpiry = Date.now() + (5 * 60 * 1000);
      },
      // ...
    };
  }
}
```

---

## Quick Wins (Implement Today)

### 1. Add Loading State to Login Button
```typescript
// Show spinner immediately when login starts
const [isLoggingIn, setIsLoggingIn] = useState(false);

const onSubmit = async (credentials) => {
  setIsLoggingIn(true);
  try {
    await apiService.post(apiRoutes.auth.login, credentials);
  } finally {
    setIsLoggingIn(false);
  }
};
```

### 2. Defer Non-Critical Requests
```typescript
// Don't call GetInfo immediately after login
// Let the user see the dashboard first, then load in background
useEffect(() => {
  const timer = setTimeout(() => {
    void fetchAccountInfo();
  }, 1000); // 1 second delay
  return () => clearTimeout(timer);
}, []);
```

### 3. Add Database Indexes
```sql
-- Run these migrations
CREATE INDEX IX_Users_NormalizedUserName ON AspNetUsers(NormalizedUserName) 
  WHERE NormalizedUserName IS NOT NULL;
  
CREATE INDEX IX_RefreshTokens_UserId ON RefreshTokens(UserId);
CREATE INDEX IX_RefreshTokens_TokenHash ON RefreshTokens(TokenHash);
```

---

## Expected Results After Optimization

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Login endpoint | 31.5s | <2s | **94% faster** |
| Realtime token (cached) | 6s × 3 = 18s | 1s × 1 = 1s | **95% faster** |
| Account info (deferred) | 6.6s (blocking) | 6.6s (background) | **Non-blocking** |
| **Total login time** | **~60s** | **<5s** | **92% faster** |

---

## Monitoring & Debugging

### Add Performance Logging (Backend)

```csharp
[HttpPost]
[AllowAnonymous]
public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
{
    var stopwatch = System.Diagnostics.Stopwatch.StartNew();
    
    var result = await _authService.GetTokenAsync(request.UserName, request.Password, cancellationToken);
    
    stopwatch.Stop();
    _logger.LogInformation("Login completed in {ElapsedMs}ms for user {UserName}", 
        stopwatch.ElapsedMilliseconds, request.UserName);
    
    return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
}
```

### Add Performance Logging (Frontend)

```typescript
console.time("Login API");
const data = await apiService.post(apiRoutes.auth.login, credentials);
console.timeEnd("Login API");
```

---

## Action Plan

### Week 1: Critical Fixes
- [x] Document performance issues
- [ ] Add database indexes
- [ ] Fix multiple SignalR token calls (singleton pattern)
- [ ] Add loading state to login button

### Week 2: Optimization
- [ ] Cache realtime tokens (5min TTL)
- [ ] Defer non-critical API calls
- [ ] Profile backend login flow (find exact bottleneck)
- [ ] Optimize database queries (use projections)

### Week 3: Advanced
- [ ] Consider Redis caching for user permissions
- [ ] Implement lazy loading for non-essential data
- [ ] Add CDN caching for static assets

---

## Next Steps

1. **Run this immediately:**
   ```sql
   CREATE INDEX IX_Users_NormalizedUserName ON AspNetUsers(NormalizedUserName);
   ```

2. **Find where SignalR is started multiple times:**
   ```bash
   grep -r "signalRService.start" web-next/src/
   ```

3. **Add performance logging to login endpoint** (see code above)

4. **Test with profiler:**
   - Use Chrome DevTools Performance tab
   - Use dotTrace or MiniProfiler on backend

---

**Status:** Analysis complete. Ready for implementation.
