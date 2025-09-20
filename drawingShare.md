# Drawing Submission & Sharing Features: Development Plan

This document outlines the step-by-step approach for building and launching the Drawing Submission & Sharing platform. Features are grouped into two phases: Phase 1 (MVP) and Phase 2 (Quality of Life & Advanced Features). Each section contains actionable steps for implementation.

---

## Phase 1: Core Features (MVP)

### 1. User Authentication & Profile
**Goal:** Enable secure user login, basic profile, and display name for credit.

**Steps:**
1. ~~Set up a Firebase project; enable Authentication (email/password, Google, etc.).~~
2. ~~Integrate Firebase Auth SDK into the React app.~~
3. ~~Build login/signup UI components.~~

**Next Steps:**
4. Show the current user's info (display name/email) when logged in.
5. Add a logout button.
6. Redirect users after login/signup and show feedback (done).
7. Create a profile page (where users can view/update their display name).
8. Store user profile and display name in Firestore.
9. Add Google sign-in to login/signup forms.
10. Implement a personal gallery page that queries drawings by user ID.

### 2. Drawing Submission
**Goal:** Allow users to create, submit, and track up to 4 drawings per day.

**Steps:**
1. Integrate or build a drawing builder/canvas in the app.
2. On submission, upload drawing to Firebase Storage.
3. Save drawing metadata (name, category, user info, status) to Firestore.
4. Enforce a 4 submissions/day/user limit (check Firestore on submit).
5. Update user gallery to show all their drawings and approval status.
6. Allow users to delete or un-share only private (unsubmitted) drawings.
7. Lock editing/deletion for drawings once submitted for review.

### 3. Drawing Sharing
**Goal:** Allow users to generate and manage shareable links for their drawings.

**Steps:**
1. Add a "Share" button to each drawing in the user's gallery.
2. Generate a unique, public URL for each shared drawing (using drawing ID or shareId).
3. Create a public route/page to view shared drawings by URL.
4. Allow users to un-share (revoke) their own links for private/unsubmitted drawings.
5. Ensure only the owner or admin can revoke a share link.

### 4. Admin Review & Approval
**Goal:** Give admins full control over reviewing and scheduling drawings.

**Steps:**
1. Build an admin-only dashboard (protected by Auth/roles).
2. List all pending submissions with previews, user info, and metadata.
3. Implement approve/deny actions that update status in Firestore.
4. Allow admin to assign approved drawings to categories and future dates.
5. Allow admin to move/remove any drawing from the schedule.
6. Once submitted, lock user control over drawing (cannot delete/make unavailable).

### 5. Daily Release System & Game Logic
**Goal:** Display a set of 4 scheduled drawings for each day, one per category.

**Steps:**
1. Design a Firestore structure for daily schedules (date, categories, drawing IDs).
2. Implement logic to fetch the 4 assigned drawings/categories for the current date.
3. Display the daily set in the app for users to play with.
4. Add fallback logic to select from the approved pool if a spot is unassigned.

### 6. Storage Organization
**Goal:** Efficiently store and retrieve drawings and metadata.

**Steps:**
1. Organize Firebase Storage: `/drawings/{userId}/{drawingId}` or by status/category.
2. Store all metadata in Firestore (with references to storage URLs).
3. Index Firestore for common queries (by user, status, category, date).
4. Plan for cost management and scalability.

---

## Phase 2: Quality of Life & Advanced Features

### 1. Admin Alerts & Controls
**Goal:** Enhance admin power and prevent scheduling gaps.

**Steps:**
1. Implement an alert in the admin dashboard if any category/drawing spot is unassigned within 24 hours.
2. Add bulk actions (approve/deny/move multiple drawings at once).
3. Allow rescheduling and revoking of links from the dashboard.
4. Enable admin to disable users from submitting (abuse prevention).

### 2. Abuse Prevention & Moderation
**Goal:** Protect the platform from misuse.

**Steps:**
1. Add reporting tools for users and admins on drawings and users.
2. Implement admin actions for abuse (disable user, remove content, etc.).
3. Log moderation actions for auditability.

### 3. Advanced Sharing Controls
**Goal:** Give users and admins more control over public links.

