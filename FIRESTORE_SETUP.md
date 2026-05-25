# Firestore Setup Guide for Assignment Portal

## Step 1: Firebase Console Setup

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create a new project** (or use existing one):
   - Click "Add project"
   - Enter project name (e.g., "assignment-portal")
   - Enable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Firestore Database

1. **In your Firebase project dashboard**:
   - Click on "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location (choose closest to your users)
   - Click "Done"

## Step 3: Enable Authentication

1. **Click "Authentication" in the left sidebar**
2. **Go to "Sign-in method" tab**
3. **Enable Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 4: Get Firebase Configuration

1. **Click the gear icon** next to "Project Overview"
2. **Select "Project settings"**
3. **Scroll down to "Your apps"**
4. **Click the web icon (</>)** to add a web app
5. **Register your app**:
   - App nickname: "Assignment Portal"
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
6. **Copy the configuration object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  measurementId: "G-XXXXXXXXXX"
};
```

## Step 5: Update Environment Variables

Create/update your `.env` file with the Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Step 6: Set Up Firestore Security Rules

1. **In Firestore Database**, go to "Rules" tab
2. **Replace the default rules** with these TEMPORARY rules for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allow all reads and writes for development
    // TODO: Replace with proper security rules after initial setup
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANT**: These rules allow anyone to read/write your database. This is only for development setup. After everything works, replace with these production rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users for teacher dashboard
    }
    
    // Assignments - teachers can create/update/delete, everyone can read
    match /assignments/{assignmentId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    // Submissions - students can create their own, teachers can read/update for grading
    match /submissions/{submissionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.studentId;
      allow update: if request.auth != null && (
        // Students can update their own submissions (before grading)
        (request.auth.uid == resource.data.studentId && resource.data.status != 'graded') ||
        // Teachers can update for grading
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher')
      );
    }
  }
}
```</to_replace>
</Editor.edit_file_by_replace>

