# Boomerang
A secure lost-and-found platform built for North Creek High School. Just like a boomerang comes back when thrown with precision, our system ensures that lost items return to the correct person through intentional security, verification, and user-centered design.


## Overview

Boomerang is a web platform for reporting, browsing, and reclaiming lost items on campus.  
It replaces the ineffective “box in the corner” with a **verified, secure, and school-authenticated** system.

The platform includes two user roles:

- **Students (apps.nsd.org sign-in)** — report found items, browse listings, submit claims.
- **Admins (nsd.org sign-in)** — verify found items, approve listings, review claims, and confirm ownership.

Boomerang was created for **North Creek High School** and uses school-domain authentication for enhanced security.

---

## Key Features

### 1. Authentication (School-Restricted)
- Students log in with `@apps.nsd.org`.
- Admins log in with `@nsd.org`.
- Restricts access to the school community only.
- Minimizes spam, phishing attempts, and external misuse.

### 2. Verification Questions (Core Security Layer)
When a finder submits an item:
- They answer **private verification questions** only the true owner would know.
- Answers are **hashed** and **never publicly visible**.
- Public listings remain intentionally vague.

When a claimant requests an item:
- They must answer the same verification prompts.
- Admin sees a **match score** between hashed finder and claimant responses.

This prevents:
- False claims  
- Opportunistic guessing  
- Description-based theft  

### 3. Vague Public Listings
A public listing hides sensitive details:
- Instead of “Blue AirPods case with Supreme sticker,” it displays “Small electronics case.”
- Brand, color, and unique identifiers stay hidden from the public feed and are visible only to admin.

### 4. Admin Review Pipeline
Admins verify:
- Item legitimacy (to prevent prank/fake postings)
- Match scores for claims
- Physical item delivery to the office

Statuses include:
- **Pending Item Submission**
- **Approved: Listed Publicly**
- **Claim Requested**
- **Ready to Claim**

### 5. User Dashboards
Each user has a tailored dashboard:
- **Finders** track submitted items.
- **Claimants** track active claims and pickup readiness.
- **Admins** manage the entire pipeline from one interface.

---

## The Why Behind the What

Boomerang addresses several major security pain points in traditional lost-and-found systems:

### Core Problems
- **False Claims** — Someone pretends an item is theirs.
- **False Postings** — Fake items or pranks clutter the system.
- **Privacy Leaks** — Overly specific public details enable theft.
- **Identity & Ownership Verification** — Hard to enforce without structured questions.

### Our Architecture Solves These Problems By:
1. **Using a Verification Question System**  
   - The single strongest protection against impersonation.  
   - Answers are hashed using industry-standard practices.

2. **Restricting Access via School Authentication**  
   - Ensures only real North Creek students/admins interact with the system.

3. **Separating Public and Private Data**  
   - Public feed = minimal detail  
   - Admin view = full detail + match scoring

4. **Implementing Admin Checkpoints**  
   - Human approval prevents spam, pranks, and incorrect claims.

5. **Logging & Dashboards**  
   - Provides transparency, reduces errors, and helps track item status.

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Firebase, Cloudinary  
- **Database:** Firestore (Firebase) 
- **Authentication:** Email restricted to school domains  
- **Security:** Hashed verification responses, server-side validation, admin moderation

---

## Sources & Research
Include any sources used for:
- Security best practices  
- Hashing methods  
- User authentication protocols  
- UI/UX architecture references

(Examples)
- OWASP Verification Requirements  
- NIST Password & Security Guidelines  
- Google OAuth 2.0 Documentation  

---

## Closing Thought

Boomerangs don’t return because they want to.  
They return because they’re **designed** to.

Boomerang is built on the same principle —  
**a system engineered to bring lost items back home, reliably and securely.**