**Steps:**
1. Allow admins to revoke any public link at any time.
2. Add public/private toggling for shared drawings.
3. Notify users if a shared link is revoked by admin.

### 4. Notifications
**Goal:** Keep users informed about their submissions.

**Steps:**
1. Allow users to opt-in for email notifications (drawing approved, featured, etc.).
2. Integrate with Firebase Cloud Functions and an email provider (e.g., SendGrid).
3. Send notifications based on Firestore triggers (status changes).

### 5. Analytics Dashboard
**Goal:** Track engagement and improve the app.

**Steps:**
1. Integrate analytics (Firebase Analytics, Google Analytics, or custom Firestore tracking).
2. Track plays, shares, category difficulty, repeat visits, and user engagement.
3. Build an admin dashboard to visualize analytics data.

---

This plan will be updated as features are further defined and implemented.
   - Track plays, shares, category difficulty, repeat visits

---

## Feature Details

### Phase 1: Core Features (MVP)
#### 1. User Authentication & Profile
- Users can sign up and log in using email/password or OAuth providers (Google, etc.).
- Each user has a profile and a personal gallery showing all their drawings and their approval status.
- Users provide a display name for credit if their drawing is used.

#### 2. Drawing Submission
- Users can create drawings in the builder app.
- Upon submission, the drawing file is uploaded to cloud storage (e.g., Firebase Storage).
- Metadata (name, category, user info, status) is saved to the database (e.g., Firestore).
- Users can see the status of their submissions (pending, approved, denied) in their gallery.
- Users can submit up to 4 drawings per day.
- Users may un-share or delete private (unsubmitted) drawings, but cannot delete or modify drawings once submitted for review.

#### 3. Drawing Sharing
- Users can generate a unique, public URL for any drawing they wish to share.
- Shared drawings are accessible to anyone with the link, regardless of approval status.
- Sharing does not require admin approval.
- Users can un-share a public link.

#### 4. Admin Review & Approval
- Admin-only dashboard lists all submitted drawings with status and metadata.
- Admin can preview drawings, view user info, and approve or deny submissions.
- Approval updates the drawing's status in the database.
- Only approved drawings are eligible for daily release.
- Admins have full control to remove or move any drawing from the schedule.
- Once submitted for review, users lose control over the drawing (cannot delete or make unavailable).

#### 5. Daily Release System & Game Logic
- Admins can assign 4 approved drawings to 4 categories for any future date using the admin backend.
- Categories are flexible and can change daily; they are not fixed.
- For each day, the game pulls the assigned drawings and categories for that date.
- The app displays the 4 chosen drawings (one per category) as the daily set for users to play with.
- If no drawings are assigned for a date, fallback logic (e.g., random selection from approved pool) can be used.

#### 6. Storage Organization
- Drawings and metadata are organized for efficient retrieval and cost management (recommendation needed).

### Phase 2: Quality of Life & Advanced Features
#### 1. Admin Alerts & Controls
- Admin console will show an alert if any category/drawing spot is unassigned within 24 hours of its scheduled date.
- Enhanced admin controls: bulk actions, reschedule, revoke links.
- Admins can disable users from submitting drawings (for abuse prevention).

#### 2. Abuse Prevention & Moderation
- Reporting tools for users and admins.
- Admin actions for abuse cases.

#### 3. Advanced Sharing Controls
- Admin can revoke any public link.
- Advanced sharing: public/private toggling.

#### 4. Notifications
- Users may opt-in for email notifications when their drawing is approved.

#### 5. Analytics Dashboard
- Analytics will track user engagement, sharing, category difficulty, and repeat visits.

---

### 1. User Authentication & Profile
- Users can sign up and log in using email/password or OAuth providers (Google, etc.).
- Each user has a profile and a personal gallery showing all their drawings and their approval status.

### 2. Drawing Submission
- Users can create drawings in the builder app.
- Upon submission, the drawing file is uploaded to cloud storage (e.g., Firebase Storage).
- Metadata (name, category, user info, status) is saved to the database (e.g., Firestore).
- Users can see the status of their submissions (pending, approved, denied) in their gallery.