<Editor.edit_file_by_replace>
<file_name>/workspace/uploads/AssignmentPortal-New/src/components/InitializeFirebase.tsx</file_name>
<to_replace>  const initializeFirebase = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Starting Firebase initialization...');
      
      // First, create demo users
      console.log('Creating demo users...');
      
      // Create teacher account
      try {
        const teacherCredential = await authService.register(
          'teacher@example.com',
          'password123',
          'Demo Teacher',
          'teacher'
        );
        console.log('Teacher created:', teacherCredential.user.uid);
      } catch (err: any) {
        if (err.code !== 'auth/email-already-in-use') {
          throw err;
        }
        console.log('Teacher account already exists');
      }
      
      // Create student account
      try {
        const studentCredential = await authService.register(
          'student@example.com',
          'password123',
          'Demo Student',
          'student'
        );
        console.log('Student created:', studentCredential.user.uid);
      } catch (err: any) {
        if (err.code !== 'auth/email-already-in-use') {
          throw err;
        }
        console.log('Student account already exists');
      }
      
      // Sign in as teacher to create demo assignments
      console.log('Signing in as teacher to create demo data...');
      const teacherAuth = await authService.login('teacher@example.com', 'password123');
      const teacherProfile = await authService.getUserProfile(teacherAuth.user.uid);
      
      if (!teacherProfile) {
        throw new Error('Teacher profile not found');
      }
      
      // Create demo assignments
      console.log('Creating demo assignments...');
      
      const demoAssignments = [
        {
          title: 'Essay on Climate Change',
          description: 'Write a 500-word essay discussing the impacts of climate change on global agriculture.',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          totalPoints: 100,
          requirements: [
            'Minimum 500 words',
            'Include at least 3 credible sources',
            'Proper citation format required',
            'Submit in PDF format'
          ],
          createdBy: teacherAuth.user.uid
        },
        {
          title: 'Math Problem Set 3',
          description: 'Complete problems 1-20 from Chapter 3 of the textbook. Show all work for full credit.',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          totalPoints: 50,
          requirements: [
            'Show all calculation steps',
            'Include final answers clearly marked',
            'Use proper mathematical notation'
          ],
          createdBy: teacherAuth.user.uid
        },
        {
          title: 'Science Lab Report',
          description: 'Document your findings from the chemistry experiment conducted in class.',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
          totalPoints: 75,
          requirements: [
            'Include hypothesis and methodology',
            'Present data in tables/graphs',
            'Analyze results and draw conclusions',
            'Follow lab report template'
          ],
          createdBy: teacherAuth.user.uid
        }
      ];
      
      for (const assignment of demoAssignments) {
        const assignmentId = await assignmentService.createAssignment(assignment);
        console.log('Created assignment:', assignmentId);
      }
      
      // Sign out teacher
      await authService.logout();
      console.log('Demo data creation completed successfully!');
      
      toast({
        title: 'Firebase Initialized',
        description: 'Demo users and assignments have been created successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onSuccess?.();
      
    } catch (err: any) {
      console.error('Firebase initialization error:', err);
      setError(err.message || 'Failed to initialize Firebase');
      
      toast({
        title: 'Initialization Failed',
        description: err.message || 'Failed to initialize Firebase',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };</to_replace>
<new_content>  const initializeFirebase = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Starting Firebase initialization...');
      
      // Check if Firebase is properly configured
      if (!import.meta.env.VITE_FIREBASE_API_KEY) {
        throw new Error('Firebase configuration missing. Please set up your .env file with Firebase credentials.');
      }
      
      // First, create demo users
      console.log('Creating demo users...');
      
      // Create teacher account
      let teacherUid = '';
      try {
        const teacherCredential = await authService.register(
          'teacher@example.com',
          'password123',
          'Demo Teacher',
          'teacher'
        );
        teacherUid = teacherCredential.user.uid;
        console.log('Teacher created:', teacherUid);
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          console.log('Teacher account already exists, signing in...');
          const teacherAuth = await authService.login('teacher@example.com', 'password123');
          teacherUid = teacherAuth.user.uid;
        } else {
          console.error('Error creating teacher:', err);
          throw new Error(`Failed to create teacher account: ${err.message}`);
        }
      }
      
      // Create student account
      let studentUid = '';
      try {
        const studentCredential = await authService.register(
          'student@example.com',
          'password123',
          'Demo Student',
          'student'
        );
        studentUid = studentCredential.user.uid;
        console.log('Student created:', studentUid);
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          console.log('Student account already exists');
          // Get student UID by signing in temporarily
          const studentAuth = await authService.login('student@example.com', 'password123');
          studentUid = studentAuth.user.uid;
          await authService.logout();
        } else {
          console.error('Error creating student:', err);
          throw new Error(`Failed to create student account: ${err.message}`);
        }
      }
      
      // Sign in as teacher to create demo assignments
      console.log('Signing in as teacher to create demo data...');
      const teacherAuth = await authService.login('teacher@example.com', 'password123');
      
      // Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create demo assignments
      console.log('Creating demo assignments...');
      
      const demoAssignments = [
        {
          title: 'Essay on Climate Change',
          description: 'Write a 500-word essay discussing the impacts of climate change on global agriculture.',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          totalPoints: 100,
          requirements: [
            'Minimum 500 words',
            'Include at least 3 credible sources',
            'Proper citation format required',
            'Submit in PDF format'
          ],
          createdBy: teacherUid
        },
        {
          title: 'Math Problem Set 3',
          description: 'Complete problems 1-20 from Chapter 3 of the textbook. Show all work for full credit.',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          totalPoints: 50,
          requirements: [
            'Show all calculation steps',
            'Include final answers clearly marked',
            'Use proper mathematical notation'
          ],
          createdBy: teacherUid
        },
        {
          title: 'Science Lab Report',
          description: 'Document your findings from the chemistry experiment conducted in class.',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
          totalPoints: 75,
          requirements: [
            'Include hypothesis and methodology',
            'Present data in tables/graphs',
            'Analyze results and draw conclusions',
            'Follow lab report template'
          ],
          createdBy: teacherUid
        }
      ];
      
      const createdAssignments = [];
      for (const assignment of demoAssignments) {
        try {
          const assignmentId = await assignmentService.createAssignment(assignment);
          createdAssignments.push(assignmentId);
          console.log('Created assignment:', assignmentId);
        } catch (assignmentError: any) {
          console.error('Error creating assignment:', assignmentError);
          // Continue with other assignments even if one fails
        }
      }
      
      // Sign out teacher
      await authService.logout();
      console.log('Demo data creation completed successfully!');
      
      toast({
        title: 'Firebase Initialized Successfully!',
        description: `Created ${createdAssignments.length} demo assignments. You can now log in with teacher@example.com or student@example.com (password: password123)`,
        status: 'success',
        duration: 8000,
        isClosable: true,
      });
      
      onSuccess?.();
      
    } catch (err: any) {
      console.error('Firebase initialization error:', err);
      const errorMessage = err.message || 'Failed to initialize Firebase';
      setError(errorMessage);
      
      toast({
        title: 'Initialization Failed',
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

3. **Click "Publish"**

## Step 7: Test the Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Go to your application** (http://localhost:8084/)

3. **Click "Initialize Firebase"** on the home page

4. **Check if demo users are created** in Firebase Console:
   - Go to Authentication > Users
   - You should see teacher@example.com and student@example.com

5. **Check if demo data is created** in Firestore:
   - Go to Firestore Database
   - You should see collections: users, assignments

## Troubleshooting

### Common Issues:

1. **"Firebase configuration not found"**:
   - Make sure your `.env` file is in the project root
   - Restart the development server after updating `.env`

2. **"Permission denied" errors**:
   - Check Firestore security rules
   - Make sure users are authenticated before accessing data

3. **"Collection doesn't exist"**:
   - Run the Firebase initialization in your app
   - Check if data was created in Firebase Console

4. **Authentication not working**:
   - Verify Email/Password is enabled in Firebase Console
   - Check if users exist in Authentication > Users

## Next Steps

After setup is complete:
1. Test login with demo accounts
2. Create assignments as teacher
3. Submit assignments as student
4. Grade submissions as teacher

## Production Considerations

For production deployment:
1. Update Firestore rules to be more restrictive
2. Set up proper error handling
3. Enable Firebase App Check for security
4. Monitor usage in Firebase Console