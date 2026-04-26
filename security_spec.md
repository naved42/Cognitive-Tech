# Security Specification for Admin Dashboard

## Data Invariants
1. A user can only access their own profile and history.
2. Admins can view and manage all users.
3. Blocked users cannot perform read or write operations.
4. Only admins can create logs and send global notifications.
5. `role` and `status` fields are immutable for non-admin users.

## The Dirty Dozen Payloads (Target: DENIED)

1. **Identity Spoofing**: Attempt to update another user's profile.
   ```json
   { "uid": "victim_id", "email": "attacker@evil.com" }
   ```
2. **Privilege Escalation**: Non-admin user tries to promote themselves.
   ```json
   { "role": "admin" }
   ```
3. **State Poisoning**: User tries to unblock themselves if blocked.
   ```json
   { "status": "active" }
   ```
4. **Log Tampering**: User tries to delete their audit logs.
   ```json
   // DELETE /logs/{logId}
   ```
5. **Unauthorized Broadcast**: Non-admin tries to send a global notification.
   ```json
   { "title": "Phishing", "type": "global" }
   ```
6. **Orphaned Writes**: Creating history for a non-existent user.
   ```json
   { "userId": "non_existent", "prompt": "test" }
   ```
7. **Shadow Updates**: Injecting hidden fields like `isAdmin: true` into a profile.
   ```json
   { "uid": "my_id", "isAdmin": true }
   ```
8. **PII Leakage**: Authenticated user tries to list all user emails.
   ```json
   // GET /users (without where clause or admin role)
   ```
9. **Query Scraping**: User tries to query all history without filtering by their userId.
   ```json
   // GET /users/any/history
   ```
10. **Timestamp Fraud**: Sending a custom `createdAt` date from the client.
    ```json
    { "createdAt": "2020-01-01T00:00:00Z" }
    ```
11. **Resource Exhaustion**: Sending a 1MB profile description.
    ```json
    { "description": "...1MB string..." }
    ```
12. **Recursive Access**: Blocked user tries to read their own metadata.
    ```json
    // GET /users/{myId} (Should be blocked by status)
    ```
