# User-Isolated Chat History - Implementation Test Guide

## Summary of Changes

### Backend Changes (server.ts)
1. **GET /api/history** - Now requires authentication and filters by userId
   - Line 421-426: Added `verifyAuth` middleware and userId filtering
   
2. **GET /api/datasets** - Now requires authentication and filters by userId
   - Line 399-403: Added `verifyAuth` middleware and userId filtering

3. **DELETE /api/history/:id** - Fixed ownership validation
   - Line 442-444: Now strictly requires userId match (removed null check allowing)

### Frontend Changes (src/components/views/HomeView.tsx)
1. **Chat Messages Storage** - User-scoped localStorage keys
   - Line 77: Changed from `'ct_chat_messages'` to `ct_chat_messages_${userId}`
   
2. **Token Storage** - User-scoped localStorage keys
   - Line 91: Changed from `'ct_tokens'` to `ct_tokens_${userId}`

3. **Rate Limiting History** - User-scoped localStorage keys
   - Line 127: Changed from `'ct_msg_history'` to `ct_msg_history_${userId}`

4. **Active Tools/Connectors** - User-scoped localStorage keys
   - Line 161, 162: Changed to user-scoped keys

5. **Cleanup on Clear Chat** - User-scoped keys
   - Line 572-577: Updated clearChat() to remove user-scoped keys

## Testing Scenarios

### Scenario 1: Different Users See Different Chat Histories
**Test Steps:**
1. Login as User A
2. Send a chat message: "Hello from User A"
3. Verify the message appears in chat
4. Open browser dev tools → Application → LocalStorage
5. Find `ct_chat_messages_[user_a_id]` and verify message is stored
6. Logout
7. Login as User B
8. Verify chat history is empty (no message from User A)
9. Send a message: "Hello from User B"
10. Verify User B's message appears only for User B

**Expected Result:** Each user sees only their own chat history

### Scenario 2: API Endpoints Require Authentication
**Test Steps:**
1. Open Postman or curl
2. Try to fetch `/api/history` without auth token
3. Try to fetch `/api/datasets` without auth token

**Expected Result:** Both requests return 401 Unauthorized

### Scenario 3: Unauthenticated Users Get Only Their Data
**Test Steps:**
1. Login as User A and create 3 chat messages
2. Make API call: `GET /api/history` with User A's auth token
3. Verify response contains only User A's history
4. Logout and login as User B
5. Make API call: `GET /api/history` with User B's auth token
6. Verify response is empty or contains only User B's history
7. Verify User A's messages are NOT returned

**Expected Result:** Each user's API responses contain only their data

### Scenario 4: Tokens and Settings Are User-Scoped
**Test Steps:**
1. Login as User A
2. Check token count (default 20)
3. Send 2 messages to reduce tokens
4. Check token count is now 18
5. Logout and login as User B
6. Verify token count resets to 20 (not 18)
7. Logout and login as User A again
8. Verify token count is still 18

**Expected Result:** Each user maintains independent token counts

### Scenario 5: Rate Limiting Is Per-User
**Test Steps:**
1. Login as free User A
2. Send 5 chat messages (should hit rate limit)
3. Try to send 6th message
4. Verify error: "Message limit reached" and rate limit message
5. Logout and login as free User B
6. Verify User B can still send messages (independent rate limit)

**Expected Result:** Rate limiting is tracked per user, not globally

### Scenario 6: Users Cannot Delete Others' History
**Test Steps:**
1. Login as User A and create a chat message (note the ID)
2. Logout and login as User B
3. Try to delete User A's message via API:
   ```
   DELETE /api/history/[user_a_message_id]
   ```
4. Include User B's auth token

**Expected Result:** Returns 404 "History item not found or unauthorized"

### Scenario 7: Clearing Chat Only Clears User's Data
**Test Steps:**
1. Create chat messages in both User A and User B's sessions
2. As User A, click "Clear Session" button
3. Verify User A's localStorage shows: `ct_chat_messages_[user_a_id]` is empty
4. Logout and login as User B
5. Verify User B's messages still exist

**Expected Result:** Clearing chat only affects the current user's data

## Browser Behavior Test

### Multi-Tab Test (Same User)
1. Open app in Tab 1 as User A
2. Send a message: "Tab 1 Message"
3. Open app in Tab 2 as User A (same user)
4. Verify both tabs show the same chat history

**Expected Result:** Same user seeing their chat history across multiple tabs

### Multi-User Same Browser Test
1. Login as User A in Private/Incognito window
2. Send messages
3. Close Private window
4. Open different Private window and login as User B
5. Verify User B sees empty chat history

**Expected Result:** Different localStorage keys prevent cross-user data leakage

## API Response Format

### GET /api/history (User A)
```json
[
  {
    "id": "1234567890",
    "query": "User A's first question",
    "userId": "user_a_uid",
    "datasetId": null,
    "result": "...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

### GET /api/history (User B) 
```json
[
  {
    "id": "9876543210",
    "query": "User B's question",
    "userId": "user_b_uid",
    "datasetId": null,
    "result": "...",
    "timestamp": "2024-01-15T10:35:00Z"
  }
]
```

## Verification Checklist

- [ ] Backend API requires authentication on GET /api/history
- [ ] Backend API requires authentication on GET /api/datasets
- [ ] GET /api/history returns only authenticated user's data
- [ ] GET /api/datasets returns only authenticated user's data
- [ ] DELETE /api/history validates user ownership strictly
- [ ] Frontend uses user-scoped localStorage keys for messages
- [ ] Frontend uses user-scoped localStorage keys for tokens
- [ ] Frontend uses user-scoped localStorage keys for rate limiting
- [ ] Chat history is preserved per user across sessions
- [ ] Token counts are independent per user
- [ ] Rate limiting is tracked per user
- [ ] Clearing chat removes only the user's data
- [ ] Multiple users on same device are isolated
- [ ] Same user across multiple tabs shares data
- [ ] Build succeeds without errors
- [ ] No console errors when using the app

## Rollback Plan (if issues arise)
If issues are discovered, revert to generic localStorage keys and remove auth from GET endpoints:
1. Remove `verifyAuth` from GET /api/history and GET /api/datasets
2. Remove userId filtering from GET responses
3. Change all `ct_*_${userId}` keys back to generic `ct_*` keys
4. Re-run build and tests