### 3. Drawing Sharing
- Users can generate a unique, public URL for any drawing they wish to share.
- Shared drawings are accessible to anyone with the link, regardless of approval status.
- Sharing does not require admin approval.
- Optionally, track which drawings have been shared (e.g., `isShared: true`).

### 4. Admin Review & Approval
- Admin-only dashboard lists all submitted drawings with status and metadata.
- Admin can preview drawings, view user info, and approve or deny submissions.
- Approval updates the drawing's status in the database.
- Only approved drawings are eligible for daily release.

### 5. Daily Release System & Game Logic
- Admins can assign 4 approved drawings to 4 categories for any future date using the admin backend.
- Categories are flexible and can change daily; they are not fixed.
- For each day, the game pulls the assigned drawings and categories for that date.
- The app displays the 4 chosen drawings (one per category) as the daily set for users to play with.
- If no drawings are assigned for a date, fallback logic (e.g., random selection from approved pool) can be used.

---

## Implementation Steps

### 1. User Authentication & Profile
1. Set up Firebase project and enable Authentication providers (email/password, Google, etc.).
2. Integrate Firebase Auth SDK into the app.
3. Build login/signup UI components.
4. Store user profile data in Firestore if needed.
5. Create a personal gallery/dashboard page that queries drawings by user ID.

### 2. Drawing Submission
1. Build or integrate the drawing builder in the app.
2. Implement file upload to Firebase Storage upon submission.
3. Save drawing metadata (name, category, user info, status) to Firestore.
4. Update user gallery to reflect new submissions and their statuses.

### 3. Drawing Sharing
1. Add a "Share" button to each drawing in the user's gallery.
2. Generate a unique, public URL (using drawing ID or a generated shareId).
3. Create a public route/page for viewing shared drawings.
4. Optionally, track sharing status in Firestore (`isShared: true`).

### 4. Admin Review & Approval
1. Build an admin-only dashboard (protected by Auth/roles).
2. List all pending submissions with previews and metadata.
3. Add approve/deny actions that update the status in Firestore.
4. Allow admin to assign approved drawings to categories and future dates.

### 5. Daily Release System & Game Logic
1. Design a data structure in Firestore for scheduling daily drawings and categories.
2. Implement logic to fetch the 4 assigned drawings/categories for the current date.
3. Display the daily set in the app for users to play with.
4. Add fallback logic to select random approved drawings if no assignments exist for a date.

---

## Rules & Additional Requirements

1. Users can submit up to 4 drawings per day.
2. Users may un-share or delete private (unsubmitted) drawings, but cannot delete or modify drawings once submitted for review.
3. Admins have full control to remove or move any drawing from the schedule.
4. Admin console will show an alert if any category/drawing spot is unassigned within 24 hours of its scheduled date.
5. Admins can disable users from submitting drawings (for abuse prevention).
6. Users can un-share a public link; admins can also revoke any public link.
7. Once submitted for review, users lose control over the drawing (cannot delete or make unavailable).
8. Users may opt-in for email notifications when their drawing is approved.
9. Users will be asked for a 'display name' to give credit if their drawing is used.
10. Analytics will track user engagement, sharing, category difficulty, and repeat visits.

## Implementation Phases

### Phase 1: Core Features (MVP)
- User Authentication & Profile (login/signup, display name, personal gallery)
- Drawing Submission (limit 4/day, upload, metadata, status tracking)
- Drawing Sharing (unique public URL, share/unshare, admin revoke)
- Admin Review & Approval (dashboard, approve/deny, assign to schedule, full admin control)
- Daily Release System & Game Logic (assign drawings to categories/dates, fallback logic)
- Storage organization for drawings and metadata (recommendation needed)

### Phase 2: Quality of Life & Advanced Features
- Admin alerts for unscheduled categories/drawings within 24 hours
- Admin ability to disable users from submitting
- Email notifications for users (approval, etc.)
- Analytics dashboard (track plays, shares, category difficulty, repeat visits)
- User display name for credit
- Abuse prevention and moderation tools (reporting, admin actions)
- Enhanced admin controls (bulk actions, reschedule, revoke links)
- Advanced sharing controls (user/admin revocation, public/private toggling)

---

This document will be updated as features are further defined and implemented.
