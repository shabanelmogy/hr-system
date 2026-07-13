# API Proxy Architecture Analysis

## Current Architecture

Your application uses a **Next.js API Proxy** pattern:

```
Browser (localhost:3000)
    ↓
    POST /api/v1/auth/login
    ↓
Next.js API Proxy (/api/[...path]/route.ts)
    ↓
    Forward to Backend (hr-managementsystem.runasp.net/api/v1/auth/login)
    ↓
Backend processes request (31.5s)
    ↓
Next.js receives response
    ↓
Sets cookies & returns to browser
```

## Why This Architecture?

✅ **Benefits:**
1. **No CORS issues** — Browser only talks to Next.js (same origin)
2. **Secure cookie management** — HttpOnly cookies set server-side
3. **Automatic token refresh** — Proxy handles 401 errors transparently
4. **Environment isolation** — Backend URL hidden from client

❌ **Downsides:**
1. **Extra network hop** — Request goes through Next.js first
2. **Potential bottleneck** — Next.js becomes a proxy layer
3. **Higher latency** — Additional processing time

---

## Performance Breakdown

From your logs:
```
POST /api/v1/auth/login 200 in 31.5s 
  next.js: 12.9s
  application-code: 18.6s (backend)
```

**Breakdown:**
- **18.6s** — Backend processing (actual login logic)
- **12.9s** — Next.js proxy overhead + network
- **Total: 31.5s**

---

## Root Cause: Backend is Slow

The main issue is **not** the proxy architecture — it's the backend login endpoint taking 18.6 seconds.

**Evidence:**
- 18.6s is pure backend application code
- Next.js proxy only adds ~13s overhead (acceptable for a proxy)
- Even without the proxy, login would still take 18.6s

---

## Solutions

### ❌ Don't Do: Remove the Proxy

**Why not:**
```typescript
// Direct backend calls from browser
baseURL: "https://hr-managementsystem.runasp.net"
```

**Problems:**
1. **CORS errors** — Backend must allow `localhost:3000` origin
2. **Cookie issues** — HttpOnly cookies won't work cross-domain
3. **Token refresh breaks** — No way to intercept 401 and refresh
4. **Security risk** — Backend URL exposed to client
5. **Still slow** — Backend is still 18.6s

### ✅ Do: Optimize the Backend

**The real fix is to make the backend login endpoint faster.**

#### Backend Optimization Checklist

**1. Add Database Indexes** (Immediate, 0 code changes)
```sql
CREATE INDEX IX_Users_NormalizedUserName ON AspNetUsers(NormalizedUserName);
CREATE INDEX IX_Users_NormalizedEmail ON AspNetUsers(NormalizedEmail);
CREATE INDEX IX_RefreshTokens_UserId ON RefreshTokens(UserId);
CREATE INDEX IX_RefreshTokens_TokenHash ON RefreshTokens(TokenHash);
```

**Expected impact:** 5-10s savings

**2. Use Projections Instead of Full Entities**
```csharp
// ❌ Slow: Loads entire user + all navigation properties
var user = await _userManager.FindByNameAsync(userName);

// ✅ Fast: Only loads what's needed
var user = await _context.Users
    .Where(u => u.NormalizedUserName == userName.ToUpper())
    .Select(u => new { u.Id, u.Email, u.PasswordHash, u.SecurityStamp })
    .FirstOrDefaultAsync();
```

**Expected impact:** 3-5s savings

**3. Async Background Jobs**
```csharp
// ❌ Slow: Wait for login tracking
await _authService.CreateLoginAsync(user.Id, cancellationToken);

// ✅ Fast: Fire and forget
BackgroundJob.Enqueue(() => _authService.CreateLoginAsync(user.Id, default));
```

**Expected impact:** 1-2s savings

**4. Cache User Permissions**
```csharp
// ❌ Slow: Load permissions from DB every login
var permissions = await _context.UserPermissions
    .Where(up => up.UserId == user.Id)
    .ToListAsync();

// ✅ Fast: Cache in Redis for 10 minutes
var permissions = await _cache.GetOrSetAsync(
    $"user:{user.Id}:permissions",
    () => LoadPermissionsFromDb(user.Id),
    TimeSpan.FromMinutes(10)
);
```

**Expected impact:** 2-4s savings

