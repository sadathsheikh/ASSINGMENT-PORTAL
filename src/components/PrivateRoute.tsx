import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ReactNode } from 'react';
import { Center, Spinner } from '@chakra-ui/react';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: 'teacher' | 'student';
}

export function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { currentUser, loading } = useAuth();

  console.log('PrivateRoute - currentUser:', currentUser);
  console.log('PrivateRoute - requiredRole:', requiredRole);
  console.log('PrivateRoute - loading:', loading);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // Check if user is authenticated
  if (!currentUser) {
    console.log('No current user, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Check if user has the required role
  if (requiredRole && currentUser.role !== requiredRole) {
    console.log(`Role mismatch. User role: ${currentUser.role}, Required: ${requiredRole}, Redirecting to ${currentUser.role}-dashboard`);
    return <Navigate to={`/${currentUser.role}-dashboard`} />;
  }

  console.log('PrivateRoute allowing access');
  return <>{children}</>;
}