# LearnWithMe — Production Deployment & Firebase Setup Guide

This document provides the complete configuration, environment variables, Firebase rules, and step-by-step instructions to deploy **LearnWithMe** to **Vercel** in production.

---

## 1. Build & Production Configuration

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **SPA Routing (`vercel.json`)**: Already configured in `/vercel.json` to rewrite all routes (`/blogs`, `/blog/:slug`, `/categories`, `/projects`, `/about`, `/contact`, `/admin`) to `/index.html`.

---

## 2. Firebase Project & Security Configuration

Your application is currently wired to your provisioned Firebase project in `/firebase-applet-config.json`:
- **Firebase Project ID**: `tranquil-bazaar-xt86m`
- **Firestore Database ID**: `ai-studio-f97b6181-7fd1-468f-a454-dcdf3e341a95`
- **Authorized Admin Email**: `guna.chinnu07@gmail.com`

### Manual Checklist in Firebase Console (Before Production Launch)

1. **Authorized Domains for Google Sign-In**:
   - Open [Firebase Console → Authentication → Settings → Authorized domains](https://console.firebase.google.com/project/tranquil-bazaar-xt86m/authentication/settings).
   - Add your Vercel production domain (e.g., `learnwithme.vercel.app`) so Google Popup Sign-In works on your deployed URL.
2. **Firestore Security Rules (`/firestore.rules`)**:
   - Already deployed to your database (`ai-studio-f97b6181-7fd1-468f-a454-dcdf3e341a95`).
   - Enforces that public visitors can only read published articles (`status == 'published'`), while only the verified administrator (`guna.chinnu07@gmail.com`) can create, edit, or delete articles, categories, projects, and profile info.
3. **Firebase Storage Rules (`/storage.rules`)**:
   - If you use Firebase Storage for high-resolution cover uploads, enable **Storage** in the Firebase Console and publish the rules located in `/storage.rules`.

---

## 3. Environment Variables for Vercel

When importing the project into Vercel, configure these environment variables in **Project Settings → Environment Variables** (if overriding `firebase-applet-config.json`):

| Variable | Description |
| :--- | :--- |
| `VITE_FIREBASE_PROJECT_ID` | `tranquil-bazaar-xt86m` |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | `ai-studio-f97b6181-7fd1-468f-a454-dcdf3e341a95` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `tranquil-bazaar-xt86m.firebasestorage.app` |
| `VITE_ADMIN_EMAIL` | `guna.chinnu07@gmail.com` |

*(Note: Never place private service-account keys or server secrets in `VITE_*` variables.)*

---

## 4. Step-by-Step Vercel Deployment Steps

1. Push this repository to your GitHub account.
2. Log in to [Vercel](https://vercel.com) and click **Add New... → Project**.
3. Import your **LearnWithMe** GitHub repository.
4. Confirm the build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.
6. Once Vercel assigns your production domain, add that domain to **Firebase Console → Authentication → Settings → Authorized domains**.
