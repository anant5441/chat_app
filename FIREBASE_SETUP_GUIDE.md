# 🔥 New Firebase Project Setup Guide

Follow these steps to create a separate Firebase project for the user-to-user chat system.

---

## Step 1: Create New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `chat-app-user-to-user` (or your preferred name)
4. Click **Continue**
5. Disable Google Analytics (optional) or configure it
6. Click **Create project**
7. Wait for project creation to complete

---

## Step 2: Register Web App

1. In your new Firebase project dashboard, click the **Web icon** (`</>`)
2. Enter app nickname: `Chat App Web`
3. **Do NOT** check "Firebase Hosting" (unless you want it)
4. Click **Register app**
5. **Copy the Firebase configuration object** - you'll need this!

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:...",
  measurementId: "G-..."
};
```

6. Click **Continue to console**

---

## Step 3: Enable Authentication

1. In the left sidebar, click **Build** → **Authentication**
2. Click **Get started**
3. Click on **Google** provider
4. Toggle **Enable**
5. Select a **Support email** from dropdown
6. Click **Save**

---

## Step 4: Create Firestore Database

1. In the left sidebar, click **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (we'll add security rules later)
4. Click **Next**
5. Choose your **Cloud Firestore location** (select closest to your users)
6. Click **Enable**

---

## Step 5: Update Security Rules (Important!)

Once Firestore is created:

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - authenticated users can read all, write own
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chats collection
    match /chats/{chatId} {
      // Allow read if document doesn't exist (for checking before create) 
      // OR if user is a participant
      allow read: if request.auth != null && 
        (resource == null || request.auth.uid in resource.data.users);

      // Allow create if user is a participant in the new data
      allow create: if request.auth != null && 
        request.resource.data.users.size() == 2 &&
        request.auth.uid in request.resource.data.users;
      
      // Allow update if user is a participant
      allow update: if request.auth != null && request.auth.uid in resource.data.users;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.users;
        allow create: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.users;
      }
    }
  }
}

3. Click **Publish**

---

## Step 6: Create Firestore Indexes

1. Go to **Firestore Database** → **Indexes** tab
2. Click **Create Index**

**Index 1: Messages by createdAt**
- Collection ID: `messages`
- Fields to index:
  - Field: `createdAt` | Order: `Ascending`
- Query scope: `Collection`
- Click **Create**
**Note:** You may be prompted to create additional indexes when running the app. Firebase will provide direct links to create them.

---

## Step 7: Update Your App Configuration

1. Open `src/firebase-config.js` in your project
2. Replace the `firebaseConfig` object with your **new project's config** (from Step 2)
3. Save the file

---

## Step 8: Test the Setup

1. Run your app: `npm run dev`
2. Try signing in with Google
3. Check Firebase Console → **Authentication** → **Users** to see if user appears
4. Check **Firestore Database** to see if user document is created

---

## ✅ Checklist

- [ ] Created new Firebase project
- [ ] Registered web app and copied config
- [ ] Enabled Google Authentication
- [ ] Created Firestore Database
- [ ] Updated security rules
- [ ] Created Firestore indexes (or will create when prompted)
- [ ] Updated `firebase-config.js` with new config
- [ ] Tested authentication

---

## 🔒 Security Notes

- The security rules above ensure:
  - Only authenticated users can access data
  - Users can only update their own profile
  - Only chat participants can read/write messages
- For production, consider adding more granular rules
- Never commit Firebase config with sensitive keys to public repos (use environment variables)

---

## 🆘 Troubleshooting

**Issue: "Firebase: Error (auth/unauthorized-domain)"**
- Go to **Authentication** → **Settings** → **Authorized domains**
- Add `localhost` if not present

**Issue: "Missing or insufficient permissions"**
- Check Firestore security rules are published
- Verify user is authenticated
- Check browser console for detailed errors

**Issue: "The query requires an index"**
- Click the link in the error message
- Or manually create index in Firebase Console

---

## 📝 Next Steps

After setup is complete:
1. The app will use the new Firebase project
2. Your old project data remains untouched
3. You can switch back by reverting `firebase-config.js`