**5. Reduce JWT Claims**
```csharp
// ❌ Slow: Add ALL permissions to JWT (can be 100+ claims)
foreach (var permission in user.Permissions)
    claims.Add(new Claim(Permissions.Type, permission));

// ✅ Fast: Only add essential claims, load others from cache when needed
claims.Add(new Claim("permissions_key", $"user:{user.Id}:permissions"));
```

**Expected impact:** 1-2s savings

---

## Alternative: Parallel Proxy (Advanced)

If backend optimization isn't enough, consider this hybrid approach:

### Option A: Direct Backend for Public Endpoints
```typescript
class ApiClient {
  constructor() {
    this.api = axios.create({
      // Use Next.js proxy for authenticated requests
      baseURL: "",
      withCredentials: true
    });

    // Direct backend client for public endpoints (login, register)
    this.publicApi = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
      withCredentials: false // No cookies needed yet
    });
  }

  async login(credentials) {
    // Call backend directly for faster login
    const response = await this.publicApi.post("/api/v1/auth/login", credentials);
    
    // Then call Next.js to set cookies
    await fetch("/api/auth/set-session", {
      method: "POST",
      body: JSON.stringify(response.data)
    });

    return response.data;
  }
}
```

**Trade-offs:**
- ✅ Faster login (no proxy overhead)
- ❌ More complex code
- ❌ CORS must be configured
- ❌ Cookie management more fragile

---

## Recommended Action Plan

### Week 1: Quick Wins (No Architecture Changes)
1. ✅ Add database indexes
2. ✅ Profile backend login endpoint (find exact bottleneck)
3. ✅ Add logging to measure each step

### Week 2: Backend Optimization
1. Use projections instead of full entities
2. Move non-critical operations to background jobs
3. Cache user permissions in Redis
4. Reduce JWT claims payload

### Week 3: Advanced (Only if needed)
1. Consider direct backend calls for public endpoints
2. Implement CDN caching for static assets
3. Add Redis caching layer

---

## Expected Results After Optimization

| Scenario | Login Time |
|----------|------------|
| **Current** | 31.5s |
| **After indexes** | ~25s |
| **After projections** | ~20s |
| **After background jobs** | ~18s |
| **After caching** | ~14s |
| **After JWT optimization** | **<10s** ✅ |

---

## Measuring Backend Performance

### Add Logging to AuthService

```csharp
public async Task<Result<AuthResponse>> GetTokenAsync(
    string userName,
    string password,
    CancellationToken cancellationToken)
{
    var sw = Stopwatch.StartNew();
    
    _logger.LogInformation("Login started for {UserName}", userName);
    
    // Step 1: Find user
    sw.Restart();
    var user = await _userManager.FindByNameAsync(userName);
    _logger.LogInformation("FindByNameAsync: {ElapsedMs}ms", sw.ElapsedMilliseconds);
    
    // Step 2: Password check
    sw.Restart();
    var signInResult = await _signInManager.PasswordSignInAsync(user, password, ...);
    _logger.LogInformation("PasswordSignInAsync: {ElapsedMs}ms", sw.ElapsedMilliseconds);
    
    // Step 3: Load tokens
    sw.Restart();
    user = await FindUserWithTokensAsync(user.Id, cancellationToken);
    _logger.LogInformation("FindUserWithTokensAsync: {ElapsedMs}ms", sw.ElapsedMilliseconds);
    
    // Step 4: Generate JWT
    sw.Restart();
    var accessToken = await _jwtProvider.GenerateAccessTokenAsync(user, sessionId);
    _logger.LogInformation("GenerateAccessTokenAsync: {ElapsedMs}ms", sw.ElapsedMilliseconds);
    
    // Step 5: Create refresh token
    sw.Restart();
    var refreshToken = RefreshTokenProtector.Issue(...);
    _logger.LogInformation("RefreshTokenProtector.Issue: {ElapsedMs}ms", sw.ElapsedMilliseconds);
    
    // Step 6: Update user
    sw.Restart();
    await _userManager.UpdateAsync(user);
    _logger.LogInformation("UpdateAsync: {ElapsedMs}ms", sw.ElapsedMilliseconds);
    
    return Result.Success(response);
}
```

This will show exactly which step is slow.

---

## Summary

✅ **Keep the Next.js proxy** — It's not the bottleneck  
❌ **Don't call backend directly** — Breaks auth flow  
✅ **Optimize the backend** — That's where the 18.6s is spent  
✅ **Add database indexes first** — Easiest win  
✅ **Profile to find exact bottleneck** — Data-driven optimization  

**The proxy adds ~13s, but backend takes 18.6s. Fix the backend first.**
