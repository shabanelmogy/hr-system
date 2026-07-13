# Login Performance Fix — Summary

## Problem
Login process taking **~60 seconds** with multiple performance bottlenecks.

## Root Causes Identified

### 1. Backend Login Endpoint Slow (31.5s)
- Password hashing (PBKDF2 with 10,000 iterations)
- Multiple database queries (user + roles + permissions + refresh tokens)
- JWT generation with all claims
- Refresh token creation and storage

### 2. Multiple SignalR Token Requests (18s total)
**3 duplicate calls** to `/api/auth/realtime-token`:
- `useTokenRevocation` called `signalRService.start()`
- `useSignalR` called `signalRService.start()`
- `SimpleNotificationSystem` called `signalRService.start()`

Each call took 5-6 seconds = **18 seconds wasted on duplicates**

### 3. Backend Realtime Token Generation Slow (5-6s each)
- Loading user from database on every call
- Loading all roles/permissions
- Generating new JWT each time

---

## Solutions Implemented

### ✅ Fix 1: SignalR Singleton Pattern

**Created `SignalRProvider.tsx`:**
- Starts SignalR **once** at app root
- Uses module-level flags to prevent duplicate starts
- All hooks register event handlers only (no start/stop)

**Files Modified:**
- ✅ Created `web-next/src/lib/signalr/SignalRProvider.tsx`
- ✅ Modified `web-next/src/app/providers.tsx` — Added `<SignalRProvider>`
- ✅ Modified `web-next/src/shared/store/useTokenRevocation.ts` — Removed `.start()`
- ✅ Modified `web-next/src/shared/store/useSignalR.ts` — Removed `.start()` and `.stop()`
- ✅ Modified `web-next/src/shared/services/notifications/SimpleNotificationSystem.ts` — Deprecated `.startSignalR()`

**Result:**
- **Before:** 3 calls × 6s = 18s
- **After:** 1 call × 6s = 6s
- **Savings:** 12 seconds ⚡

---

## Backend Optimizations (Recommended)

### Priority 1: Database Indexes
```sql
CREATE INDEX IX_Users_NormalizedUserName ON AspNetUsers(NormalizedUserName) 
  WHERE NormalizedUserName IS NOT NULL;
  
CREATE INDEX IX_RefreshTokens_UserId ON RefreshTokens(UserId);
CREATE INDEX IX_RefreshTokens_TokenHash ON RefreshTokens(TokenHash);
```

### Priority 2: Cache Realtime Tokens (Frontend)
Cache tokens for 5 minutes to avoid regenerating on every SignalR reconnect.

### Priority 3: Optimize JWT Generation
Reduce number of claims or cache permissions lookup.

### Priority 4: Use Query Projections
Load only required fields instead of full entities.

---

## Expected Performance After All Fixes

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Login endpoint | 31.5s | <2s | 94% faster |
| SignalR tokens | 18s (3 calls) | 6s (1 call) | 67% faster |
| **Total login time** | **~60s** | **<10s** | **83% faster** |

---

## Files Changed

### Frontend
- ✅ `web-next/src/lib/signalr/SignalRProvider.tsx` — NEW
- ✅ `web-next/src/app/providers.tsx`
- ✅ `web-next/src/shared/store/useTokenRevocation.ts`
- ✅ `web-next/src/shared/store/useSignalR.ts`
- ✅ `web-next/src/shared/services/notifications/SimpleNotificationSystem.ts`

### Backend (Recommended)
- [ ] Add database indexes
- [ ] Optimize login endpoint queries
- [ ] Cache realtime token generation
- [ ] Profile and optimize JWT generation

---

## Testing

### Test 1: Single SignalR Connection
1. Login to the application
2. Open DevTools → Network tab
3. Filter for `realtime-token`
4. **Expected:** Only **1 request** (not 3)

### Test 2: Faster Login
1. Clear browser cache
2. Login with valid credentials
3. **Expected:** See home page in <10 seconds

### Test 3: SignalR Still Works
1. Login
2. Have admin revoke your session
3. **Expected:** Alert appears and you're logged out

---

## Next Steps

1. **Deploy frontend changes** (SignalR singleton)
2. **Add database indexes** on backend
3. **Profile backend login endpoint** to find exact bottleneck
4. **Consider caching** for user permissions/roles

---

## Status
✅ **Frontend Optimized** — SignalR now starts once  
⏳ **Backend Pending** — Needs database indexes + profiling

**Date:** January 2025
