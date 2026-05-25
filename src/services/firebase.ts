import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, query, where, orderBy, deleteDoc, updateDoc, serverTimestamp, DocumentData } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Collections
const USERS_COLLECTION = 'users';
const ASSIGNMENTS_COLLECTION = 'assignments';
const SUBMISSIONS_COLLECTION = 'submissions';

// Authentication Services
export const authService = {
  // Sign in existing user
  login: (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  // Create new user
  register: async (email: string, password: string, name: string, role: 'student' | 'teacher') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await setDoc(doc(db, USERS_COLLECTION, user.uid), {
      name,
      email,
      role,
      createdAt: serverTimestamp(),
    });
    
    return userCredential;
  },

  // Sign out user
  logout: () => {
    return signOut(auth);
  },

  // Get current user
  getCurrentUser: () => {
    return new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  // Get user profile data
  getUserProfile: async (userId: string): Promise<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: any;
  } | null> => {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as {
        id: string;
        name: string;
        email: string;
        role: string;
        createdAt: any;
      };
    }
    
    return null;
  }
};

// Assignment Services
export const assignmentService = {
  // Create a new assignment
  createAssignment: async (data: {
    title: string;
    description: string;
    dueDate: string;
    totalPoints: number;
    requirements?: string[];
    createdBy: string;
  }) => {
    try {
      const docRef = await addDoc(collection(db, ASSIGNMENTS_COLLECTION), {
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating assignment:", error);
      throw error;
    }
  },

  // Get all assignments
  getAllAssignments: async () => {
    try {
      const q = query(collection(db, ASSIGNMENTS_COLLECTION), orderBy("dueDate", "asc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting assignments:", error);
      throw error;
    }
  },

  // Get assignments created by a specific teacher
  getTeacherAssignments: async (teacherId: string) => {
    try {
      const q = query(
        collection(db, ASSIGNMENTS_COLLECTION),
        where("createdBy", "==", teacherId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting teacher assignments:", error);
      throw error;
    }
  },

  // Get a single assignment by ID
  getAssignmentById: async (assignmentId: string) => {
    try {
      const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error getting assignment:", error);
      throw error;
    }
  },

  // Update an assignment
  updateAssignment: async (assignmentId: string, updates: Partial<DocumentData>) => {
    try {
      const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Error updating assignment:", error);
      throw error;
    }
  },

  // Delete an assignment
  deleteAssignment: async (assignmentId: string) => {
    try {
      const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting assignment:", error);
      throw error;
    }
  }
};

// Submission Services
export const submissionService = {
  // Create a new submission
  createSubmission: async (data: {
    studentId: string;
    assignmentId: string;
    content: string;
    images?: string[];
  }) => {
    try {
      const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
        ...data,
        images: data.images || [],
        submittedAt: serverTimestamp(),
        status: "submitted"
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating submission:", error);
      throw error;
    }
  },

  // Get submissions for a specific assignment
  getSubmissionsByAssignment: async (assignmentId: string) => {
    try {
      const q = query(
        collection(db, SUBMISSIONS_COLLECTION),
        where("assignmentId", "==", assignmentId),
        orderBy("submittedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting submissions:", error);
      throw error;
    }
  },

  // Get submissions by a specific student
  getStudentSubmissions: async (studentId: string) => {
    try {
      const q = query(
        collection(db, SUBMISSIONS_COLLECTION),
        where("studentId", "==", studentId),
        orderBy("submittedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting student submissions:", error);
      throw error;
    }
  },

  // Get submission by student and assignment
  getSubmissionByStudentAndAssignment: async (studentId: string, assignmentId: string) => {
    try {
      const q = query(
        collection(db, SUBMISSIONS_COLLECTION),
        where("studentId", "==", studentId),
        where("assignmentId", "==", assignmentId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error getting submission:", error);
      throw error;
    }
  },

  // Update a submission
  updateSubmission: async (submissionId: string, updates: Partial<DocumentData>) => {
    try {
      const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Error updating submission:", error);
      throw error;
    }
  },

  // Grade a submission
  gradeSubmission: async (submissionId: string, grade: number, feedback?: string) => {
    try {
      const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
      await updateDoc(docRef, {
        grade,
        feedback,
        status: "graded"
      });
    } catch (error) {
      console.error("Error grading submission:", error);
      throw error;
    }
  }
};

// User Services
export const userService = {
  // Get all students
  getAllStudents: async () => {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where("role", "==", "student")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting students:", error);
      throw error;
    }
  }
};