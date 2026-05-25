import { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../services/firebase';
import { 
  Box, 
  Button, 
  Center, 
  Heading, 
  Spinner, 
  Text, 
  VStack, 
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Code,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

// Demo data for initialization
const demoUsers = [
  {
    email: 'teacher@example.com',
    password: 'password123',
    name: 'Demo Teacher',
    role: 'teacher',
  },
  {
    email: 'student@example.com',
    password: 'password123',
    name: 'Demo Student',
    role: 'student',
  },
];

const demoAssignments = [
  {
    title: 'Introduction to React Hooks',
    description: 'Create a simple application that demonstrates the use of useState, useEffect, and useContext hooks.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    totalPoints: 100,
    requirements: [
      'Implement useState for form handling',
      'Use useEffect for data fetching',
      'Implement useContext for theme management',
      'Add comments explaining the code'
    ],
  },
  {
    title: 'Build a To-Do List Application',
    description: 'Create a fully functional to-do list application with the ability to add, complete, and delete tasks.',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    totalPoints: 150,
    requirements: [
      'Task input field with validation',
      'List of tasks with completion status',
      'Delete task functionality',
      'Filter tasks (All/Active/Completed)',
      'Persist data using localStorage'
    ],
  },
];

export default function InitializeFirebase() {
  const [initializing, setInitializing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const toast = useToast();

  const addToLog = (message: string) => {
    setLog(prev => [...prev, message]);
  };

  const handleInitializeFirebase = async () => {
    setInitializing(true);
    setError(null);
    setLog([]);

    try {
      // Check if demo data already exists
      addToLog("Checking if demo data already exists...");
      const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
      if (!assignmentsSnapshot.empty) {
        addToLog("Demo data already exists!");
        setCompleted(true);
        setInitializing(false);
        return;
      }

      addToLog("Creating demo users...");
      // Create demo users
      for (const user of demoUsers) {
        try {
          // Check if user already exists
          const userEmail = user.email.toLowerCase();
          
          addToLog(`Creating user: ${userEmail}`);
          
          // Create user in Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            userEmail,
            user.password
          );
          
          // Add user profile to Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: user.name,
            email: userEmail,
            role: user.role,
            createdAt: serverTimestamp(),
          });
          
          addToLog(`✅ Created ${user.role}: ${userEmail}`);
          
          // If this is the teacher, create assignments
          if (user.role === 'teacher') {
            addToLog("Creating demo assignments...");
            
            for (const assignment of demoAssignments) {
              const assignmentRef = await addDoc(collection(db, 'assignments'), {
                ...assignment,
                createdBy: userCredential.user.uid,
                createdAt: serverTimestamp(),
              });
              
              addToLog(`✅ Created assignment: ${assignment.title}`);
            }
          }
        } catch (err: any) {
          // If the user already exists, continue
          if (err.code === 'auth/email-already-in-use') {
            addToLog(`⚠️ User ${user.email} already exists, skipping...`);
          } else {
            throw err;
          }
        }
      }

      setCompleted(true);
      addToLog("✅ Initialization completed successfully!");
      
      toast({
        title: "Initialization completed",
        description: "Demo data has been added to Firebase.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      console.error("Error initializing Firebase:", err);
      setError(err.message || 'Unknown error occurred');
      
      toast({
        title: "Initialization failed",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setInitializing(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <Heading size="md">Firebase Initialization</Heading>
        
        <Text>
          Initialize Firebase with demo data to get started with the application.
          This will create demo users and assignments.
        </Text>
        
        <List spacing={2}>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="green.500" />
            Teacher account: teacher@example.com / password123
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="green.500" />
            Student account: student@example.com / password123
          </ListItem>
        </List>

        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {log.length > 0 && (
          <Box 
            bg="gray.50" 
            p={3} 
            borderRadius="md"
            maxHeight="200px"
            overflowY="auto"
            fontSize="sm"
            fontFamily="monospace"
          >
            {log.map((entry, i) => (
              <Text key={i}>{entry}</Text>
            ))}
          </Box>
        )}

        <Button
          colorScheme="blue"
          onClick={handleInitializeFirebase}
          isLoading={initializing}
          loadingText="Initializing"
          isDisabled={completed}
        >
          {completed ? "Initialization Completed" : "Initialize Firebase"}
        </Button>
      </VStack>
    </Box>
  );
}