# Security Spec

## Data Invariants
1. Users can only exist if they are authenticated and their email matches the auth profile.
2. Users can only read their own profile.
3. User profile creation must exactly match the expected schema with timestamp.
4. User profiles are restricted from arbitrary query access.

## Dirty Dozen Payloads
1. Create user profile with missing `email`.
2. Create user with `email` that is not a string.
3. Create user with ghost field `isAdmin: true`.
4. Update user to change `createdAt` timestamp.
5. Create user profile for another `userId`.
6. Read user profile for another `userId`.
7. List user profiles (should be denied).
8. Create profile without auth.
9. Delete user profile.
10. Update user profile with different schema.
11. Read profile with expired auth token.
12. Create profile with massive string for email.
