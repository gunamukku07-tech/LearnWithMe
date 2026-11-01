# LearnWithMe — Firebase Hosting & Production Deployment Guide

This document provides the complete configuration, environment variables, security rules, and step-by-step instructions to deploy **LearnWithMe** to **Firebase Hosting** using your existing Firebase project (`tranquil-bazaar-xt86m`).

---

## 1. Firebase Project & Configuration Summary

Your application is configured to use your existing Firebase resources without creating any duplicate projects or databases:

- **Firebase Project ID** (`.firebaserc`): `tranquil-bazaar-xt86m`
- **Firestore Named Database ID** (`firebase.json` & `firebase-applet-config.json`): `ai-studio-f97b6181-7fd1-468f-a454-dcdf3e341a95`
- **Storage Bucket**: `tranquil-bazaar-xt86m.firebasestorage.app`
- **Authorized Admin Email**: `guna.chinnu07@gmail.com`
- **Build Command**: `npm run build`
- **Public Hosting Directory**: `dist`
- **SPA Routing**: All routes (`**`) rewrite to `/index.html` for React Router (`BrowserRouter`).

---

## 2. Step-by-Step Firebase Hosting Deployment

When you are ready to deploy from your terminal:

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Sign in to Firebase**:
   ```bash
   firebase login
   ```

3. **Build the production bundle (`dist/`)**:
   ```bash
   npm run build
   ```

4. **Deploy to Firebase Hosting**:
   ```bash
   firebase deploy --only hosting
   ```
   *(To also deploy Firestore or Storage security rules later, you can run `firebase deploy --only firestore:rules` or `firebase deploy --only storage`.)*

---

## 3. Pre-Launch Checklist in Firebase Console

1. **Authorized Domains for Google Sign-In**:
   - Open [Firebase Console → Authentication → Settings → Authorized domains](https://console.firebase.google.com/project/tranquil-bazaar-xt86m/authentication/settings).
   - Ensure `tranquil-bazaar-xt86m.web.app` and `tranquil-bazaar-xt86m.firebaseapp.com` (plus any custom domain you connect) are listed so Google Sign-In works on your live site.
2. **Firestore Security Rules (`/firestore.rules`)**:
   - Bound to your named database `ai-studio-f97b6181-7fd1-468f-a454-dcdf3e341a95` in `firebase.json`.
   - Enforces public read access only for published articles (`status == 'published'`) and restricts all write operations to `guna.chinnu07@gmail.com`.
3. **Firebase Storage Rules (`/storage.rules`)**:
   - Bound in `firebase.json` to `/storage.rules`.
   - Allows public read on `/covers/{imageId}` and restricts uploads (image MIME types up to 5 MB) to `guna.chinnu07@gmail.com`.

---

## 4. Environment Variables (Optional Override)

By default, `src/firebase.ts` automatically reads your client configuration from `firebase-applet-config.json`. If you ever use a CI/CD pipeline or `.env.production` file, `src/firebase.ts` also supports `VITE_FIREBASE_*` overrides (see `.env.example`). Never store private service-account keys in `VITE_*` variables.
