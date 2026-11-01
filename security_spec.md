# LearnWithMe Firestore Security Specification

## 1. Data Invariants

1. **Public Read / Admin Write Content (`/blogs`, `/categories`, `/projects`, `/profile`)**:
   - Public visitors may only read `/blogs/{blogId}` documents where `resource.data.status == 'published'`. Draft articles (`status == 'draft'`) are strictly visible only to the verified administrator (`isAdmin()`).
   - Only the verified administrator (`isAdmin()`) can create, update, or delete documents in `/blogs`, `/categories`, `/projects`, and `/profile`.
2. **PII Isolation (`/users`, `/subscribers`, `/contact_messages`)**:
   - `/subscribers/{subscriberId}` and `/contact_messages/{messageId}` contain visitor email addresses (PII). Public visitors can `create` new records with strict schema and field-length bounds, but `get`, `list`, `update`, and `delete` are strictly restricted to `isAdmin()`.
   - `/users/{userId}` may only be read or written by the verified owner (`isOwner(userId)`) or `isAdmin()`, and `role` is restricted to `'admin'` for the verified admin email (`guna.chinnu07@gmail.com`).
3. **Strict Key & Size Enforcement**:
   - Every string field has an explicit `.size() <= MAX` bound matching `firebase-blueprint.json`.
   - Every array field (`tags`, `keyTakeaways`, `technologies`, `interests`, `skills`, `goals`) is bounded by `.size() <= 20`.
   - Document IDs are validated with `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Unverified Admin Email Spoof**: Authenticated user with `email == 'guna.chinnu07@gmail.com'` but `email_verified == false` attempting to create a blog post -> `PERMISSION_DENIED`.
2. **Draft Blog Scraping**: Unauthenticated visitor querying `/blogs` where `status == 'draft'` -> `PERMISSION_DENIED`.
3. **Shadow Field Injection on Blog Create**: Admin creating a blog with an undeclared field `isHacked: true` -> `PERMISSION_DENIED`.
4. **Oversized Blog Content (Denial of Wallet)**: Blog payload with `title` > 200 chars or `content` > 80000 chars -> `PERMISSION_DENIED`.
5. **Unauthenticated Category Mutation**: Public user attempting to update `/categories/programming` -> `PERMISSION_DENIED`.
6. **Unauthenticated Project Deletion**: Public user attempting to delete `/projects/proj-1` -> `PERMISSION_DENIED`.
7. **Subscriber PII Enumeration (`list` / `get`)**: Non-admin signed-in user attempting to `get` or `list` `/subscribers` -> `PERMISSION_DENIED`.
8. **Invalid Subscriber Status Injection**: Public user creating a subscriber with `status: 'admin'` or extra fields -> `PERMISSION_DENIED`.
9. **Contact Message PII Leak**: Non-admin user attempting to read `/contact_messages/msg-1` -> `PERMISSION_DENIED`.
10. **Contact Message Oversized Payload**: Public user submitting a contact message with `message.size() > 4000` -> `PERMISSION_DENIED`.
11. **Self-Assigned Admin Role Escalation**: Non-admin user creating `/users/{uid}` with `role: 'admin'` -> `PERMISSION_DENIED`.
12. **ID Poisoning Attack**: Creating a subscriber or contact message with invalid characters or >128 char document ID -> `PERMISSION_DENIED`.
